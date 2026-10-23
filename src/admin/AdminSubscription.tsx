import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import type {SubscriptionDto,SubscriptionCustomerLookup,SubscriptionQuotationLookup} from '../types/Subscription/subscription'
import type {SubscriptionQuery} from '../types/Subscription/subscriptionQuery'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import type {FieldErrors } from '../services/fieldValidation'
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
import { getSubscriptions,getSubscriptionLookUp} from '../services/subscriptionService'

const subscriptionAmountFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
})

const subscriptionStatusLabels: Record<number, { label: string; className: string }> = {
    0: { label: 'Pending', className: 'pending' },
    1: { label: 'In use', className: 'in-use' },
    2: { label: 'Expired', className: 'expired' },
    3: { label: 'Canceled', className: 'canceled' },
}

const subscriptionStatuses =[
 { value: 0, label: 'Pending' },
  { value: 1, label: 'In Use' },
  { value: 2, label: 'Expired' },
  { value: 3, label: 'Canceled' },
]
type SortDirection = 'asc' | 'desc' | null
type SubscriptionSortField = 
    | 'vehicleType'
    | 'customerId'
    | 'duration'
    | 'durationUnit'
    | 'totalAmount'
    | 'startTime'
    | 'endTime'
    | 'status'
    | 'customerName'

const backendSortField: Record<SubscriptionSortField, string> = {
   vehicleType: 'vehicleType',
   customerId: 'CustomerId',
   duration: 'duration',
   totalAmount: 'totalAmount',
   startTime: 'StartTime',
   endTime: 'EndTime',
   status : 'Status',
   customerName: 'customerName',
   durationUnit : 'durationUnit'
    
}
type SubscriptionFilters= Pick<SubscriptionQuery,
'startTimeFrom' | 'endTimeFrom' |'status' | 'startTimeTo' | 'endTimeTo' | 'quotationId' | 'customerId'
>
type SubscriptionFilterField  = 'endTimeTo' | 'startTimeTo'
type SubscriptionFilterErrors = FieldErrors<SubscriptionFilterField>

type FilterDraft = {
    startTimeFrom: string,
    startTimeTo: string,
    endTimeFrom:string,
    endTimeTo:string,
    status: string,
    customerId: string,
    quotationId: string
}
const emptyFilterDraft: FilterDraft = {
    startTimeFrom: '',
    startTimeTo: '',
    endTimeFrom:'',
    endTimeTo:'',
    status: '',
    customerId: '',
    quotationId: ''
}

const formatSubscriptionDate = (value: string) => {
    const isoDate = /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1]
    if (isoDate) return isoDate

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const AdminSubscription = ({ readOnly = false }: { readOnly?: boolean })=> {
    const [isLoading,setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([])

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
    const [filters, setFilters] = useState<SubscriptionFilters>({})
    const [filterDraft, setFilterDraft] = useState<FilterDraft>(emptyFilterDraft)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterErrors, setFilterErrors] = useState<SubscriptionFilterErrors>({})
    const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length
    const filterButtonRef = useRef<HTMLButtonElement>(null)
    const filterPopoverRef = useRef<HTMLFormElement>(null)
    const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
//Sorting
    const [sortField, setSortField] = useState<SubscriptionSortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)  
