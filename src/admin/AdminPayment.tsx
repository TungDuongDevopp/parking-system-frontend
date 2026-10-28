import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import { getPaymentLookup, getPayments } from '../services/paymentService'
import type { PaymentDto, PaymentLookUpDto } from '../types/Payment/payment'
import type { PaymentQuery } from '../types/Payment/paymentQuery'
import {
  IconAdjustmentsHorizontal,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconRefresh,
  IconSearch,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from '@tabler/icons-react'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import '../resources/css/adminPayment.scss'

type PaymentSortField =
  | 'id'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'paymentType'
  | 'amount'
  | 'paidAt'
  | 'expiresAt'
  | 'subscriptionId'
  | 'parkingSessionId'
type SortDirection = 'asc' | 'desc' | null
type PaymentFilters = Pick<
  PaymentQuery,
  | 'paymentStatus'
  | 'paymentType'
  | 'paymentMethod'
  | 'amountFrom'
  | 'amountTo'
  | 'expiresFrom'
  | 'expiresTo'
  | 'paidAtFrom'
  | 'paidAtTo'
  | 'subscriptionId'
  | 'parkingSessionId'
>
type PaymentFilterDraft = Record<keyof PaymentFilters, string>

const emptyFilterDraft: PaymentFilterDraft = {
  paymentStatus: '',
  paymentType: '',
  paymentMethod: '',
  amountFrom: '',
  amountTo: '',
  expiresFrom: '',
  expiresTo: '',
  paidAtFrom: '',
  paidAtTo: '',
  subscriptionId: '',
  parkingSessionId: '',
}

const paymentStatuses = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Paid' },
  { value: 2, label: 'Failed' },
  { value: 3, label: 'Expired' },
]
const paymentTypes = [
  { value: 0, label: 'Subscription' },
  { value: 1, label: 'Parking session' },
]
const paymentMethods = [
  { value: 1, label: 'Cash' },
  { value: 2, label: 'Bank transfer' },
  { value: 3, label: 'E-wallet' },
  { value: 4, label: 'Credit card' },
]

