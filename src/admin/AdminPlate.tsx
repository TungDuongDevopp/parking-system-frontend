import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import {
    changePlate,
    getPlates,
} from '../services/plateService'
import { getSubscriptionById } from '../services/subscriptionService'
import type { ChangePlateRequest, PlateDto } from '../types/Plate/plate'
import type { PlateQuery } from '../types/Plate/plateQuery'
import Sidebar from "../components/sidebar/Sidebar"
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
  IconArrowsExchange,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from '@tabler/icons-react'
type SortDirection = 'asc' | 'desc' | null
type PlateSortField = 
    | 'subscriptionId'
    | 'plateNumber'  

type PlatesFilters = Pick<PlateQuery, 'subscriptionId'>    

const backendSortField: Record<PlateSortField, string> = {
  subscriptionId: 'SubscriptionId',
  plateNumber: 'PlateNumber'
}
const AdminPlate = ({ readOnly = false }: { readOnly?: boolean })=>{

    const [isLoading,setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [plates, setPlates] = useState<PlateDto[]>([])    
    const [subscriptionStatuses, setSubscriptionStatuses] = useState<Record<number, number | null>>({})

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
    const [filters, setFilters] = useState<PlatesFilters>({})
    const [filterDraft, setFilterDraft] = useState('')
    const [filterError, setFilterError] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const activeFilterCount = filters.subscriptionId === undefined ? 0 : 1
    const filterButtonRef = useRef<HTMLButtonElement>(null)
    const filterPopoverRef = useRef<HTMLFormElement>(null)
    const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
//Sorting
    const [sortField, setSortField] = useState<PlateSortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)  
    const [plateToChange, setPlateToChange] = useState<PlateDto | null>(null)
    const [plateNumberDraft, setPlateNumberDraft] = useState('')
    const [changePlateError, setChangePlateError] = useState('')
    const [isChangingPlate, setIsChangingPlate] = useState(false)
    const openChangePlateModal = (plate: PlateDto) => {
        const status = subscriptionStatuses[plate.subscriptionId]
        if (status == null || status === 1) return

        setPlateToChange(plate)
        setPlateNumberDraft(plate.plateNumber)
        setChangePlateError('')
    }
    const closeChangePlateModal = () => {
        if (isChangingPlate) return
        setPlateToChange(null)
        setPlateNumberDraft('')
        setChangePlateError('')
    }
    const handleChangePlateSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        if (!plateToChange) return
        if (subscriptionStatuses[plateToChange.subscriptionId] === 1) {
            setChangePlateError('Cannot change the plate while the subscription is in use.')
            return
        }
        if (subscriptionStatuses[plateToChange.subscriptionId] == null) {
            setChangePlateError('Cannot change the plate because the subscription status is unavailable.')
            return
        }

        const plateNumber = plateNumberDraft.trim()
        if (!plateNumber) {
            setChangePlateError('Plate number is required.')
            return
        }

        const request: ChangePlateRequest = {
            id: plateToChange.id,
            subscriptionId: plateToChange.subscriptionId,
            plateNumber,
        }
        setIsChangingPlate(true)
        setChangePlateError('')
        try {
            await changePlate(request)
            await loadPlates()
            setPlateToChange(null)
            setPlateNumberDraft('')
        } catch (error) {
            setChangePlateError(error instanceof Error ? error.message : 'Unable to change plate.')
        } finally {
            setIsChangingPlate(false)
        }
    }
    useEffect(() => {
        if (!isFilterOpen) return

        const updatePosition = () => {
            const button = filterButtonRef.current
            const popover = filterPopoverRef.current
            if (!button || !popover) return

            const bounds = button.getBoundingClientRect()
            const popoverBounds = popover.getBoundingClientRect()
            setFilterPosition({
                top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - popoverBounds.height - 12)),
                right: Math.max(12, Math.min(window.innerWidth - bounds.right, window.innerWidth - popoverBounds.width - 12)),
            })
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [isFilterOpen, filterError])
    const openFilters = () => {
        setFilterDraft(filters.subscriptionId?.toString() ?? '')
        setFilterError('')
        setIsFilterOpen((open) => !open)
    }
    const applyFilters = (event: SubmitEvent) => {
        event.preventDefault()
        const subscriptionId = filterDraft === '' ? undefined : Number(filterDraft)
        if (subscriptionId !== undefined && (!Number.isSafeInteger(subscriptionId) || subscriptionId < 1)) {
            setFilterError('Subscription ID must be a positive whole number.')
            return
        }

        setFilters({ subscriptionId })
        setCurrentPage(1)
        setIsFilterOpen(false)
    }
    const clearFilters = () => {
        setFilterDraft('')
        setFilters({})
        setFilterError('')
        setCurrentPage(1)
        setIsFilterOpen(false)
    }
    const loadPlates = useCallback(async()=>{
        setIsLoading(true)
        setErrorMessage('')
        setSubscriptionStatuses({})
        try{
            const result = await getPlates({
                            skipCount: (safeCurrentPage-1) * rowsPerPage,
                            maxResultCount:rowsPerPage,
                            keyword: keyword.trim() || undefined,   
                            sorting: sortField && sortDirection
                                ? `${backendSortField[sortField]} ${sortDirection}`
                                : undefined,
                            ...filters,
                        })
                    const subscriptionIds = [...new Set(result.items.map((plate) => plate.subscriptionId))]
                    const statusResults = await Promise.all(subscriptionIds.map(async (subscriptionId) => {
                        try {
                            const subscription = await getSubscriptionById(subscriptionId)
                            return [subscriptionId, subscription.status] as const
                        } catch {
                            return [subscriptionId, null] as const
                        }
                    }))
                    const statuses = Object.fromEntries(statusResults)
                    setSubscriptionStatuses(statuses)
                    setPlates(result.items)
                    setTotalCount(result.totalCount)
                }
                catch (error){
                    setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách biển xe.')
                    setPlates([])
                    setTotalCount(0)
                    setSubscriptionStatuses({})
                }
        finally{
            setIsLoading(false)
        }
    },[filters,keyword,rowsPerPage,safeCurrentPage,sortDirection,sortField]) 
     useEffect(() => {
    void loadPlates()
    }, [loadPlates])
    const handleSort = (field: PlateSortField) => {
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
    const sortIcon = (field: PlateSortField) => {
            if (sortField !== field || !sortDirection) {
                return <IconArrowsSort className="action-icon" aria-hidden="true" />
            }
            const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
            return <Icon className="action-icon" aria-hidden="true" />
    }
    const sortHeader = (field: PlateSortField, label: string) => (
    <th key={field}>
      <span className="subscription-sort-header">
        <span className="subscription-sort-label">{label}</span>
        <button
          className="sort-button"
          type="button"
          aria-label={`Sort by ${label}`}
          onClick={() => handleSort(field)}
        >
          {sortIcon(field)}
        </button>
      </span>
    </th>
    )
    return(
    <div className="workspace roles-workspace">
         <Sidebar/>
         <main className="main-content roles-content">
            <header className="roles-header">
                <div>
                    <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                    <h1>Plate</h1>
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
                            aria-label="Open plate filters"
                            aria-expanded={isFilterOpen}
                            aria-controls="plate-filter-popover"
                            onClick={openFilters}
                        >
                         <IconAdjustmentsHorizontal className="action-icon" aria-hidden="true" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                        </button>
                    </div>
                </div>
                {isFilterOpen && createPortal(
                    <form
                        ref={filterPopoverRef}
                        className="filter-popover"
                        id="plate-filter-popover"
                        aria-label="Filter plates"
                        onSubmit={applyFilters}
                        style={{ top: filterPosition.top, right: filterPosition.right }}
                    >
                        <div className="filter-heading">
                            <strong>Filter plates</strong>
                            <button
                                className="filter-close"
                                type="button"
                                aria-label="Close filters"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                <IconX className="action-icon" aria-hidden="true" />
                            </button>
                        </div>
                        <label className="filter-field">
                            <span>Subscription ID</span>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={filterDraft}
                                onChange={(event) => {
                                    setFilterDraft(event.target.value)
                                    setFilterError('')
                                }}
                                aria-invalid={Boolean(filterError)}
                                className={filterError ? 'has-error' : undefined}
                            />
                            {filterError && <span className="filter-field-error" role="alert">{filterError}</span>}
                        </label>
                        <div className="filter-actions">
                            <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                            <button className="primary-action" type="submit">Apply</button>
                        </div>
                    </form>,
                    document.body,
                )}
                <div className="roles-table-wrap subscription-table-wrap">
                    <table className="roles-table subscription-table">
                        <thead>
                            <tr>
                                {sortHeader('subscriptionId','Subscription Id')}
                                {sortHeader('plateNumber','Plate Number')}
                                <th>Vehicle Type</th>
                                {!readOnly && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoading && plates.map((plate)=>(
                                 <tr key={plate.id}>
                                    <td>{plate.subscriptionId}</td>
                                    <td>{plate.plateNumber}</td>
                                    <td>{plate.vehicleTypeName}</td>
                                    {!readOnly && (
                                        <td>
                                            <div className="role-actions">
                                                <button
                                                    className="edit-action"
                                                    type="button"
                                                    onClick={() => openChangePlateModal(plate)}
                                                    disabled={
                                                        subscriptionStatuses[plate.subscriptionId] === 1 ||
                                                        subscriptionStatuses[plate.subscriptionId] == null
                                                    }
                                                    title={
                                                        subscriptionStatuses[plate.subscriptionId] === 1
                                                            ? 'Cannot change plate while subscription is in use.'
                                                            : subscriptionStatuses[plate.subscriptionId] == null
                                                                ? 'Subscription status is unavailable.'
                                                                : undefined
                                                    }
                                                >
                                                    <IconArrowsExchange className="action-icon" aria-hidden="true" />
                                                    Change plate
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                 </tr>   
                            ))}
                        </tbody>
                    </table>
                    {isLoading && <p className="roles-status" role="status">Loading plates...</p>}
                    {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
                    {!isLoading && !errorMessage && plates.length === 0 && (
                    <p className="empty-roles">No subscriptions found.</p>)}
               </div>
               <footer className="roles-footer">
                    <button className="refresh-action"
                                type="button"
                                aria-label="Refresh pltes"
                                 onClick={() => void loadPlates()}
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
            {plateToChange && (
                <div
                    className="role-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeChangePlateModal()
                    }}
                >
                    <section
                        className="role-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="change-plate-title"
                    >
                        <header className="role-modal-header">
                            <div>
                                <span className="eyebrow-label">Administration</span>
                                <h2 id="change-plate-title">Change plate</h2>
                            </div>
                            <button
                                className="modal-close"
                                type="button"
                                aria-label="Close change plate dialog"
                                onClick={closeChangePlateModal}
                                disabled={isChangingPlate}
                            >
                                <IconX className="action-icon" aria-hidden="true" />
                            </button>
                        </header>
                        <form onSubmit={handleChangePlateSubmit} noValidate>
                            <div className="role-form-body">
                                <label className="role-field">
                                    <span>Subscription ID</span>
                                    <input value={plateToChange.subscriptionId} disabled />
                                </label>
                                <label className="role-field">
                                    <span>Current plate</span>
                                    <input value={plateToChange.plateNumber} disabled />
                                </label>
                                <label className="role-field">
                                    <span>New plate number <b>*</b></span>
                                    <input
                                        value={plateNumberDraft}
                                        onChange={(event) => {
                                            setPlateNumberDraft(event.target.value)
                                            setChangePlateError('')
                                        }}
                                        autoFocus
                                        aria-invalid={Boolean(changePlateError)}
                                        className={changePlateError ? 'has-error' : undefined}
                                        disabled={isChangingPlate}
                                    />
                                </label>
                                {changePlateError && (
                                    <p className="role-form-error" role="alert">{changePlateError}</p>
                                )}
                            </div>
                            <footer className="role-modal-footer">
                                <button
                                    className="modal-cancel"
                                    type="button"
                                    onClick={closeChangePlateModal}
                                    disabled={isChangingPlate}
                                >
                                    Cancel
                                </button>
                                <button className="primary-action" type="submit" disabled={isChangingPlate}>
                                    <IconArrowsExchange className="action-icon" aria-hidden="true" />
                                    <span>{isChangingPlate ? 'Saving...' : 'Change plate'}</span>
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}
         </main>
    </div>
    )
}
export default AdminPlate;