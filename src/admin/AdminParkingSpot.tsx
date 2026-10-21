import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import { getParkingAreas } from '../services/parkingAreaService'
import {
  changeParkingSpotStatus,
  createParkingSpot,
  deleteParkingSpot,
  getParkingAreaLookup,
  getParkingSpots,
  updateParkingSpot,
} from '../services/parkingSpotService'
import type { ParkingSpotDto, ParkingSpotLookup } from '../types/ParkingSpot/parkingSpot'
import type { ParkingAreaDto } from '../types/ParkingArea/parkingArea'
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconArrowsSort,
  IconAdjustmentsHorizontal,
  IconCheck,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

type ParkingSpotSortField = 'status' | 'parkingAreaId' | 'spotCode'
type SortDirection = 'asc' | 'desc' | null

const backendSortField: Record<ParkingSpotSortField, string> = {
  status: 'Status',
  parkingAreaId: 'ParkingAreaId',
  spotCode: 'SpotCode',
}

const parkingSpotStatusLabels: Record<number, string> = {
  1: 'Available',
  2: 'Reserved',
  3: 'Occupied',
  4: 'Unavailable',
}
const parkingSpotStatuses = [
  { value: 1, label: 'Available' },
  { value: 2, label: 'Reserved' },
  { value: 3, label: 'Occupied' },
  { value: 4, label: 'Unavailable' },
]