const backendSortField: Record<PaymentSortField, string> = {
  id: 'Id',
  paymentMethod: 'PaymentMethod',
  paymentStatus: 'PaymentStatus',
  paymentType: 'PaymentType',
  amount: 'Amount',
  paidAt: 'PaidAt',
  expiresAt: 'ExpiresAt',
  subscriptionId: 'SubscriptionId',
  parkingSessionId: 'ParkingSessionId',
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const formatDate = (value: string | null) => {
  if (!value) return '—'

  const isoDate = /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1]
  if (isoDate) return isoDate

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getPaymentStatus = (status: number, statusName: string) => {
  switch (status) {
    case 0:
      return { label: 'Pending', className: 'pending' }
    case 1:
      return { label: 'Paid', className: 'paid' }
    case 2:
      return { label: 'Failed', className: 'failed' }
    case 3:
      return { label: 'Expired', className: 'expired' }
    default:
      return { label: statusName || 'Unknown', className: 'unknown' }
  }
}

const AdminPayment = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [paymentLookup, setPaymentLookup] = useState<PaymentLookUpDto | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [filterDraft, setFilterDraft] = useState<PaymentFilterDraft>(emptyFilterDraft)
  const [filterError, setFilterError] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const filterPopoverRef = useRef<HTMLFormElement>(null)
  const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length
  const [sortField, setSortField] = useState<PaymentSortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
  const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)
  const loadPayments = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const result = await getPayments({
        keyword: keyword.trim() || undefined,
        ...filters,
        sorting: sortField && sortDirection
          ? `${backendSortField[sortField]} ${sortDirection}`
          : undefined,
        skipCount: (safeCurrentPage - 1) * rowsPerPage,
        maxResultCount: rowsPerPage,
      })
      setPayments(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load payments.')
      setPayments([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, keyword, rowsPerPage, safeCurrentPage, sortDirection, sortField])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

  useEffect(() => {
    let cancelled = false

    const loadPaymentLookup = async () => {
      setLookupError('')
      try {
        const result = await getPaymentLookup()
        if (!cancelled) setPaymentLookup(result)
      } catch (error) {
        if (!cancelled) {
          setLookupError(error instanceof Error ? error.message : 'Unable to load payment lookups.')
        }
      }
    }

    void loadPaymentLookup()
    return () => {
      cancelled = true
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
  }, [filterError, isFilterOpen])

  const openFilters = () => {
    setFilterDraft({
      paymentStatus: filters.paymentStatus?.toString() ?? '',
      paymentType: filters.paymentType?.toString() ?? '',
      paymentMethod: filters.paymentMethod?.toString() ?? '',
      amountFrom: filters.amountFrom?.toString() ?? '',
      amountTo: filters.amountTo?.toString() ?? '',
      expiresFrom: filters.expiresFrom?.slice(0, 10) ?? '',
      expiresTo: filters.expiresTo?.slice(0, 10) ?? '',
      paidAtFrom: filters.paidAtFrom?.slice(0, 10) ?? '',
      paidAtTo: filters.paidAtTo?.slice(0, 10) ?? '',
      subscriptionId: filters.subscriptionId?.toString() ?? '',
      parkingSessionId: filters.parkingSessionId?.toString() ?? '',
    })
    setFilterError('')
    setIsFilterOpen((open) => !open)
  }

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numberFromDraft = (value: string) => value === '' ? undefined : Number(value)
    const amountFrom = numberFromDraft(filterDraft.amountFrom)
    const amountTo = numberFromDraft(filterDraft.amountTo)
    const subscriptionId = numberFromDraft(filterDraft.subscriptionId)
    const parkingSessionId = numberFromDraft(filterDraft.parkingSessionId)

    if (amountFrom !== undefined && (!Number.isFinite(amountFrom) || amountFrom <= 0)) {
      setFilterError('Amount from must be greater than zero.')
      return
    }
    if (amountTo !== undefined && (!Number.isFinite(amountTo) || amountTo <= 0)) {
      setFilterError('Amount to must be greater than zero.')
      return
    }
    if (amountFrom !== undefined && amountTo !== undefined && amountFrom > amountTo) {
      setFilterError('Amount from cannot be greater than amount to.')
      return
    }
    if (subscriptionId !== undefined && (!Number.isSafeInteger(subscriptionId) || subscriptionId < 1)) {
      setFilterError('Subscription ID must be a positive whole number.')
      return
    }
    if (parkingSessionId !== undefined && (!Number.isSafeInteger(parkingSessionId) || parkingSessionId < 1)) {
      setFilterError('Parking session ID must be a positive whole number.')
      return
    }
    if (filterDraft.expiresFrom && filterDraft.expiresTo && filterDraft.expiresFrom > filterDraft.expiresTo) {
      setFilterError('Expires from cannot be later than expires to.')
      return
    }
    if (filterDraft.paidAtFrom && filterDraft.paidAtTo && filterDraft.paidAtFrom > filterDraft.paidAtTo) {
      setFilterError('Paid at from cannot be later than paid at to.')
      return
    }

    setFilters({
      paymentStatus: numberFromDraft(filterDraft.paymentStatus),
      paymentType: numberFromDraft(filterDraft.paymentType),
      paymentMethod: numberFromDraft(filterDraft.paymentMethod),
      amountFrom,
      amountTo,
      expiresFrom: filterDraft.expiresFrom ? `${filterDraft.expiresFrom}T00:00:00` : undefined,
      expiresTo: filterDraft.expiresTo ? `${filterDraft.expiresTo}T23:59:59.999` : undefined,
      paidAtFrom: filterDraft.paidAtFrom ? `${filterDraft.paidAtFrom}T00:00:00` : undefined,
      paidAtTo: filterDraft.paidAtTo ? `${filterDraft.paidAtTo}T23:59:59.999` : undefined,
      subscriptionId,
      parkingSessionId,
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

  const handleSort = (field: PaymentSortField) => {
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

  const sortIcon = (field: PaymentSortField) => {
    if (sortField !== field || !sortDirection) {
      return <IconArrowsSort className="action-icon" aria-hidden="true" />
    }

    const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
    return <Icon className="action-icon" aria-hidden="true" />
  }

  const sortableHeader = (field: PaymentSortField, label: string) => (
    <th aria-sort={sortField === field && sortDirection
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

  return (
    <div className="workspace roles-workspace">
      <Sidebar />
      <main className="main-content roles-content">
        <header className="roles-header">
          <div>
            <span className="eyebrow-label">Administration</span>
            <h1>Payments</h1>
          </div>
        </header>
        <section className="roles-card payment-card" aria-label="Payment list">
          <div className="roles-toolbar">
            <label className="roles-search">
              <span aria-hidden="true"><IconSearch className="action-icon" /></span>
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search payments"
                aria-label="Search payments"
              />
            </label>
            <div className="filter-wrap">
              <button
                ref={filterButtonRef}
                className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                type="button"
                aria-label="Open payment filters"
                aria-expanded={isFilterOpen}
                aria-controls="payment-filter-popover"
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
              className="filter-popover payment-filter"
              id="payment-filter-popover"
              style={{ top: filterPosition.top, right: filterPosition.right }}
              onSubmit={applyFilters}
            >
              <div className="filter-heading">
                <strong>Payment filters</strong>
                <button className="filter-close" type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)}>
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </div>
              <div className="payment-filter-fields">
                <label className="filter-field">
                  Status
                  <select value={filterDraft.paymentStatus} onChange={(event) => setFilterDraft((draft) => ({ ...draft, paymentStatus: event.target.value }))}>
                    <option value="">All statuses</option>
                    {paymentStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  Type
                  <select value={filterDraft.paymentType} onChange={(event) => setFilterDraft((draft) => ({ ...draft, paymentType: event.target.value }))}>
                    <option value="">All types</option>
                    {paymentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  Method
                  <select value={filterDraft.paymentMethod} onChange={(event) => setFilterDraft((draft) => ({ ...draft, paymentMethod: event.target.value }))}>
                    <option value="">All methods</option>
                    {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  Subscription
                  <select
                    value={filterDraft.subscriptionId}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, subscriptionId: event.target.value }))}
                    disabled={!paymentLookup}
                  >
                    <option value="">All subscriptions</option>
                    {paymentLookup?.subscriptions.map((subscription) => (
                      <option key={subscription.id} value={subscription.id}>
                        #{subscription.id} - {subscription.customerName} (Quotation #{subscription.quotationId})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-field">
                  Parking session
                  <select
                    value={filterDraft.parkingSessionId}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, parkingSessionId: event.target.value }))}
                    disabled={!paymentLookup}
                  >
                    <option value="">All parking sessions</option>
                    {paymentLookup?.sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        #{session.id} - {session.plateNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className="filter-group">
                  <legend>Amount</legend>
                  <label className="filter-field">
                    From
                    <input type="number" min="0.01" step="any" value={filterDraft.amountFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, amountFrom: event.target.value }))} />
                  </label>
                  <label className="filter-field">
                    To
                    <input type="number" min="0.01" step="any" value={filterDraft.amountTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, amountTo: event.target.value }))} />
                  </label>
                </fieldset>
                <fieldset className="filter-group">
                  <legend>Expires at</legend>
                  <label className="filter-field">
                    From
                    <input type="date" value={filterDraft.expiresFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, expiresFrom: event.target.value }))} />
                  </label>
                  <label className="filter-field">
                    To
                    <input type="date" value={filterDraft.expiresTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, expiresTo: event.target.value }))} />
                  </label>
                </fieldset>
                <fieldset className="filter-group">
                  <legend>Paid at</legend>
                  <label className="filter-field">
                    From
                    <input type="date" value={filterDraft.paidAtFrom} onChange={(event) => setFilterDraft((draft) => ({ ...draft, paidAtFrom: event.target.value }))} />
                  </label>
                  <label className="filter-field">
                    To
                    <input type="date" value={filterDraft.paidAtTo} onChange={(event) => setFilterDraft((draft) => ({ ...draft, paidAtTo: event.target.value }))} />
                  </label>
                </fieldset>
              </div>
              {lookupError && <p className="filter-error" role="alert">{lookupError}</p>}
              {filterError && <p className="filter-error" role="alert">{filterError}</p>}
              <div className="filter-actions">
                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                <button className="primary-action" type="submit">Apply filters</button>
              </div>
            </form>,
            document.body,
          )}
          <div className="roles-table-wrap">
            {isLoading && <p className="roles-status" role="status">Loading payments...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
            <table className="roles-table payment-table">
              <thead>
                <tr>
                  {sortableHeader('id', 'ID')}
                  {sortableHeader('amount', 'Amount')}
                  {sortableHeader('paymentMethod', 'Method')}
                  {sortableHeader('paymentType', 'Type')}
                  {sortableHeader('subscriptionId', 'Sub Id')}
                  {sortableHeader('parkingSessionId', 'Session Id')}
                  {sortableHeader('paidAt', 'Paid At')}
                  {sortableHeader('expiresAt', 'Expires At')}
                  {sortableHeader('paymentStatus', 'Status')}
                </tr>
              </thead>
              <tbody>
                {!isLoading && payments.map((payment) => {
                  const status = getPaymentStatus(payment.paymentStatus, payment.paymentStatusName)
                  return (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{vndFormatter.format(payment.amount)}</td>
                      <td>{payment.paymentMethodName}</td>
                      <td>{payment.paymentTypeName}</td>
                      <td>{payment.subscriptionId ?? '—'}</td>
                      <td>{payment.parkingSessionId ?? '—'}</td>
                      <td>{formatDate(payment.paidAt)}</td>
                      <td>{formatDate(payment.expiresAt)}</td>
                      <td>
                        <span className={`payment-status ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!isLoading && !errorMessage && payments.length === 0 && (
              <p className="empty-roles">No payments found.</p>
            )}
          </div>
          <footer className="roles-footer">
            <button
              className="refresh-action"
              type="button"
              aria-label="Refresh payments"
              onClick={() => void loadPayments()}
              disabled={isLoading}
            >
              <IconRefresh className="action-icon" aria-hidden="true" />
            </button>
            <span>{totalCount ? `${firstItem}-${lastItem} of ${totalCount} items` : '0 items'}</span>
            <label>
              Show{' '}
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
              </select>{' '}
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

export default AdminPayment
