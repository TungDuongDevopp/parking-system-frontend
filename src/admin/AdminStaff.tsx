import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import {
  changeStaffStatus,
  createStaff,
  deleteStaff,
  getAvailableUsers,
  getStaffs,
  updateStaff,
} from '../services/staffService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import type { AvailableUser, StaffDto } from '../types/Staff/staff'
import type { StaffQuery } from '../types/Staff/staffQuery'
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

type StaffFilters = Pick<
  StaffQuery,
  'status' | 'dateOfBirthFrom' | 'dateOfBirthTo' | 'hiredDateFrom' | 'hiredDateTo'
>

type FilterDraft = Omit<StaffFilters, 'status'> & { status: string }
type StaffFormField = keyof StaffFormValues
type StaffFilterField = 'dateOfBirthTo' | 'hiredDateTo'

const staffFieldAliases = {
  userId: ['userId', 'user'],
  name: ['name'],
  phoneNumber: ['phone', 'phoneNumber'],
  email: ['email'],
  gender: ['gender'],
  dateOfBirth: ['dateOfBirth', 'birthDate'],
  hiredDate: ['hiredDate'],
  address: ['address'],
} as const

const emptyFilterDraft: FilterDraft = {
  status: '',
  dateOfBirthFrom: '',
  dateOfBirthTo: '',
  hiredDateFrom: '',
  hiredDateTo: '',
}

const formatStaffDate = (value: string) => value.split('T')[0]

const staffStatuses = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
  { value: 2, label: 'Suspended' },
]

type StaffFormValues = {
  userId: string
  name: string
  phoneNumber: string
  email: string
  gender: string
  dateOfBirth: string
  hiredDate: string
  address: string
}

const emptyStaffForm: StaffFormValues = {
  userId: '',
  name: '',
  phoneNumber: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  hiredDate: '',
  address: '',
}

