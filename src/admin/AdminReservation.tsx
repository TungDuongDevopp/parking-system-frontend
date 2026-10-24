
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getReservationLookUp, getReservations } from '../services/reservationService'
import type { ReservationDto, ReservationLookUp } from '../types/Reservation/reservation'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
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

type ReservationSortField =
  | 'customerName'
  | 'parkingAreaCode'
  | 'parkingSpotCode'
  | 'reservedAt'
  | 'endTime'
  | 'status'
type SortDirection = 'asc' | 'desc' | null
type ReservationFilters = {
    customerId?: number
    parkingAreaId?: number
    parkingSpotId?: number
    reservedAtFrom?: string
    reservedAtTo?: string
    expireAtFrom?: string
    expireAtTo?: string
    status?: number
}
type ReservationFilterDraft = {
    customerId: string
    parkingAreaId: string
    parkingSpotId: string
    reservedAtFrom: string
    reservedAtTo: string
    expireAtFrom: string
    expireAtTo: string
    status: string
}

const emptyFilterDraft: ReservationFilterDraft = {
    customerId: '',
    parkingAreaId: '',
    parkingSpotId: '',
    reservedAtFrom: '',
    reservedAtTo: '',
    expireAtFrom: '',
    expireAtTo: '',
    status: '',
}

const reservationStatuses = [
    { value: 1, label: 'Reserved' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Cancelled' },
    { value: 4, label: 'Expired' },
    { value: 5, label: 'Invalid' },
]

const backendSortField: Record<ReservationSortField, string> = {
    customerName: 'CustomerId',
    parkingAreaCode: 'ParkingAreaId',
    parkingSpotCode: 'ParkingSpotId',
    reservedAt: 'ReservedAt',
    endTime: 'ExpireAt',
    status: 'Status',
}

const formatDateOnly = (value?: string | null) => {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const AdminReservation = ({ readOnly = false }: { readOnly?: boolean })=>{
    const [isLoading,setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [reservations, setReservations] = useState<ReservationDto[]>([]) 
    const [sortField, setSortField] = useState<ReservationSortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [filters, setFilters] = useState<ReservationFilters>({})
    const [filterDraft, setFilterDraft] = useState<ReservationFilterDraft>(emptyFilterDraft)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterDateError, setFilterDateError] = useState('')
    const [lookup, setLookup] = useState<ReservationLookUp | null>(null)
    const [isLookupLoading, setIsLookupLoading] = useState(false)
    const [lookupError, setLookupError] = useState('')
    const filterButtonRef = useRef<HTMLButtonElement>(null)
    const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })

    const getReservationStatusClass = (reservation: ReservationDto) => {
        const statusValue = String(reservation.status ?? reservation.reservationStatusName ?? '').trim().toLowerCase()

        if (['1', 'reserved'].includes(statusValue) || statusValue.includes('reserved')) {
            return 'status-reserved'
        }

        if (['2', 'completed'].includes(statusValue) || statusValue.includes('completed')) {
            return 'status-completed'
        }

        if (['3', 'cancelled', 'canceled'].includes(statusValue) || statusValue.includes('cancel')) {
            return 'status-cancelled'
        }

        if (['4', 'expired'].includes(statusValue) || statusValue.includes('expired')) {
            return 'status-expired'
        }

        if (['5', 'invalid'].includes(statusValue) || statusValue.includes('invalid')) {
            return 'status-invalid'
        }

        return 'status-default'
    }
//Pagintation
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
    const safeCurrentPage = Math.min(currentPage, pageCount)
    const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
    const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)  
