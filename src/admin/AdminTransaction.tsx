import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import { getTransactionLookup, getTransactions } from '../services/transactionService'
import type { TransPaymentDto, TransactionDto } from '../types/Transaction/transaction'
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
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import '../resources/css/adminPayment.scss'

type TransactionSortField = 'id' | 'paymentId' | 'transactionCode' | 'amount' | 'type' | 'transactionTime' | 'status'
type SortDirection = 'asc' | 'desc' | null
type TransactionFilters = {
  paymentId?: number
  type?: number
  status?: number
  minAmount?: number
  maxAmount?: number
  transactionTimeFrom?: string
  transactionTimeTo?: string
}
type TransactionFilterDraft = {
  paymentId: string
  type: string
  status: string
  minAmount: string
  maxAmount: string
  transactionTimeFrom: string
  transactionTimeTo: string
}

const emptyFilterDraft: TransactionFilterDraft = {
  paymentId: '',
  type: '',
  status: '',
  minAmount: '',
  maxAmount: '',
  transactionTimeFrom: '',
  transactionTimeTo: '',
}

const transactionTypes = [
  { value: 0, label: 'Payment' },
  { value: 1, label: 'Refund' },
]

const transactionStatuses = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Success' },
  { value: 2, label: 'Failed' },
]

const backendSortField: Record<TransactionSortField, string> = {
  id: 'Id',
  paymentId: 'PaymentId',
  transactionCode: 'TransactionCode',
  amount: 'Amount',
  type: 'Type',
  transactionTime: 'TransactionTime',
  status: 'Status',
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
      return { label: 'Success', className: 'success' }
    case 2:
      return { label: 'Failed', className: 'failed' }
    default:
      return { label: statusName || 'Unknown', className: 'unknown' }
  }
}