//Lookup
    const [isLookupLoading, setIsLookupLoading] = useState(false)    
    const [lookupError, setLookupError] = useState('')
    const [lookupCustomers, setLookupCustomers] = useState<SubscriptionCustomerLookup[]>([])
    const [lookupQuotations, setLookupQuotations] = useState<SubscriptionQuotationLookup[]>([])
    useEffect(() => {
        let isCurrent = true

        const loadSubscriptionLookUp = async () => {
            setIsLookupLoading(true)
            setLookupError('')
            try {
                const result = await getSubscriptionLookUp()
                if (isCurrent) {
                    setLookupCustomers(result.customers)
                    setLookupQuotations(result.quotations)
                }
            } catch (error) {
                if (isCurrent) {
                    setLookupError(error instanceof Error ? error.message : 'Không thể tải dữ liệu tra cứu subscription.')
                    setLookupCustomers([])
                    setLookupQuotations([])
                }
            } finally {
                if (isCurrent) setIsLookupLoading(false)
            }
        }

        void loadSubscriptionLookUp()
        return () => {
            isCurrent = false
        }
    }, [])

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
        }, [filterErrors, isFilterOpen])

    const handleSort = (field: SubscriptionSortField) => {
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
    const sortIcon = (field: SubscriptionSortField) => {
        if (sortField !== field || !sortDirection) {
            return <IconArrowsSort className="action-icon" aria-hidden="true" />
        }
        const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
        return <Icon className="action-icon" aria-hidden="true" />
    }
    const loadSubscriptions = useCallback(async () =>{
         setIsLoading(true)
        setErrorMessage('')
        try{
            const result = await getSubscriptions({
                skipCount: (safeCurrentPage-1) *rowsPerPage,
                maxResultCount:rowsPerPage,
                keyword: keyword.trim() || undefined,   
                sorting: sortField && sortDirection
                        ? sortField === 'duration'
                            ? `durationUnit ${sortDirection}, duration ${sortDirection}`
                            : `${backendSortField[sortField]} ${sortDirection}`
                        : undefined,
                        ...filters
            })
            setSubscriptions(result.items)
            setTotalCount(result.totalCount)
        }
        catch(error){
             setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách gói đăng ký.')
            setSubscriptions([])
            setTotalCount(0)
        }
        finally{
             setIsLoading(false)
        }
    },[filters,keyword,rowsPerPage,safeCurrentPage,sortDirection,sortField]) 
        useEffect(() => {
    void loadSubscriptions()
    }, [loadSubscriptions])
   
    const sortHeader = (field: SubscriptionSortField, label: string) => (
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
      
    const openFilters = () => {
        setFilterDraft({       
        startTimeFrom: filters.startTimeFrom?.toString() ?? '',
        startTimeTo: filters.startTimeTo?.toString() ?? '',
        endTimeFrom: filters.endTimeFrom?.toString() ?? '',
        endTimeTo: filters.endTimeTo?.toString() ?? '',
        status: filters.status?.toString() ?? '',
        customerId: filters.customerId?.toString() ?? '',
        quotationId: filters.quotationId?.toString() ?? '',
        })
        setFilterErrors({})
        setIsFilterOpen((open) => !open)
     }
     const applyFilters = (event: SubmitEvent) => {
             event.preventDefault()
             const status = filterDraft.status === '' ? undefined : Number(filterDraft.status)
             const customerId = filterDraft.customerId === '' ? undefined : Number(filterDraft.customerId)
             const quotationId = filterDraft.quotationId === '' ? undefined : Number(filterDraft.quotationId)
             const validationErrors: SubscriptionFilterErrors = {}
             
            if(filterDraft.startTimeFrom && filterDraft.startTimeTo &&
                filterDraft.startTimeFrom> filterDraft.startTimeTo){
                    validationErrors.startTimeTo ='End date must be on or after the start date'
            }
             if(filterDraft.endTimeFrom && filterDraft.endTimeTo &&
                filterDraft.endTimeFrom> filterDraft.endTimeTo){
                    validationErrors.endTimeTo ='End date must be on or after the start date'
            }
             setFilterErrors(validationErrors)
             if (Object.keys(validationErrors).length) return
         
             setFilters({
                status,
                startTimeFrom: filterDraft.startTimeFrom || undefined,
                startTimeTo: filterDraft.startTimeTo || undefined,
                endTimeFrom: filterDraft.endTimeFrom || undefined,
                endTimeTo: filterDraft.endTimeTo || undefined,
                customerId,
                quotationId,
             })
             setCurrentPage(1)
             setIsFilterOpen(false)
    }
     const clearFilters = () => {
        setFilterDraft(emptyFilterDraft)
        setFilters({})
        setFilterErrors({})
        setCurrentPage(1)
        setIsFilterOpen(false)
    }
    return (
        
        <div className="workspace roles-workspace">
            <Sidebar/>
            <main className="main-content roles-content">
                <header className="roles-header">
                     <div>
                        <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                        <h1>Subscription</h1>
                    </div> 
                </header>
                <section className="roles-card subscription-card" aria-label="Subscription list">
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
                                aria-label="Open quotation filters"
                                aria-expanded={isFilterOpen}
                                aria-controls="filter-popover"
                                onClick={openFilters}
                            >
                            <IconAdjustmentsHorizontal className="action-icon" aria-hidden="true" />
                            <span>Filters</span>
                             {/* {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>} */}
                            </button>
                        </div>
                    </div>
                      {isFilterOpen && createPortal(
                                            <form
                                             ref={filterPopoverRef}
                                             className="filter-popover quotation-filter"
                                                id="filter-popover"
                                                aria-label="Filter quotations"
                                                onSubmit={applyFilters}
                                                style={{ top: filterPosition.top, right: filterPosition.right }}
                                            >
                                              <div className="filter-heading">
                                                <strong>Filter subscriptions</strong>
                                                 <button
                                                    className="filter-close"
                                                    type="button"
                                                    aria-label="Close filters"
                                                    onClick={() => setIsFilterOpen(false)}>
                                                    <IconX className="action-icon" aria-hidden="true" />
                                                </button>
                                            </div>  
                                            <div className="subscription-filter-fields">
                                               <label className="filter-field">
                                                    <span>Status</span>
                                                    <select
                                                    value={filterDraft.status}
                                                    onChange={(event) => {
                                                        setFilterDraft((draft) => ({ ...draft, status: event.target.value }))
                                                    }}
                                                    >
                                                    <option value="">All statuses</option>
                                                    {subscriptionStatuses.map((statusOption) => (
                                                        <option key={statusOption.value} value={statusOption.value}>
                                                        {statusOption.label}
                                                        </option>
                                                    ))}
                                                    </select>
                                                </label>
                                                <fieldset className="filter-group">
                                                    <legend>StartTime</legend>
                                                    <label className="filter-field">
                                                    <span>From</span>
                                                    <input
                                                        type="date"
                                                        value={filterDraft.startTimeFrom}
                                                        max={filterDraft.startTimeTo || undefined}
                                                        onChange={(event) => setFilterDraft((draft) => ({ ...draft, startTimeFrom: event.target.value }))}
                                                    />
                                                    </label>
                                                    <label className="filter-field">
                                                    <span>To</span>
                                                    <input
                                                        type="date"
                                                        value={filterDraft.startTimeTo}
                                                        min={filterDraft.startTimeFrom|| undefined}
                                                        onChange={(event) => {
                                                        setFilterDraft((draft) => ({ ...draft, startTimeTo: event.target.value }))
                                                        setFilterErrors((errors) => ({ ...errors, startTimeTo: undefined }))
                                                        }}
                                                        aria-invalid={Boolean(filterErrors.startTimeTo)}
                                                        className={filterErrors.startTimeTo ? 'has-error' : undefined}
                                                    />
                                                    {filterErrors.startTimeTo && <span className="filter-field-error" role="alert">{filterErrors.startTimeTo}</span>}
                                                    </label>
                                                </fieldset>
                                                 <fieldset className="filter-group">
                                                    <legend>EndTime</legend>
                                                    <label className="filter-field">
                                                    <span>From</span>
                                                    <input
                                                        type="date"
                                                        value={filterDraft.endTimeFrom}
                                                        max={filterDraft.endTimeTo || undefined}
                                                        onChange={(event) => setFilterDraft((draft) => ({ ...draft, endTimeFrom: event.target.value }))}
                                                    />
                                                    </label>
                                                    <label className="filter-field">
                                                    <span>To</span>
                                                    <input
                                                        type="date"
                                                        value={filterDraft.endTimeTo}
                                                        min={filterDraft.endTimeFrom|| undefined}
                                                        onChange={(event) => {
                                                        setFilterDraft((draft) => ({ ...draft, endTimeTo: event.target.value }))
                                                        setFilterErrors((errors) => ({ ...errors, endTimeTo: undefined }))
                                                        }}
                                                        aria-invalid={Boolean(filterErrors.endTimeTo)}
                                                        className={filterErrors.endTimeTo ? 'has-error' : undefined}
                                                    />
                                                    {filterErrors.endTimeTo && <span className="filter-field-error" role="alert">{filterErrors.endTimeTo}</span>}
                                                    </label>
                                                </fieldset>
                                                 <label className="filter-field">
                                                <span>Customer</span>
                                                <select
                                                value={filterDraft.customerId}
                                                onChange={(event) => setFilterDraft((draft) => ({ ...draft, customerId: event.target.value }))}
                                                disabled={isLookupLoading || Boolean(lookupError)}
                                                >
                                                <option value="">
                                                    {isLookupLoading ? 'Loading customers...' : 'All customers'}
                                                </option>
                                                {lookupCustomers.map((customer) => (
                                                    <option key={customer.id} value={customer.id}>{customer.displayText}</option>
                                                ))}
                                                </select>
                                                {lookupError && <span className="filter-field-error" role="alert">{lookupError}</span>}
                                            </label>
                                            <label className="filter-field">
                                                <span>Quotation</span>
                                                <select
                                                    value={filterDraft.quotationId}
                                                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, quotationId: event.target.value }))}
                                                    disabled={isLookupLoading || Boolean(lookupError)}
                                                >
                                                    <option value="">
                                                        {isLookupLoading ? 'Loading quotations...' : 'All quotations'}
                                                    </option>
                                                    {lookupQuotations.map((quotation) => (
                                                        <option key={quotation.id} value={quotation.id}>
                                                            {quotation.displayText}
                                                        </option>
                                                    ))}
                                                </select>
                                                {lookupError && <span className="filter-field-error" role="alert">{lookupError}</span>}
                                            </label>
                                            </div>
                                            <div className="filter-actions">
                                                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                                                <button className="primary-action" type="submit">Apply filters</button>
                                            </div>
                                            </form>,document.body
                                        )}
                    <div className="roles-table-wrap subscription-table-wrap">
                        <table className="roles-table subscription-table">
                            <thead>
                                <tr>
                                {sortHeader('customerId','Customer Id')}
                                {sortHeader('customerName','Customer Name')}
                                {sortHeader('vehicleType','Vehicle Type')}
                                {sortHeader('duration','Duration')}
                                {sortHeader('totalAmount','Total Amount')}
                                {sortHeader('startTime','Start time')}
                                {sortHeader('endTime','End time')}
                                {sortHeader('status','Status')}
                                </tr>
                                
                            </thead>
                             <tbody>
                                    {!isLoading && subscriptions.map((subscription)=>(
                                        <tr key={subscription.id}>
                                            
                                            <td>{subscription.customerId}</td>
                                            <td>{subscription.customerName}</td>
                                            <td>{subscription.vehicleTypeName}</td>
                                            <td>{subscription.duration} {subscription.durationUnitName}</td>
                                            <td>{subscriptionAmountFormatter.format(Number(subscription.totalAmount))}</td>
                                            <td>{formatSubscriptionDate(subscription.startTime)}</td>
                                            <td>{formatSubscriptionDate(subscription.endTime)}</td>
                                            <td>
                                                <span className={`subscription-status ${subscriptionStatusLabels[subscription.status]?.className ?? 'unknown'}`}>
                                                    {subscriptionStatusLabels[subscription.status]?.label ?? subscription.subscriptionStatusName}
                                                </span>
                                            </td>

                                        </tr>



                                    ))}
                             </tbody>
                        </table>
                        {isLoading && <p className="roles-status" role="status">Loading quotations...</p>}
                        {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
                        {!isLoading && !errorMessage && subscriptions.length === 0 && (
                        <p className="empty-roles">No subscriptions found.</p>
                        )}
                    </div>
                    <footer className="roles-footer">
                        <button className="refresh-action"
                                type="button"
                                aria-label="Refresh areas"
                                 onClick={() => void loadSubscriptions()}
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

export default AdminSubscription;