//Search & Filter
    const [keyword, setKeyword] = useState('')

    const loadReservations = useCallback(async() =>{
        setIsLoading(true)
        setErrorMessage('')
        try{
            const result = await getReservations({
                skipCount: (safeCurrentPage-1) * rowsPerPage,
                maxResultCount:rowsPerPage,
                keyword: keyword.trim() || undefined,   
                sorting: sortField && sortDirection
                    ? `${backendSortField[sortField]} ${sortDirection}`
                    : undefined,
                ...filters,
            })
            setReservations(result.items)
            setTotalCount(result.totalCount)

        }
        catch(error){
        setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách biển xe.')
        setReservations([])
        setTotalCount(0)
                    
        }
        finally{
            setIsLoading(false)
        }
        
    },[filters,rowsPerPage,safeCurrentPage,keyword,sortDirection,sortField]) 

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
        setFilterDraft({
            customerId: filters.customerId?.toString() ?? '',
            parkingAreaId: filters.parkingAreaId?.toString() ?? '',
            parkingSpotId: filters.parkingSpotId?.toString() ?? '',
            reservedAtFrom: filters.reservedAtFrom ?? '',
            reservedAtTo: filters.reservedAtTo ?? '',
            expireAtFrom: filters.expireAtFrom ?? '',
            expireAtTo: filters.expireAtTo ?? '',
            status: filters.status?.toString() ?? '',
        })
        setFilterDateError('')
        setIsFilterOpen((open) => !open)
        if (lookup || isLookupLoading) return

        setIsLookupLoading(true)
        setLookupError('')
        try {
            setLookup(await getReservationLookUp())
        } catch (error) {
            setLookupError(error instanceof Error ? error.message : 'Không thể tải lựa chọn bộ lọc.')
        } finally {
            setIsLookupLoading(false)
        }
    }

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (
            (filterDraft.reservedAtFrom && filterDraft.reservedAtTo && filterDraft.reservedAtFrom > filterDraft.reservedAtTo) ||
            (filterDraft.expireAtFrom && filterDraft.expireAtTo && filterDraft.expireAtFrom > filterDraft.expireAtTo)
        ) {
            setFilterDateError('Ngày bắt đầu không được sau ngày kết thúc.')
            return
        }

        setFilterDateError('')
        setFilters({
            customerId: filterDraft.customerId ? Number(filterDraft.customerId) : undefined,
            parkingAreaId: filterDraft.parkingAreaId ? Number(filterDraft.parkingAreaId) : undefined,
            parkingSpotId: filterDraft.parkingSpotId ? Number(filterDraft.parkingSpotId) : undefined,
            reservedAtFrom: filterDraft.reservedAtFrom || undefined,
            reservedAtTo: filterDraft.reservedAtTo || undefined,
            expireAtFrom: filterDraft.expireAtFrom || undefined,
            expireAtTo: filterDraft.expireAtTo || undefined,
            status: filterDraft.status ? Number(filterDraft.status) : undefined,
        })
        setCurrentPage(1)
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setFilterDraft(emptyFilterDraft)
        setFilters({})
        setFilterDateError('')
        setCurrentPage(1)
        setIsFilterOpen(false)
    }

    const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== '').length

    const handleSort = (field: ReservationSortField) => {
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

    const sortIcon = (field: ReservationSortField) => {
        if (sortField !== field || !sortDirection) {
            return <IconArrowsSort className="action-icon" aria-hidden="true" />
        }

        const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
        return <Icon className="action-icon" aria-hidden="true" />
    }

    const sortHeader = (field: ReservationSortField, label: string) => (
        <th key={field} aria-sort={sortField === field && sortDirection
            ? sortDirection === 'asc' ? 'ascending' : 'descending'
            : 'none'}>
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
    void loadReservations()
    }, [loadReservations])
    return(
        <div className="workspace roles-workspace">
            <Sidebar/>
            <main className="main-content roles-content">
                 <header className="roles-header">
                    <div>
                        <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                        <h1>Reservation</h1>
                    </div> 
                 </header>
                  <section className="roles-card plates-card" aria-label="Plate list">
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
                                placeholder="Search subscription"
                                aria-label="Search subscription"
                            />
                             </label>
                              <div className="filter-wrap">
                                 <button
                                    ref={filterButtonRef}
                                    className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                                    type="button"
                                    aria-label="Open reservation filters"
                                    aria-expanded={isFilterOpen}
                                    aria-controls="reservation-filter-popover"
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
                                className="filter-popover reservation-filter"
                                id="reservation-filter-popover"
                                aria-label="Filter reservations"
                                onSubmit={applyFilters}
                                style={{ top: filterPosition.top, right: filterPosition.right }}
                            >
                                <div className="filter-heading">
                                    <strong>Filter reservations</strong>
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
                                            <option key={customer.id} value={customer.id}>{customer.name} ({customer.phoneNumber})</option>
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
                                            <option key={area.id} value={area.id}>{area.parkingCode}</option>
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
                                            <option key={spot.id} value={spot.id}>{spot.spotCode}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="filter-field">
                                    <span>Status</span>
                                    <select
                                        value={filterDraft.status}
                                        onChange={(event) => setFilterDraft((draft) => ({ ...draft, status: event.target.value }))}
                                    >
                                        <option value="">All statuses</option>
                                        {reservationStatuses.map((status) => (
                                            <option key={status.value} value={status.value}>{status.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <fieldset className="filter-group">
                                    <legend>Reserved at</legend>
                                    <label className="filter-field">
                                        <span>From</span>
                                        <input type="date" value={filterDraft.reservedAtFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, reservedAtFrom: event.target.value }))} />
                                    </label>
                                    <label className="filter-field">
                                        <span>To</span>
                                        <input type="date" value={filterDraft.reservedAtTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, reservedAtTo: event.target.value }))} />
                                    </label>
                                </fieldset>
                                <fieldset className="filter-group">
                                    <legend>Expire at</legend>
                                    <label className="filter-field">
                                        <span>From</span>
                                        <input type="date" value={filterDraft.expireAtFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, expireAtFrom: event.target.value }))} />
                                    </label>
                                    <label className="filter-field">
                                        <span>To</span>
                                        <input type="date" value={filterDraft.expireAtTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, expireAtTo: event.target.value }))} />
                                    </label>
                                </fieldset>
                                {filterDateError && <p className="filter-error" role="alert">{filterDateError}</p>}
                                {lookupError && <p className="filter-error" role="alert">{lookupError}</p>}
                                <div className="filter-actions">
                                    <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                                    <button className="primary-action" type="submit">Apply filters</button>
                                </div>
                            </form>,
                            document.body,
                        )}
                        <div className="roles-table-wrap reservation-table-wrap">
                            <table className="roles-table reservation-table">
                                <thead>
                                    <tr>
                                        {sortHeader('customerName', 'Customer Name')}
                                        {sortHeader('parkingAreaCode', 'Parking Area Code')}
                                        {sortHeader('parkingSpotCode', 'Parking Spot Code')}
                                        <th>Vehicle Type</th>
                                        {sortHeader('reservedAt', 'Reserved At')}
                                        {sortHeader('endTime', 'End Time')}
                                        {sortHeader('status', 'Status')}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!isLoading && reservations.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td>{reservation.customerName}</td>
                                            <td>{reservation.parkingAreaCode}</td>
                                            <td>{reservation.parkingSpotCode || '-'}</td>
                                            <td>{reservation.vehicleTypeName}</td>
                                            <td>{formatDateOnly(reservation.reservedAt)}</td>
                                            <td>{formatDateOnly(reservation.endTime)}</td>
                                            <td>
                                                <span className={`reservation-status-badge ${getReservationStatusClass(reservation)}`}>
                                                    {reservation.reservationStatusName}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {isLoading && <p className="roles-status" role="status">Loading plates...</p>}
                            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
                            {!isLoading && !errorMessage && reservations.length === 0 && (
                            <p className="empty-roles">No reservation found.</p>)}
                        </div>
                        <footer className="roles-footer">
                            <button className="refresh-action"
                                        type="button"
                                        aria-label="Refresh pltes"
                                        onClick={() => void loadReservations()}
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
export default AdminReservation;