const AdminStaff = () => {
  const [staffs, setStaffs] = useState<StaffDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<StaffFilters>({})
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(emptyFilterDraft)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterErrors, setFilterErrors] = useState<FieldErrors<StaffFilterField>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const [filterPosition, setFilterPosition] = useState({ top: 0, right: 12 })
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffDto | null>(null)
  const [staffForm, setStaffForm] = useState<StaffFormValues>(emptyStaffForm)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [isAvailableUsersLoading, setIsAvailableUsersLoading] = useState(false)
  const [availableUsersError, setAvailableUsersError] = useState('')
  const [staffFormError, setStaffFormError] = useState('')
  const [staffFieldErrors, setStaffFieldErrors] = useState<FieldErrors<StaffFormField>>({})
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false)
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null)
  const [statusDrafts, setStatusDrafts] = useState<Record<number, number>>({})
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)

  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
  const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== '').length

  const loadStaffs = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getStaffs({
        keyword: keyword.trim() || undefined,
        skipCount: (safeCurrentPage - 1) * rowsPerPage,
        maxResultCount: rowsPerPage,
        ...filters,
      })

      setStaffs(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên.')
      setStaffs([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, keyword, rowsPerPage, safeCurrentPage])

  useEffect(() => {
    void loadStaffs()
  }, [loadStaffs])

  useEffect(() => {
    if (!isFilterOpen) return

    const updatePosition = () => {
      const button = filterButtonRef.current
      if (!button) return

      const bounds = button.getBoundingClientRect()
      setFilterPosition({
        top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - 520)),
        right: Math.max(12, Math.min(window.innerWidth - bounds.right, window.innerWidth - 360)),
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

   const openFilters = () => {
    setFilterDraft({
      status: filters.status?.toString() ?? '',
      dateOfBirthFrom: filters.dateOfBirthFrom ?? '',
      dateOfBirthTo: filters.dateOfBirthTo ?? '',
      hiredDateFrom: filters.hiredDateFrom ?? '',
      hiredDateTo: filters.hiredDateTo ?? '',
    })
    setFilterErrors({})
    setIsFilterOpen((open) => !open)
  }

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors: FieldErrors<StaffFilterField> = {}

    if (filterDraft.dateOfBirthFrom && filterDraft.dateOfBirthTo &&
      filterDraft.dateOfBirthFrom > filterDraft.dateOfBirthTo) {
      validationErrors.dateOfBirthTo = 'End date must be on or after the start date.'
    }

    if (filterDraft.hiredDateFrom && filterDraft.hiredDateTo &&
      filterDraft.hiredDateFrom > filterDraft.hiredDateTo) {
      validationErrors.hiredDateTo = 'End date must be on or after the start date.'
    }

    const status = filterDraft.status === '' ? undefined : Number(filterDraft.status)
    setFilterErrors(validationErrors)
    if (Object.keys(validationErrors).length) {
      return
    }

    setFilters({
      status,
      dateOfBirthFrom: filterDraft.dateOfBirthFrom || undefined,
      dateOfBirthTo: filterDraft.dateOfBirthTo || undefined,
      hiredDateFrom: filterDraft.hiredDateFrom || undefined,
      hiredDateTo: filterDraft.hiredDateTo || undefined,
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

  const closeStaffModal = () => {
    setIsStaffModalOpen(false)
    setEditingStaff(null)
    setStaffForm(emptyStaffForm)
    setStaffFormError('')
    setStaffFieldErrors({})
    setAvailableUsersError('')
    setIsStaffSubmitting(false)
  }

  const openCreateStaffModal = async () => {
    setEditingStaff(null)
    setStaffForm(emptyStaffForm)
    setStaffFormError('')
    setStaffFieldErrors({})
    setAvailableUsersError('')
    setAvailableUsers([])
    setIsStaffModalOpen(true)
    setIsAvailableUsersLoading(true)

    try {
      const users = await getAvailableUsers()
      setAvailableUsers(users)
    } catch (error) {
      setAvailableUsersError(error instanceof Error ? error.message : 'Không thể tải danh sách user khả dụng.')
    } finally {
      setIsAvailableUsersLoading(false)
    }
  }

  const openEditStaffModal = (staff: StaffDto) => {
    setEditingStaff(staff)
    setStaffForm({
      userId: '',
      name: staff.name,
      phoneNumber: staff.phoneNumber,
      email: staff.email ?? '',
      gender: staff.gender === null ? '' : staff.gender.toString(),
      dateOfBirth: staff.dateOfBirth ? formatStaffDate(staff.dateOfBirth) : '',
      hiredDate: formatStaffDate(staff.hiredDate),
      address: staff.address ?? '',
    })
    setStaffFormError('')
    setStaffFieldErrors({})
    setIsStaffModalOpen(true)
  }

  const handleStaffSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    setStaffFormError('')
    const validationErrors: FieldErrors<StaffFormField> = {}
    if (!editingStaff && !staffForm.userId) validationErrors.userId = 'Please select a user.'
    if (!staffForm.name.trim()) validationErrors.name = 'Name is required.'
    if (!staffForm.phoneNumber.trim()) validationErrors.phoneNumber = 'Phone number is required.'
    if (!staffForm.hiredDate) validationErrors.hiredDate = 'Hired date is required.'
    const today = new Date().toISOString().slice(0, 10)
    if (staffForm.dateOfBirth && staffForm.dateOfBirth > today) validationErrors.dateOfBirth = 'Date of birth cannot be in the future.'
    if (staffForm.hiredDate && staffForm.hiredDate > today) validationErrors.hiredDate = 'Hired date cannot be in the future.'
    setStaffFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setIsStaffSubmitting(true)
    try {
      const data = {
        name: staffForm.name.trim(),
        phoneNumber: staffForm.phoneNumber.trim(),
        email: staffForm.email.trim() || null,
        gender: staffForm.gender === '' ? null : staffForm.gender === 'true',
        hiredDate: staffForm.hiredDate,
        dateOfBirth: staffForm.dateOfBirth || null,
        address: staffForm.address.trim() || null,
      }
      if (editingStaff) {
        await updateStaff({ id: editingStaff.id, ...data })
      } else {
        await createStaff({ userId: Number(staffForm.userId), ...data })
      }

      closeStaffModal()
      await loadStaffs()
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : `Không thể ${editingStaff ? 'cập nhật' : 'tạo'} nhân viên.`
      const abpError = getAbpErrorFromException(error)
      const serverErrors = abpError
        ? mapAbpFieldErrors(abpError, staffFieldAliases)
        : mapMessageToFieldErrors(message, staffFieldAliases)
      if (Object.keys(serverErrors).length) setStaffFieldErrors(serverErrors)
      else setStaffFormError(message)
    } finally {
      setIsStaffSubmitting(false)
    }
  }

  const handleDeleteStaff = async (staff: StaffDto) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${staff.name}" không?`)) return

    setDeletingStaffId(staff.id)
    setErrorMessage('')
    try {
      await deleteStaff(staff.id)
      if (staffs.length === 1 && safeCurrentPage > 1) setCurrentPage((page) => page - 1)
      else await loadStaffs()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể xóa nhân viên.')
    } finally {
      setDeletingStaffId(null)
    }
  }

  const handleStaffStatusChange = async (staff: StaffDto) => {
    const status = statusDrafts[staff.id] ?? staff.status
    if (status === staff.status) return

    setUpdatingStatusId(staff.id)
    setErrorMessage('')
    try {
      await changeStaffStatus({ id: staff.id, status })

      setStatusDrafts((drafts) => {
        const nextDrafts = { ...drafts }
        delete nextDrafts[staff.id]
        return nextDrafts
      })
      await loadStaffs()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể thay đổi trạng thái nhân viên.')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  return (
    <div className="workspace roles-workspace">
      <Sidebar />
      <main className="main-content roles-content">
        <header className="roles-header">
          <div>
            <span className="eyebrow-label">Administration</span>
            <h1>Staffs</h1>
          </div>
          <button className="primary-action" type="button" onClick={() => void openCreateStaffModal()}>
            <IconPlus className="action-icon" aria-hidden="true" />
            <span>Create staff</span>
          </button>
        </header>
        <section className="roles-card" aria-label="Staff list">
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
                placeholder="Search staff"
                aria-label="Search staff"
              />
            </label>
            <div className="filter-wrap">
              <button
                ref={filterButtonRef}
                className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                type="button"
                aria-label="Open staff filters"
                aria-expanded={isFilterOpen}
                aria-controls="filter-popover"
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
              className="filter-popover"
              id="filter-popover"
              aria-label="Filter staff"
              onSubmit={applyFilters}
              style={{ top: filterPosition.top, right: filterPosition.right }}
            >
              <div className="filter-heading">
                <strong>Filter staff</strong>
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
                <span>Status</span>
                <select
                  value={filterDraft.status}
                  onChange={(event) => {
                    setFilterDraft((draft) => ({ ...draft, status: event.target.value }))
                  }}
                >
                  <option value="">All statuses</option>
                  {staffStatuses.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="filter-group">
                <legend>Date of birth</legend>
                <label className="filter-field">
                  <span>From</span>
                  <input
                    type="date"
                    value={filterDraft.dateOfBirthFrom}
                    max={filterDraft.dateOfBirthTo || undefined}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, dateOfBirthFrom: event.target.value }))}
                  />
                </label>
                <label className="filter-field">
                  <span>To</span>
                  <input
                    type="date"
                    value={filterDraft.dateOfBirthTo}
                    min={filterDraft.dateOfBirthFrom || undefined}
                    onChange={(event) => {
                      setFilterDraft((draft) => ({ ...draft, dateOfBirthTo: event.target.value }))
                      setFilterErrors((errors) => ({ ...errors, dateOfBirthTo: undefined }))
                    }}
                    aria-invalid={Boolean(filterErrors.dateOfBirthTo)}
                    className={filterErrors.dateOfBirthTo ? 'has-error' : undefined}
                  />
                  {filterErrors.dateOfBirthTo && <span className="filter-field-error" role="alert">{filterErrors.dateOfBirthTo}</span>}
                </label>
              </fieldset>
              <fieldset className="filter-group">
                <legend>Hired date</legend>
                <label className="filter-field">
                  <span>From</span>
                  <input
                    type="date"
                    value={filterDraft.hiredDateFrom}
                    max={filterDraft.hiredDateTo || undefined}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, hiredDateFrom: event.target.value }))}
                  />
                </label>
                <label className="filter-field">
                  <span>To</span>
                  <input
                    type="date"
                    value={filterDraft.hiredDateTo}
                    min={filterDraft.hiredDateFrom || undefined}
                    onChange={(event) => {
                      setFilterDraft((draft) => ({ ...draft, hiredDateTo: event.target.value }))
                      setFilterErrors((errors) => ({ ...errors, hiredDateTo: undefined }))
                    }}
                    aria-invalid={Boolean(filterErrors.hiredDateTo)}
                    className={filterErrors.hiredDateTo ? 'has-error' : undefined}
                  />
                  {filterErrors.hiredDateTo && <span className="filter-field-error" role="alert">{filterErrors.hiredDateTo}</span>}
                </label>
              </fieldset>
              <div className="filter-actions">
                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                <button className="primary-action" type="submit">Apply filters</button>
              </div>
            </form>,
            document.body,
          )}
          <div className="roles-table-wrap">
            {isLoading && <p className="roles-status" role="status">Loading staff...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
            <table className="roles-table staffs-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone number</th>
                  <th>Email</th>
                  <th>Date of birth</th>
                  <th>Hired date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && staffs.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.name}</td>
                    <td>{staff.phoneNumber}</td>
                    <td>{staff.email}</td>
                    <td>{staff.dateOfBirth ? formatStaffDate(staff.dateOfBirth) : '—'}</td>
                    <td>{formatStaffDate(staff.hiredDate)}</td>
                    <td>
                      <div className="staff-status-control">
                        <span>{staff.statusName}</span>
                        <select
                          value={statusDrafts[staff.id] ?? staff.status}
                          onChange={(event) => setStatusDrafts((drafts) => ({
                            ...drafts,
                            [staff.id]: Number(event.target.value),
                          }))}
                          aria-label={`Change status for ${staff.name}`}
                        >
                          {staffStatuses.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                        {(statusDrafts[staff.id] ?? staff.status) !== staff.status && (
                          <button
                            className="staff-status-save"
                            type="button"
                            aria-label={`Save status for ${staff.name}`}
                            onClick={() => void handleStaffStatusChange(staff)}
                            disabled={updatingStatusId !== null}
                          >
                            <IconCheck className="action-icon" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="role-actions">
                        <button className="edit-action" type="button" onClick={() => openEditStaffModal(staff)}>
                          <IconPencil className="action-icon" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          className="delete-action"
                          type="button"
                          onClick={() => void handleDeleteStaff(staff)}
                          disabled={deletingStaffId !== null}
                        >
                          <IconTrash className="action-icon" aria-hidden="true" />
                          {deletingStaffId === staff.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && !errorMessage && staffs.length === 0 && (
              <p className="empty-roles">No staff found.</p>
            )}
          </div>
          <footer className="roles-footer">
            <button
              className="refresh-action"
              type="button"
              aria-label="Refresh staff"
              onClick={() => void loadStaffs()}
              disabled={isLoading}
            >
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
        {isStaffModalOpen && (
          <div
            className="role-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeStaffModal()
            }}
          >
            <section className="role-modal staff-modal" role="dialog" aria-modal="true" aria-labelledby="staff-modal-title">
              <header className="role-modal-header">
                <div>
                  <span className="eyebrow-label">Administration</span>
                  <h2 id="staff-modal-title">{editingStaff ? 'Edit staff' : 'Create staff'}</h2>
                </div>
                <button
                  className="modal-close"
                  type="button"
                  aria-label="Close staff dialog"
                  onClick={closeStaffModal}
                >
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </header>
              
              <form onSubmit={handleStaffSubmit} noValidate>
                <div className="role-form-body staff-form-grid">
                  {!editingStaff && (
                    <label className="role-field staff-form-wide">
                      <span>Staff user <b>*</b></span>
                      <select
                        value={staffForm.userId}
                        onChange={(event) => {
                          setStaffForm((form) => ({ ...form, userId: event.target.value }))
                          setStaffFieldErrors((errors) => ({ ...errors, userId: undefined }))
                        }}
                        disabled={isAvailableUsersLoading || Boolean(availableUsersError)}
                        aria-invalid={Boolean(staffFieldErrors.userId)}
                        className={staffFieldErrors.userId ? 'has-error' : undefined}
                      >
                        <option value="">
                          {isAvailableUsersLoading ? 'Loading users...' : 'Select a user'}
                        </option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} ({user.userName})
                          </option>
                        ))}
                      </select>
                      {staffFieldErrors.userId && <span className="role-field-error" role="alert">{staffFieldErrors.userId}</span>}
                      {availableUsersError && <span className="role-form-error" role="alert">{availableUsersError}</span>}
                      {!isAvailableUsersLoading && !availableUsersError && availableUsers.length === 0 && (
                        <span className="staff-form-hint">No eligible users available.</span>
                      )}
                    </label>
                  )}
                  <label className="role-field">
                    <span>Name <b>*</b></span>
                    <input
                      value={staffForm.name}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, name: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, name: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.name)}
                      className={staffFieldErrors.name ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.name && <span className="role-field-error" role="alert">{staffFieldErrors.name}</span>}
                  </label>
                  <label className="role-field">
                    <span>Phone number <b>*</b></span>
                    <input
                      value={staffForm.phoneNumber}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, phoneNumber: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, phoneNumber: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.phoneNumber)}
                      className={staffFieldErrors.phoneNumber ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.phoneNumber && <span className="role-field-error" role="alert">{staffFieldErrors.phoneNumber}</span>}
                  </label>
                  <label className="role-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, email: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, email: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.email)}
                      className={staffFieldErrors.email ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.email && <span className="role-field-error" role="alert">{staffFieldErrors.email}</span>}
                  </label>
                  <label className="role-field">
                    <span>Gender</span>
                    <select
                      value={staffForm.gender}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, gender: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, gender: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.gender)}
                      className={staffFieldErrors.gender ? 'has-error' : undefined}
                    >
                      <option value="">Unspecified</option>
                      <option value="true">Male</option>
                      <option value="false">Female</option>
                    </select>
                    {staffFieldErrors.gender && <span className="role-field-error" role="alert">{staffFieldErrors.gender}</span>}
                  </label>
                  <label className="role-field">
                    <span>Date of birth</span>
                    <input
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={staffForm.dateOfBirth}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, dateOfBirth: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, dateOfBirth: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.dateOfBirth)}
                      className={staffFieldErrors.dateOfBirth ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.dateOfBirth && <span className="role-field-error" role="alert">{staffFieldErrors.dateOfBirth}</span>}
                  </label>
                  <label className="role-field">
                    <span>Hired date <b>*</b></span>
                    <input
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={staffForm.hiredDate}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, hiredDate: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, hiredDate: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.hiredDate)}
                      className={staffFieldErrors.hiredDate ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.hiredDate && <span className="role-field-error" role="alert">{staffFieldErrors.hiredDate}</span>}
                  </label>
                  <label className="role-field staff-form-wide">
                    <span>Address</span>
                    <input
                      value={staffForm.address}
                      onChange={(event) => {
                        setStaffForm((form) => ({ ...form, address: event.target.value }))
                        setStaffFieldErrors((errors) => ({ ...errors, address: undefined }))
                      }}
                      aria-invalid={Boolean(staffFieldErrors.address)}
                      className={staffFieldErrors.address ? 'has-error' : undefined}
                    />
                    {staffFieldErrors.address && <span className="role-field-error" role="alert">{staffFieldErrors.address}</span>}
                  </label>
                  {staffFormError && <p className="role-form-error staff-form-wide" role="alert">{staffFormError}</p>}
                </div>
                <footer className="role-modal-footer">
                  <button className="modal-cancel" type="button" onClick={closeStaffModal} disabled={isStaffSubmitting}>
                    Cancel
                  </button>
                  <button
                    className="primary-action"
                    type="submit"
                    disabled={isStaffSubmitting || isAvailableUsersLoading || (!editingStaff && availableUsers.length === 0)}
                  >
                    {editingStaff
                      ? <IconPencil className="action-icon" aria-hidden="true" />
                      : <IconPlus className="action-icon" aria-hidden="true" />}
                    <span>{isStaffSubmitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}</span>
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

export default AdminStaff