const AdminTransaction = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [paymentOptions, setPaymentOptions] = useState<TransPaymentDto[]>([])
  const [isLookupLoading, setIsLookupLoading] = useState(true)
  const [lookupError, setLookupError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [filterDraft, setFilterDraft] = useState<TransactionFilterDraft>(emptyFilterDraft)
  const [filterError, setFilterError] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const filterPopoverRef = useRef<HTMLFormElement>(null)
  const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
  const [sortField, setSortField] = useState<TransactionSortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
  const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getTransactions({
        keyword: keyword.trim() || undefined,
        ...filters,
        sorting: sortField && sortDirection ? `${backendSortField[sortField]} ${sortDirection}` : undefined,
        skipCount: (safeCurrentPage - 1) * rowsPerPage,
        maxResultCount: rowsPerPage,
      })

      setTransactions(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load transactions.')
      setTransactions([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, keyword, rowsPerPage, safeCurrentPage, sortDirection, sortField])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    let cancelled = false

    const loadPaymentOptions = async () => {
      setIsLookupLoading(true)
      setLookupError('')
      try {
        const result = await getTransactionLookup()
        if (!cancelled) setPaymentOptions(result.payments)
      } catch (error) {
        if (!cancelled) {
          setLookupError(error instanceof Error ? error.message : 'Unable to load payment options.')
        }
      } finally {
        if (!cancelled) setIsLookupLoading(false)
      }
    }

    void loadPaymentOptions()
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
      paymentId: filters.paymentId?.toString() ?? '',
      type: filters.type?.toString() ?? '',
      status: filters.status?.toString() ?? '',
      minAmount: filters.minAmount?.toString() ?? '',
      maxAmount: filters.maxAmount?.toString() ?? '',
      transactionTimeFrom: filters.transactionTimeFrom?.slice(0, 10) ?? '',
      transactionTimeTo: filters.transactionTimeTo?.slice(0, 10) ?? '',
    })
    setFilterError('')
    setIsFilterOpen((open) => !open)
  }

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amountFrom = filterDraft.minAmount === '' ? undefined : Number(filterDraft.minAmount)
    const amountTo = filterDraft.maxAmount === '' ? undefined : Number(filterDraft.maxAmount)
    const paymentId = filterDraft.paymentId === '' ? undefined : Number(filterDraft.paymentId)

    if (paymentId !== undefined && (!Number.isSafeInteger(paymentId) || paymentId <= 0)) {
      setFilterError('Select a valid payment.')
      return
    }
    if (amountFrom !== undefined && (!Number.isFinite(amountFrom) || amountFrom < 0)) {
      setFilterError('Minimum amount must be zero or greater.')
      return
    }
    if (amountTo !== undefined && (!Number.isFinite(amountTo) || amountTo < 0)) {
      setFilterError('Maximum amount must be zero or greater.')
      return
    }
    if (amountFrom !== undefined && amountTo !== undefined && amountFrom > amountTo) {
      setFilterError('Minimum amount cannot be greater than maximum amount.')
      return
    }
    if (
      filterDraft.transactionTimeFrom &&
      filterDraft.transactionTimeTo &&
      filterDraft.transactionTimeFrom > filterDraft.transactionTimeTo
    ) {
      setFilterError('From date cannot be later than to date.')
      return
    }

    setFilters({
      paymentId,
      type: filterDraft.type === '' ? undefined : Number(filterDraft.type),
      status: filterDraft.status === '' ? undefined : Number(filterDraft.status),
      minAmount: amountFrom,
      maxAmount: amountTo,
      transactionTimeFrom: filterDraft.transactionTimeFrom
        ? `${filterDraft.transactionTimeFrom}T00:00:00`
        : undefined,
      transactionTimeTo: filterDraft.transactionTimeTo
        ? `${filterDraft.transactionTimeTo}T23:59:59.999`
        : undefined,
    })
    setCurrentPage(1)
    setFilterError('')
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setFilterDraft(emptyFilterDraft)
    setFilters({})
    setFilterError('')
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleSort = (field: TransactionSortField) => {
    setCurrentPage(1)

    if (sortField !== field) {
      setSortField(field)
      setSortDirection('asc')
      return
    }

    if (sortDirection === 'asc') {
      setSortDirection('desc')
      return
    }

    setSortField(null)
    setSortDirection(null)
  }

  const sortIcon = (field: TransactionSortField) => {
    if (sortField !== field || !sortDirection) {
      return <IconArrowsSort className="action-icon" aria-hidden="true" />
    }

    const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
    return <Icon className="action-icon" aria-hidden="true" />
  }

  const sortableHeader = (field: TransactionSortField, label: string) => (
    <th aria-sort={
      sortField === field && sortDirection
        ? sortDirection === 'asc' ? 'ascending' : 'descending'
        : 'none'
    }>
      <div className="transaction-sort-header">
        <span>{label}</span>
        <button
          type="button"
          className="sort-button"
          aria-label={`Sort by ${label}`}
          onClick={() => handleSort(field)}
        >
          {sortIcon(field)}
        </button>
      </div>
    </th>
  )

  return (
    <div className="workspace roles-workspace">
      <Sidebar />
      <main className="main-content roles-content">
        <header className="roles-header">
          <div>
            <span className="eyebrow-label">Administration</span>
            <h1>Transaction</h1>
          </div>
        </header>

        <section className="roles-card transaction-card" aria-label="Transaction list">
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
                placeholder="Search transactions"
                aria-label="Search transactions"
              />
            </label>

            <div className="filter-wrap">
              <button
                ref={filterButtonRef}
                type="button"
                className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                aria-label="Open transaction filters"
                aria-expanded={isFilterOpen}
                aria-controls="transaction-filter-popover"
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
              className="filter-popover transaction-filter"
              id="transaction-filter-popover"
              aria-label="Filter transactions"
              style={{ top: filterPosition.top, right: filterPosition.right }}
              onSubmit={applyFilters}
            >
              <div className="filter-heading">
                <strong>Transaction filters</strong>
                <button className="filter-close" type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)}>
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </div>
              <div className="transaction-filter-fields">
                <label className="filter-field">
                  Type
                  <select value={filterDraft.type} onChange={(event) => setFilterDraft((draft) => ({ ...draft, type: event.target.value }))}>
                    <option value="">All types</option>
                    {transactionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  Status
                  <select value={filterDraft.status} onChange={(event) => setFilterDraft((draft) => ({ ...draft, status: event.target.value }))}>
                    <option value="">All statuses</option>
                    {transactionStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  Payment ID
                  <select
                    value={filterDraft.paymentId}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, paymentId: event.target.value }))}
                    disabled={isLookupLoading || Boolean(lookupError)}
                  >
                    <option value="">
                      {isLookupLoading ? 'Loading payments...' : 'All payments'}
                    </option>
                    {paymentOptions.map((payment) => (
                      <option key={payment.id} value={payment.id}>
                        {payment.display || `${payment.id} (${payment.method}) - ${payment.type}`}
                      </option>
                    ))}
                  </select>
                  {lookupError && <span className="filter-field-error" role="alert">{lookupError}</span>}
                </label>
                <fieldset className="filter-group">
                  <legend>Amount</legend>
                  <label className="filter-field">
                    Min
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={filterDraft.minAmount}
                      onChange={(event) => setFilterDraft((draft) => ({ ...draft, minAmount: event.target.value }))}
                      placeholder="No minimum"
                    />
                  </label>
                  <label className="filter-field">
                    Max
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={filterDraft.maxAmount}
                      onChange={(event) => setFilterDraft((draft) => ({ ...draft, maxAmount: event.target.value }))}
                      placeholder="No maximum"
                    />
                  </label>
                </fieldset>
                <fieldset className="filter-group">
                  <legend>Transaction time</legend>
                  <label className="filter-field">
                    From
                    <input
                      type="date"
                      value={filterDraft.transactionTimeFrom}
                      onChange={(event) => setFilterDraft((draft) => ({ ...draft, transactionTimeFrom: event.target.value }))}
                    />
                  </label>
                  <label className="filter-field">
                    To
                    <input
                      type="date"
                      value={filterDraft.transactionTimeTo}
                      onChange={(event) => setFilterDraft((draft) => ({ ...draft, transactionTimeTo: event.target.value }))}
                    />
                  </label>
                </fieldset>
              </div>
              {filterError && <p className="filter-error" role="alert">{filterError}</p>}
              <div className="filter-actions">
                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                <button className="primary-action" type="submit">Apply filters</button>
              </div>
            </form>,
            document.body,
          )}

          <div className="roles-table-wrap">
            {isLoading && <p className="roles-status" role="status">Loading transactions...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}

            <table className="roles-table transaction-table">
              <thead>
                <tr>
                  {sortableHeader('id', 'Id')}
                  {sortableHeader('paymentId', 'Payment Id')}
                  {sortableHeader('transactionCode', 'Transaction Code')}
                  {sortableHeader('amount', 'Amount')}
                  {sortableHeader('type', 'Transaction Type')}
                  {sortableHeader('transactionTime', 'Transaction Time')}
                  {sortableHeader('status', 'Status')}
                </tr>
              </thead>
              <tbody>
                {!isLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty-state">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((tran) => {
                    const status = getPaymentStatus(tran.status, tran.transactionStatusName)
                    return (
                      <tr key={tran.id}>
                        <td>{tran.id}</td>
                        <td>{tran.paymentId ?? '—'}</td>
                        <td>{tran.transactionCode}</td>
                        <td>{vndFormatter.format(tran.amount)}</td>
                        <td>{tran.transactionTypeName}</td>
                        <td>{formatDate(tran.transactionTime)}</td>
                        <td>
                          <span className={`transaction-status ${status.className}`}>{status.label}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="roles-footer">
            <button
              className="refresh-action"
              type="button"
              aria-label="Refresh transactions"
              onClick={() => void loadTransactions()}
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

export default AdminTransaction;