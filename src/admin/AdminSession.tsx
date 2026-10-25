import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import '../resources/css/adminSession.scss'
import type { SessionDto, SessionLookUpDto } from '../types/Session/session'
import { getSessionLookUp, getSessions } from '../services/sessionService'
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from '@tabler/icons-react'

type SessionSortField =
    | 'customerId'
    | 'parkingAreaId'
    | 'parkingSpotId'
    | 'exitTime'
    | 'entryTime'
    | 'checkInStaffId'
    | 'checkOutStaffId'
    | 'ticketCode'
    | 'fee'
type SortDirection = 'asc' | 'desc' | null
type SessionFilters = {
    minFee?: number
    maxFee?: number
    entryFrom?: string
    entryTo?: string
    exitFrom?: string
    exitTo?: string
    checkInStaffId?: number
    checkOutStaffId?: number
    customerId?: number
    parkingAreaId?: number
    parkingSpotId?: number
}
type SessionFilterDraft = {
    minFee: string
    maxFee: string
    entryFrom: string
    entryTo: string
    exitFrom: string
    exitTo: string
    checkInStaffId: string
    checkOutStaffId: string
    customerId: string
    parkingAreaId: string
    parkingSpotId: string
}

const emptyFilterDraft: SessionFilterDraft = {
    minFee: '',
    maxFee: '',
    entryFrom: '',
    entryTo: '',
    exitFrom: '',
    exitTo: '',
    checkInStaffId: '',
    checkOutStaffId: '',
    customerId: '',
    parkingAreaId: '',
    parkingSpotId: '',
}

const backendSortField: Record<SessionSortField, string> = {
    customerId: 'CustomerId',
    parkingAreaId: 'ParkingAreaId',
    parkingSpotId: 'ParkingSpotId',
    exitTime: 'ExitTime',
    entryTime: 'EntryTime',
    checkInStaffId: 'CheckInStaffId',
    checkOutStaffId: 'CheckOutStaffId',
    ticketCode: 'TicketCode',
    fee: 'Fee',
}