const AdminParkingSpot = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState<{ status?: number; parkingAreaId?: number }>({})
  const [filterDraft, setFilterDraft] = useState({ status: '', parkingAreaId: '' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
  const [lookupAreas, setLookupAreas] = useState<ParkingSpotLookup[]>([])
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [sortField, setSortField] = useState<ParkingSpotSortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [editingSpot, setEditingSpot] = useState<ParkingSpotDto | null>(null)
  const [spotCode, setSpotCode] = useState('')
  const [editError, setEditError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingSpotId, setDeletingSpotId] = useState<number | null>(null)
  const [statusDrafts, setStatusDrafts] = useState<Record<number, number>>({})
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createSpotCode, setCreateSpotCode] = useState('')
  const [createParkingAreaId, setCreateParkingAreaId] = useState('')
  const [parkingAreas, setParkingAreas] = useState<ParkingAreaDto[]>([])
  const [isLoadingParkingAreas, setIsLoadingParkingAreas] = useState(false)
  const [parkingAreasError, setParkingAreasError] = useState('')
  const [createError, setCreateError] = useState('')

  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
  const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)

  const loadSpots = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const result = await getParkingSpots({
        keyword: keyword.trim() || undefined,
        sorting: sortField && sortDirection ? `${backendSortField[sortField]} ${sortDirection}` : undefined,
        ...filters,
        skipCount: (safeCurrentPage - 1) * rowsPerPage,
        maxResultCount: rowsPerPage,
      })
      setParkingSpots(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách vị trí đỗ xe.')
      setParkingSpots([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, keyword, rowsPerPage, safeCurrentPage, sortDirection, sortField])

  useEffect(() => {
    void loadSpots()
  }, [loadSpots])

  useEffect(() => {
    if (!isFilterOpen) return

    const updatePosition = () => {
      const button = filterButtonRef.current
      if (!button) return
      const bounds = button.getBoundingClientRect()
      setFilterPosition({
        top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - 420)),
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

  const handleSort = (field: ParkingSpotSortField) => {
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

  const sortIcon = (field: ParkingSpotSortField) => {
    if (sortField !== field || !sortDirection) {
      return <IconArrowsSort className="action-icon" aria-hidden="true" />
    }

    const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
    return <Icon className="action-icon" aria-hidden="true" />
  }

  const openFilters = async () => {
    setFilterDraft({
      status: filters.status?.toString() ?? '',
      parkingAreaId: filters.parkingAreaId?.toString() ?? '',
    })
    setIsFilterOpen((open) => !open)
    if (lookupAreas.length || isLookupLoading) return

    setIsLookupLoading(true)
    setLookupError('')
    try {
      setLookupAreas(await getParkingAreaLookup())
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load parking area options.')
    } finally {
      setIsLookupLoading(false)
    }
  }

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFilters({
      status: filterDraft.status ? Number(filterDraft.status) : undefined,
      parkingAreaId: filterDraft.parkingAreaId ? Number(filterDraft.parkingAreaId) : undefined,
    })
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setFilterDraft({ status: '', parkingAreaId: '' })
    setFilters({})
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const openCreateModal = async () => {
    setIsCreateModalOpen(true)
    setCreateSpotCode('')
    setCreateParkingAreaId('')
    setCreateError('')
    setParkingAreasError('')
    setIsLoadingParkingAreas(true)

    try {
      const pageSize = 100
      const firstPage = await getParkingAreas({ skipCount: 0, maxResultCount: pageSize })
      const areas = [...firstPage.items]
      for (let skipCount = pageSize; skipCount < firstPage.totalCount; skipCount += pageSize) {
        const result = await getParkingAreas({ skipCount, maxResultCount: pageSize })
        areas.push(...result.items)
      }
      setParkingAreas(areas)
    } catch (error) {
      setParkingAreasError(error instanceof Error ? error.message : 'Unable to load parking areas.')
      setParkingAreas([])
    } finally {
      setIsLoadingParkingAreas(false)
    }
  }

  const closeCreateModal = () => {
    if (isSaving) return
    setIsCreateModalOpen(false)
    setCreateSpotCode('')
    setCreateParkingAreaId('')
    setCreateError('')
    setParkingAreasError('')
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedSpotCode = createSpotCode.trim()
    const parkingAreaId = Number(createParkingAreaId)

    if (!trimmedSpotCode) {
      setCreateError('Spot code is required.')
      return
    }
    if (!createParkingAreaId || !Number.isInteger(parkingAreaId) || parkingAreaId <= 0) {
      setCreateError('Please select a parking area.')
      return
    }

    setIsSaving(true)
    setCreateError('')
    try {
      await createParkingSpot({ spotCode: trimmedSpotCode, parkingAreaId })
      setIsCreateModalOpen(false)
      setCreateSpotCode('')
      setCreateParkingAreaId('')
      if (currentPage !== 1) setCurrentPage(1)
      else await loadSpots()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create parking spot.')
    } finally {
      setIsSaving(false)
    }
  }

  const openEditModal = (spot: ParkingSpotDto) => {
    setEditingSpot(spot)
    setSpotCode(spot.spotCode)
    setEditError('')
  }

  const closeEditModal = () => {
    setEditingSpot(null)
    setSpotCode('')
    setEditError('')
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedSpotCode = spotCode.trim()
    if (!editingSpot) return
    if (!trimmedSpotCode) {
      setEditError('Spot code is required.')
      return
    }

    setIsSaving(true)
    setEditError('')
    try {
      await updateParkingSpot({ id: editingSpot.id, spotCode: trimmedSpotCode })
      closeEditModal()
      await loadSpots()
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to update parking spot.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSpot = async (spot: ParkingSpotDto) => {
    if (!window.confirm(`Are you sure you want to delete parking spot "${spot.spotCode}"?`)) return

    setDeletingSpotId(spot.id)
    setErrorMessage('')
    try {
      await deleteParkingSpot(spot.id)
      if (parkingSpots.length === 1 && safeCurrentPage > 1) setCurrentPage((page) => page - 1)
      else await loadSpots()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete parking spot.')
    } finally {
      setDeletingSpotId(null)
    }
  }

  const handleSpotStatusChange = async (spot: ParkingSpotDto) => {
    const status = statusDrafts[spot.id] ?? spot.status
    if (status === spot.status) return

    setUpdatingStatusId(spot.id)
    setErrorMessage('')
    try {
      await changeParkingSpotStatus({ id: spot.id, status })
      setStatusDrafts((drafts) => {
        const nextDrafts = { ...drafts }
        delete nextDrafts[spot.id]
        return nextDrafts
      })
      await loadSpots()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to change parking spot status.')
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
            <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
            <h1>Parking spots</h1>
          </div>
          {!readOnly && (
            <button className="primary-action" type="button" onClick={() => void openCreateModal()}>
              <IconPlus className="action-icon" aria-hidden="true" />
              <span>Add parking spot</span>
            </button>
          )}
        </header>
        <section className="roles-card" aria-label="Parking spot list">
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
                placeholder="Search parking spots"
                aria-label="Search parking spots"
              />
            </label>
            <div className="filter-wrap">
              <button
                ref={filterButtonRef}
                className={`filter-trigger${filters.status !== undefined || filters.parkingAreaId !== undefined ? ' has-filters' : ''}`}
                type="button"
                aria-label="Open parking spot filters"
                aria-expanded={isFilterOpen}
                aria-controls="parking-spot-filter-popover"
                onClick={() => void openFilters()}
              >
                <IconAdjustmentsHorizontal className="action-icon" aria-hidden="true" />
                <span>Filters</span>
                {(filters.status !== undefined || filters.parkingAreaId !== undefined) && (
                  <span className="filter-count">{Number(filters.status !== undefined) + Number(filters.parkingAreaId !== undefined)}</span>
                )}
              </button>
            </div>
          </div>
          {isFilterOpen && createPortal(
            <form
              className="filter-popover"
              id="parking-spot-filter-popover"
              aria-label="Filter parking spots"
              onSubmit={applyFilters}
              style={{ top: filterPosition.top, right: filterPosition.right }}
            >
              <div className="filter-heading">
                <strong>Filter parking spots</strong>
                <button className="filter-close" type="button" aria-label="Close filters" onClick={() => setIsFilterOpen(false)}>
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </div>
              <label className="filter-field">
                <span>Status</span>
                <select
                  value={filterDraft.status}
                  onChange={(event) => setFilterDraft((draft) => ({ ...draft, status: event.target.value }))}
                >
                  <option value="">All statuses</option>
                  {parkingSpotStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>Parking area</span>
                <select
                  value={filterDraft.parkingAreaId}
                  onChange={(event) => setFilterDraft((draft) => ({ ...draft, parkingAreaId: event.target.value }))}
                  disabled={isLookupLoading || Boolean(lookupError)}
                >
                  <option value="">
                    {isLookupLoading ? 'Loading parking areas...' : 'All parking areas'}
                  </option>
                  {lookupAreas.map((area) => (
                    <option key={area.id} value={area.id}>{area.displayText}</option>
                  ))}
                </select>
                {lookupError && <span className="filter-field-error" role="alert">{lookupError}</span>}
              </label>
              <div className="filter-actions">
                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                <button className="primary-action" type="submit">Apply filters</button>
              </div>
            </form>,
            document.body,
          )}
          <div className="roles-table-wrap">
            {isLoading && <p className="roles-status" role="status">Loading parking spots...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
            <table className={`roles-table parkingSpots-table${readOnly ? ' parkingSpots-table-readonly' : ''}`}>
              <thead>
                <tr>
                  <th>
                    Spot code
                    <button className="sort-button" type="button" aria-label="Sort by spot code" onClick={() => handleSort('spotCode')}>
                      {sortIcon('spotCode')}
                    </button>
                  </th>
                  <th>
                    Parking area ID
                    <button className="sort-button" type="button" aria-label="Sort by parking area ID" onClick={() => handleSort('parkingAreaId')}>
                      {sortIcon('parkingAreaId')}
                    </button>
                  </th>
                  <th>Parking area code</th>
                  <th>Parking area name</th>
                  <th>
                    Status
                    <button className="sort-button" type="button" aria-label="Sort by status" onClick={() => handleSort('status')}>
                      {sortIcon('status')}
                    </button>
                  </th>
                  {!readOnly && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {!isLoading && parkingSpots.map((spot) => (
                  <tr key={spot.id}>
                    <td>{spot.spotCode}</td>
                    <td>{spot.parkingAreaId}</td>
                    <td>{spot.parkingAreaCode}</td>
                    <td>{spot.parkingAreaName}</td>
                    <td>
                      {readOnly ? (
                        parkingSpotStatusLabels[spot.status] ?? `Unknown (${spot.status})`
                      ) : (
                        <div className="staff-status-control">
                          <span>{parkingSpotStatusLabels[spot.status] ?? `Unknown (${spot.status})`}</span>
                          {(spot.status === 1 || spot.status === 4) && (
                            <>
                              <select
                                value={statusDrafts[spot.id] ?? spot.status}
                                onChange={(event) => setStatusDrafts((drafts) => ({
                                  ...drafts,
                                  [spot.id]: Number(event.target.value),
                                }))}
                                aria-label={`Change status for ${spot.spotCode}`}
                              >
                                <option value={1}>Available</option>
                                <option value={4}>Unavailable</option>
                              </select>
                              {(statusDrafts[spot.id] ?? spot.status) !== spot.status && (
                                <button
                                  className="staff-status-save"
                                  type="button"
                                  aria-label={`Save status for ${spot.spotCode}`}
                                  onClick={() => void handleSpotStatusChange(spot)}
                                  disabled={updatingStatusId !== null}
                                >
                                  {updatingStatusId === spot.id
                                    ? 'Saving...'
                                    : <IconCheck className="action-icon" aria-hidden="true" />}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    {!readOnly && (
                      <td>
                        <div className="role-actions parking-spot-actions">
                          <button className="edit-action" type="button" onClick={() => openEditModal(spot)}>
                            <IconPencil className="action-icon" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            className="delete-action"
                            type="button"
                            onClick={() => void handleDeleteSpot(spot)}
                            disabled={deletingSpotId !== null}
                          >
                            <IconTrash className="action-icon" aria-hidden="true" />
                            {deletingSpotId === spot.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && !errorMessage && parkingSpots.length === 0 && (
              <p className="empty-roles">No parking spots found.</p>
            )}
          </div>
          <footer className="roles-footer">
            <button
              className="refresh-action"
              type="button"
              aria-label="Refresh parking spots"
              onClick={() => void loadSpots()}
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
        {!readOnly && isCreateModalOpen && (
          <div
            className="role-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeCreateModal()
            }}
          >
            <section className="role-modal parking-spot-modal" role="dialog" aria-modal="true" aria-labelledby="create-parking-spot-title">
              <header className="role-modal-header">
                <div>
                  <span className="eyebrow-label">Parking management</span>
                  <h2 id="create-parking-spot-title">Add parking spot</h2>
                </div>
                <button className="modal-close" type="button" aria-label="Close create dialog" onClick={closeCreateModal} disabled={isSaving}>
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </header>
              <form onSubmit={handleCreateSubmit} noValidate>
                <div className="role-form-body">
                  <label className="role-field">
                    <span>Spot code <b>*</b></span>
                    <input
                      value={createSpotCode}
                      onChange={(event) => {
                        setCreateSpotCode(event.target.value)
                        setCreateError('')
                      }}
                      autoFocus
                      aria-invalid={Boolean(createError && !createSpotCode.trim())}
                      className={createError && !createSpotCode.trim() ? 'has-error' : undefined}
                    />
                  </label>
                  <label className="role-field">
                    <span>Parking area <b>*</b></span>
                    <select
                      value={createParkingAreaId}
                      onChange={(event) => {
                        setCreateParkingAreaId(event.target.value)
                        setCreateError('')
                      }}
                      disabled={isLoadingParkingAreas || Boolean(parkingAreasError) || parkingAreas.length === 0}
                      aria-invalid={Boolean(createError && !createParkingAreaId)}
                      className={createError && !createParkingAreaId ? 'has-error' : undefined}
                    >
                      <option value="">
                        {isLoadingParkingAreas ? 'Loading parking areas...' : 'Select a parking area'}
                      </option>
                      {parkingAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.parkingCode} - {area.name}
                        </option>
                      ))}
                    </select>
                    {parkingAreasError && <span className="role-field-error" role="alert">{parkingAreasError}</span>}
                    {!isLoadingParkingAreas && !parkingAreasError && parkingAreas.length === 0 && (
                      <span className="role-field-error" role="alert">Create a parking area before adding a spot.</span>
                    )}
                  </label>
                  {createError && <p className="role-form-error" role="alert">{createError}</p>}
                </div>
                <footer className="role-modal-footer">
                  <button className="modal-cancel" type="button" onClick={closeCreateModal} disabled={isSaving}>Cancel</button>
                  <button
                    className="primary-action"
                    type="submit"
                    disabled={isSaving || isLoadingParkingAreas || Boolean(parkingAreasError) || parkingAreas.length === 0}
                  >
                    <IconPlus className="action-icon" aria-hidden="true" />
                    <span>{isSaving ? 'Creating...' : 'Create'}</span>
                  </button>
                </footer>
              </form>
            </section>
          </div>
        )}
        {!readOnly && editingSpot && (
          <div
            className="role-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSaving) closeEditModal()
            }}
          >
            <section className="role-modal parking-spot-modal" role="dialog" aria-modal="true" aria-labelledby="parking-spot-modal-title">
              <header className="role-modal-header">
                <div>
                  <span className="eyebrow-label">Parking management</span>
                  <h2 id="parking-spot-modal-title">Edit parking spot</h2>
                </div>
                <button className="modal-close" type="button" aria-label="Close edit dialog" onClick={closeEditModal} disabled={isSaving}>
                  <IconX className="action-icon" aria-hidden="true" />
                </button>
              </header>
              <form onSubmit={handleEditSubmit} noValidate>
                <div className="role-form-body">
                  <label className="role-field">
                    <span>Spot code <b>*</b></span>
                    <input
                      value={spotCode}
                      onChange={(event) => {
                        setSpotCode(event.target.value)
                        setEditError('')
                      }}
                      autoFocus
                      aria-invalid={Boolean(editError)}
                      className={editError ? 'has-error' : undefined}
                    />
                    {editError && <span className="role-field-error" role="alert">{editError}</span>}
                  </label>
                </div>
                <footer className="role-modal-footer">
                  <button className="modal-cancel" type="button" onClick={closeEditModal} disabled={isSaving}>Cancel</button>
                  <button className="primary-action" type="submit" disabled={isSaving}>
                    <IconPencil className="action-icon" aria-hidden="true" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
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

export default AdminParkingSpot