const formatSessionDate = (value: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getSessionStatus = (status: number, fallbackName: string) => {
    switch (status) {
        case 0:
            return { label: 'Active', className: 'active' }
        case 1:
            return { label: 'Paid', className: 'paid' }
        case 2:
            return { label: 'Pending payment', className: 'pending-payment' }
        default:
            return { label: fallbackName, className: 'unknown' }
    }
}

const AdminSession = ({ readOnly = false }: { readOnly?: boolean }) =>{
    const [isLoading,setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [sessions, setSessions] = useState<SessionDto[]>([])
    const [sortField, setSortField] = useState<SessionSortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [filters, setFilters] = useState<SessionFilters>({})
    const [filterDraft, setFilterDraft] = useState<SessionFilterDraft>(emptyFilterDraft)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterError, setFilterError] = useState('')
    const [lookup, setLookup] = useState<SessionLookUpDto | null>(null)
    const [isLookupLoading, setIsLookupLoading] = useState(false)
    const [lookupError, setLookupError] = useState('')
    const filterButtonRef = useRef<HTMLButtonElement>(null)
    const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
//Search & Filter
    const [keyword, setKeyword] = useState('')    
//Pagintation
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
    const safeCurrentPage = Math.min(currentPage, pageCount)
    const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
    const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)

    const loadSessions = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage('')
        try{
            const result = await getSessions({
                 skipCount: (safeCurrentPage-1) *rowsPerPage,
                maxResultCount:rowsPerPage,
                keyword: keyword.trim() || undefined,
                 sorting: sortField && sortDirection
                     ? `${backendSortField[sortField]} ${sortDirection}`
                     : undefined,
                ...filters,
            })
            setSessions(result.items)
            setTotalCount(result.totalCount)
        }
        catch(error){
              setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách gói đăng ký.')
            setSessions([])
            setTotalCount(0)
        }
        finally{
            setIsLoading(false)
        }

    }, [filters, keyword, safeCurrentPage, rowsPerPage, sortField, sortDirection])

    useEffect(() => {
        if (!isFilterOpen) return

        const updatePosition = () => {
            const button = filterButtonRef.current
            if (!button) return
            const bounds = button.getBoundingClientRect()
            setFilterPosition({
                top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - 600)),
                right: Math.max(12, Math.min(window.innerWidth - bounds.right, window.innerWidth - 440)),
            })
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)
        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [isFilterOpen])

    const openFilters = async () => {
        if (isFilterOpen) {
            setIsFilterOpen(false)
            return
        }

        setFilterDraft({
            minFee: filters.minFee?.toString() ?? '',
            maxFee: filters.maxFee?.toString() ?? '',
            entryFrom: filters.entryFrom ?? '',
            entryTo: filters.entryTo ?? '',
            exitFrom: filters.exitFrom ?? '',
            exitTo: filters.exitTo ?? '',
            checkInStaffId: filters.checkInStaffId?.toString() ?? '',
            checkOutStaffId: filters.checkOutStaffId?.toString() ?? '',
            customerId: filters.customerId?.toString() ?? '',
            parkingAreaId: filters.parkingAreaId?.toString() ?? '',
            parkingSpotId: filters.parkingSpotId?.toString() ?? '',
        })
        setFilterError('')
        setIsFilterOpen(true)
        if (lookup || isLookupLoading) return

        setIsLookupLoading(true)
        setLookupError('')
        try {
            setLookup(await getSessionLookUp())
        } catch (error) {
            setLookupError(error instanceof Error ? error.message : 'Không thể tải lựa chọn bộ lọc.')
        } finally {
            setIsLookupLoading(false)
        }
    }

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const minFee = filterDraft.minFee ? Number(filterDraft.minFee) : undefined
        const maxFee = filterDraft.maxFee ? Number(filterDraft.maxFee) : undefined
        if (
            (minFee !== undefined && !Number.isFinite(minFee)) ||
            (maxFee !== undefined && !Number.isFinite(maxFee)) ||
            (minFee !== undefined && maxFee !== undefined && minFee > maxFee)
        ) {
            setFilterError('Minimum fee must not exceed maximum fee.')
            return
        }
        if (
            (filterDraft.entryFrom && filterDraft.entryTo && filterDraft.entryFrom > filterDraft.entryTo) ||
            (filterDraft.exitFrom && filterDraft.exitTo && filterDraft.exitFrom > filterDraft.exitTo)
        ) {
            setFilterError('Start date must not be after end date.')
            return
        }

        setFilterError('')
        setFilters({
            minFee,
            maxFee,
            entryFrom: filterDraft.entryFrom || undefined,
            entryTo: filterDraft.entryTo || undefined,
            exitFrom: filterDraft.exitFrom || undefined,
            exitTo: filterDraft.exitTo || undefined,
            checkInStaffId: filterDraft.checkInStaffId ? Number(filterDraft.checkInStaffId) : undefined,
            checkOutStaffId: filterDraft.checkOutStaffId ? Number(filterDraft.checkOutStaffId) : undefined,
            customerId: filterDraft.customerId ? Number(filterDraft.customerId) : undefined,
            parkingAreaId: filterDraft.parkingAreaId ? Number(filterDraft.parkingAreaId) : undefined,
            parkingSpotId: filterDraft.parkingSpotId ? Number(filterDraft.parkingSpotId) : undefined,
        })
        setCurrentPage(1)
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setFilterDraft(emptyFilterDraft)
        setFilters({})
        setFilterError('')
        setCurrentPage(1)
        setIsFilterOpen(false)
    }

    const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== '').length

    const handleSort = (field: SessionSortField) => {
        setCurrentPage(1)
        if (sortField !== field) {
            setSortField(field)
            setSortDirection('asc')
        } else if (sortDirection === 'asc') {
            setSortDirection('desc')
        } else {
            setSortField(null)
            setSortDirection(null)
        }
    }

    const sortIcon = (field: SessionSortField) => {
        if (sortField !== field || !sortDirection) {
            return <IconArrowsSort className="action-icon" aria-hidden="true" />
        }

        const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
        return <Icon className="action-icon" aria-hidden="true" />
    }

    const sortHeader = (field: SessionSortField, label: string) => (
        <th
            key={field}
            aria-sort={sortField === field && sortDirection
                ? sortDirection === 'asc' ? 'ascending' : 'descending'
                : 'none'}
        >
            {label}
            <button
                className="sort-button"
                type="button"
                aria-label={`Sort by ${label}`}
                onClick={() => handleSort(field)}
            >
                {sortIcon(field)}
            </button>
        </th>
    )
   
    useEffect(() => {
        void loadSessions()
    }, [loadSessions])

    return ( 
    <div className="workspace roles-workspace">
        <Sidebar/>
         <main className="main-content roles-content">
            <header className="roles-header">
                <div>
                    <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                    <h1>Sessions</h1>
                </div>    
            </header>
            <section className="roles-card session-card" aria-label="Session list">
                    <div className="roles-toolbar filter-toolbar">
                         <label className="roles-search">
                            <span aria-hidden="true"><IconSearch className="action-icon" /></span>
                              <input
                                type="search"
                                value={keyword}
                                onChange={(event) => {
                                setKeyword(event.target.value)
                                setCurrentPage(1)
                                }}
                                placeholder="Search session"
                                aria-label="Search session"
                            />
                         </label>
                         <div className="filter-wrap">
                             <button
                                ref={filterButtonRef}
                                className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                                type="button"
                                aria-label="Open session filters"
                                aria-expanded={isFilterOpen}
                                aria-controls="session-filter-popover"
                                onClick={() => void openFilters()}
                            >
                            <IconAdjustmentsHorizontal className="action-icon" aria-hidden="true" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                            </button>
                         </div>
                    </div>
                    {isFilterOpen && createPortal(
                        <form
                            className="filter-popover session-filter"
                            id="session-filter-popover"
                            aria-label="Filter sessions"
                            onSubmit={applyFilters}
                            style={{ top: filterPosition.top, right: filterPosition.right }}
                        >
                            <div className="filter-heading">
                                <strong>Filter sessions</strong>
                                <button className="filter-close" type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)}>
                                    <IconX className="action-icon" aria-hidden="true" />
                                </button>
                            </div>
                            <label className="filter-field">
                                <span>Customer</span>
                                <select
                                    value={filterDraft.customerId}
                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, customerId: event.target.value }))}
                                    disabled={isLookupLoading || !lookup}
                                >
                                    <option value="">{isLookupLoading ? 'Loading customers...' : 'All customers'}</option>
                                    {lookup?.customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.displayText}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="filter-field">
                                <span>Parking area</span>
                                <select
                                    value={filterDraft.parkingAreaId}
                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, parkingAreaId: event.target.value }))}
                                    disabled={isLookupLoading || !lookup}
                                >
                                    <option value="">{isLookupLoading ? 'Loading areas...' : 'All parking areas'}</option>
                                    {lookup?.parkingAreas.map((area) => (
                                        <option key={area.id} value={area.id}>{area.displayText}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="filter-field">
                                <span>Parking spot</span>
                                <select
                                    value={filterDraft.parkingSpotId}
                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, parkingSpotId: event.target.value }))}
                                    disabled={isLookupLoading || !lookup}
                                >
                                    <option value="">{isLookupLoading ? 'Loading spots...' : 'All parking spots'}</option>
                                    {lookup?.parkingSpots.map((spot) => (
                                        <option key={spot.id} value={spot.id}>{spot.displayText}</option>
                                    ))}
                                </select>
                            </label>
                            <fieldset className="filter-group">
                                <legend>Fee</legend>
                                <label className="filter-field">
                                    <span>Min</span>
                                    <input type="number" min="0" step="any" value={filterDraft.minFee} onChange={(event) => setFilterDraft((draft) => ({ ...draft, minFee: event.target.value }))} />
                                </label>
                                <label className="filter-field">
                                    <span>Max</span>
                                    <input type="number" min="0" step="any" value={filterDraft.maxFee} onChange={(event) => setFilterDraft((draft) => ({ ...draft, maxFee: event.target.value }))} />
                                </label>
                            </fieldset>
                            <fieldset className="filter-group">
                                <legend>Entry time</legend>
                                <label className="filter-field">
                                    <span>From</span>
                                    <input type="date" value={filterDraft.entryFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, entryFrom: event.target.value }))} />
                                </label>
                                <label className="filter-field">
                                    <span>To</span>
                                    <input type="date" value={filterDraft.entryTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, entryTo: event.target.value }))} />
                                </label>
                            </fieldset>
                            <fieldset className="filter-group">
                                <legend>Exit time</legend>
                                <label className="filter-field">
                                    <span>From</span>
                                    <input type="date" value={filterDraft.exitFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, exitFrom: event.target.value }))} />
                                </label>
                                <label className="filter-field">
                                    <span>To</span>
                                    <input type="date" value={filterDraft.exitTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, exitTo: event.target.value }))} />
                                </label>
                            </fieldset>
                            <label className="filter-field">
                                <span>Check-in staff</span>
                                <select
                                    value={filterDraft.checkInStaffId}
                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, checkInStaffId: event.target.value }))}
                                    disabled={isLookupLoading || !lookup}
                                >
                                    <option value="">{isLookupLoading ? 'Loading staff...' : 'All staff'}</option>
                                    {lookup?.staffs.map((staff) => (
                                        <option key={staff.id} value={staff.id}>{staff.displayText}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="filter-field">
                                <span>Check-out staff</span>
                                <select
                                    value={filterDraft.checkOutStaffId}
                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, checkOutStaffId: event.target.value }))}
                                    disabled={isLookupLoading || !lookup}
                                >
                                    <option value="">{isLookupLoading ? 'Loading staff...' : 'All staff'}</option>
                                    {lookup?.staffs.map((staff) => (
                                        <option key={staff.id} value={staff.id}>{staff.displayText}</option>
                                    ))}
                                </select>
                            </label>
                            {filterError && <p className="filter-error" role="alert">{filterError}</p>}
                            {lookupError && <p className="filter-error" role="alert">{lookupError}</p>}
                            <div className="filter-actions">
                                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                                <button className="primary-action" type="submit">Apply filters</button>
                            </div>
                        </form>,
                        document.body,
                    )}
                     <div className="roles-table-wrap session-table-wrap">
                        <table className={`roles-table session-table${readOnly ? ' session-table-readonly' : ''}`}>
                                <thead>
                                    <tr>
                                       {sortHeader('ticketCode', 'Ticket Code')}
                                       {sortHeader('customerId', 'Plate Number')}
                                       {sortHeader('parkingAreaId', 'Parking Area Code')}
                                       {sortHeader('parkingSpotId', 'Parking Spot Code')}
                                       {sortHeader('fee', 'Fee')}
                                       {!readOnly && sortHeader('checkInStaffId', 'Check-in Staff')}
                                       {!readOnly && sortHeader('checkOutStaffId', 'Check-out Staff')}
                                       {sortHeader('entryTime', 'Entry Time')}
                                       {sortHeader('exitTime', 'Exit Time')}
                                       <th>status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!isLoading && sessions.map((session)=>(
                                        <tr key={session.id}>
                                            <td>{session.ticketCode}</td>
                                            <td>{session.plateNumber ?? '—'}</td>
                                            <td>{session.parkingAreaCode}</td>
                                            <td>{session.parkingSpotCode ?? '—'}</td>
                                            <td>{session.fee ?? '—'}</td>
                                            {!readOnly && <td>{session.checkInStaffId ?? '—'}</td>}
                                            {!readOnly && <td>{session.checkOutStaffId ?? '—'}</td>}
                                            <td><time dateTime={session.entryTime}>{formatSessionDate(session.entryTime)}</time></td>
                                            <td>
                                                {session.exitTime
                                                    ? <time dateTime={session.exitTime}>{formatSessionDate(session.exitTime)}</time>
                                                    : '—'}
                                            </td>
                                            <td>
                                                {(() => {
                                                    const status = getSessionStatus(
                                                        session.status,
                                                        session.parkingSessionStatusName,
                                                    )
                                                    return (
                                                        <span className={`session-status-badge ${status.className}`}>
                                                            {status.label}
                                                        </span>
                                                    )
                                                })()}
                                            </td>
                                        </tr>

                                    ))}
                                </tbody>
                        </table>    
                         {isLoading && <p className="roles-status" role="status">Loading sessions...</p>}
                        {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
                        {!isLoading && !errorMessage && sessions.length === 0 && (
                        <p className="empty-roles">No sessions found.</p>
                        )} 
                     </div>
                     <footer className="roles-footer">
                        <button className="refresh-action"
                                type="button"
                                aria-label="Refresh sessions"
                                 onClick={() => void loadSessions()}
                                disabled={isLoading} >
                            <IconRefresh className="action-icon" aria-hidden="true" /> 
                            
                        </button>
                        <span>{totalCount ? `${firstItem}-${lastItem} of ${totalCount} items` : '0 items'}</span>  
                        <label>
                            Show
                            <select
                                value={rowsPerPage}
                                onChange={(event) => {
                                setRowsPerPage(Number(event.target.value))
                                setCurrentPage(1)
                                }}
                                aria-label="Rows per page"
                                >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                             entries
                        </label>
                        <div className="pagination">
                            <button type="button" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={isLoading || safeCurrentPage === 1}>
                                <IconChevronsLeft className="action-icon" aria-hidden="true" />
                            </button>
                            <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safeCurrentPage === 1}>
                                <IconChevronLeft className="action-icon" aria-hidden="true" />
                            </button>
                            <button className="current-page" type="button" aria-current="page">{safeCurrentPage}</button>
                            <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safeCurrentPage === pageCount}>
                                <IconChevronRight className="action-icon" aria-hidden="true" />
                            </button>
                            <button type="button" aria-label="Last page" onClick={() => setCurrentPage(pageCount)} disabled={isLoading || safeCurrentPage === pageCount}>
                                <IconChevronsRight className="action-icon" aria-hidden="true" />
                            </button>
                        </div>
                     </footer>
                </section>
         </main>

    </div>
    
)
}
export default AdminSession;