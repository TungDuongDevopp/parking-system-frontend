import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import {getParkingAreas,
    createParkingArea,
    updateParkingArea,
    deleteParkingArea,
    changeParkingAreaStatus
 } from '../services/parkingAreaService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import type { ParkingAreaQuery } from '../types/ParkingArea/parkingAreaQuery'
import type { ParkingAreaDto } from '../types/ParkingArea/parkingArea'
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

type ParkingAreaSortField =
  | 'parkingCode'
  | 'name'
  | 'vehicleType'
  | 'capacity'
  | 'currentOccupancy'
  | 'parkingMode'
  | 'location'
  | 'status'
type SortDirection = 'asc' | 'desc' | null

const backendSortField: Record<ParkingAreaSortField, string> = {
  parkingCode: 'ParkingCode',
  name: 'Name',
  vehicleType: 'VehicleType',
  capacity: 'Capacity',
  currentOccupancy: 'CurrentOccupancy',
  parkingMode: 'ParkingMode',
  location: 'Location',
  status: 'Status',
}

type ParkingAreaFilters = Pick<
ParkingAreaQuery,
'status' | 'vehicleType' | 'minCapacity' | 'maxCapacity' | 'parkingMode'
>

type FilterDraft = {
  status: string
  vehicleType: string
  minCapacity: string
  maxCapacity: string
  parkingMode: string
}
type ParkingAreaFilterField = 'maxCapacity'
type ParkingAreaFilterErrors = FieldErrors<ParkingAreaFilterField>

const emptyFilterDraft: FilterDraft = {
  status: '',
  vehicleType: '',
  minCapacity: '',
  maxCapacity: '',
  parkingMode: '',
}

const vehicleTypes = [
  {value:1, label:'Bicycle'},
  {value:2, label:'ElectricBicycle'},
  {value:3, label:'Motorcycle'},
  {value:4, label:'ElectricMotorcycle'},
  {value:5, label:'Car'}
]
const parkingAreaStatuses =[
  { value: 0, label: 'Inactive' },
  { value: 1, label: 'Active' },
]
const parkingAreaModes =[
   { value: 0, label: 'IndividualSpot' },
  { value: 1, label: 'CapacityBase' },
]
type AreaFormValues = {
    parkingCode : string,
    name: string,
    vehicleType: number | '',
    capacity: number | '',
    parkingMode: number | '',
    location: string,
    description?: string
}
type AreaFromField = keyof AreaFormValues
const areaFieldAliases: Record<AreaFromField, readonly string[]> = {
  parkingCode: ['parkingCode', 'code'],
  name: ['name'],
  vehicleType: ['vehicleType'],
  capacity: ['capacity'],
  parkingMode: ['parkingMode'],
  location: ['location'],
  description: ['description'],
}
const emptyAreaForm : AreaFormValues ={
    parkingCode : '',
    name: '',
    vehicleType: '',
    capacity: '',
    parkingMode: '',
    location: '',
    description: ''
}
const AdminParkingArea = ({ readOnly = false }: { readOnly?: boolean }) =>{
  const [parkingAreas,setParkingAreas] = useState<ParkingAreaDto[]>([])
  const [isLoading,setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusDrafts, setStatusDrafts] = useState<Record<number, number>>({})

  //Search & Filter
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<ParkingAreaFilters>({})
  const [sortField, setSortField] = useState<ParkingAreaSortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(emptyFilterDraft)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterErrors, setFilterErrors] = useState<ParkingAreaFilterErrors>({})
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
  //Pagintation
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
  const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)
  //form
  const [isAreaModalOpen,setIsAreaModalOpen] = useState(false)
  const [areaFormError, setAreaFormError] = useState('')
  const [editingArea, setEditingArea] = useState<ParkingAreaDto | null>(null)
  const [areaForm, setAreaForm] = useState<AreaFormValues>(emptyAreaForm)
  const [areaFieldErrors, setAreaFieldErrors] = useState<FieldErrors<AreaFromField>>({})
  const [isAreaSubmitting, setIsAreaSubmitting] = useState(false)
  //action 
  const [deletingAreaId, setDeletingAreaId] = useState<number | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)
 
  const loadAreas = useCallback(async () =>{
    setIsLoading(true)
    setErrorMessage('')
    try{
      const result = await getParkingAreas({
        keyword: keyword.trim() || undefined,
        sorting: sortField && sortDirection ? `${backendSortField[sortField]} ${sortDirection}` : undefined,
        skipCount: (safeCurrentPage-1) *rowsPerPage,
        maxResultCount:rowsPerPage,
        ...filters
      })
      setParkingAreas(result.items)
      setTotalCount(result.totalCount)
    }
    catch(error){
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách khu vực đỗ xe.')
      setParkingAreas([])
      setTotalCount(0)
    }
    finally{
      setIsLoading(false)
    }
  },[filters,keyword,rowsPerPage,safeCurrentPage,sortDirection,sortField])

  useEffect(() => {
    void loadAreas()
  }, [loadAreas])

  const handleSort = (field: ParkingAreaSortField) => {
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

  const sortIcon = (field: ParkingAreaSortField) => {
    if (sortField !== field || !sortDirection) {
      return <IconArrowsSort className="action-icon" aria-hidden="true" />
    }

    const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
    return <Icon className="action-icon" aria-hidden="true" />
  }

  const sortHeader = (field: ParkingAreaSortField, label: string) => (
    <th key={field}>
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
      vehicleType: filters.vehicleType?.toString() ?? '',
      minCapacity: filters.minCapacity?.toString() ?? '',
      maxCapacity: filters.maxCapacity?.toString() ?? '',
      parkingMode: filters.parkingMode?.toString() ?? '',
    })
    setFilterErrors({})
    setIsFilterOpen((open) => !open)
  }

  const applyFilters = (event: SubmitEvent) => {
    event.preventDefault()
    const minCapacity = filterDraft.minCapacity === '' ? undefined : Number(filterDraft.minCapacity)
    const maxCapacity = filterDraft.maxCapacity === '' ? undefined : Number(filterDraft.maxCapacity)
    const validationErrors: ParkingAreaFilterErrors = {}

    if (minCapacity !== undefined && maxCapacity !== undefined && minCapacity > maxCapacity) {
      validationErrors.maxCapacity = 'Maximum capacity must be greater than or equal to minimum capacity.'
    }

    setFilterErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setFilters({
      status: filterDraft.status === '' ? undefined : Number(filterDraft.status),
      vehicleType: filterDraft.vehicleType === '' ? undefined : Number(filterDraft.vehicleType),
      minCapacity,
      maxCapacity,
      parkingMode: filterDraft.parkingMode === '' ? undefined : Number(filterDraft.parkingMode),
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

  const openCreateAreaModal = () =>{
    setAreaFieldErrors({})
    setAreaFormError('')
    setEditingArea(null)
    setAreaForm(emptyAreaForm)
    setIsAreaSubmitting(false)
    setIsAreaModalOpen(true)
  }

  const closeAreaModal = () =>{
    setIsAreaModalOpen(false)
    setEditingArea(null)
    setAreaForm(emptyAreaForm)
    setAreaFormError('')
    setAreaFieldErrors({})
    setIsAreaSubmitting(false)
  }
 
  const openEditAreaModal = (area: ParkingAreaDto)=>{
    setEditingArea(area)
    setAreaForm({
      parkingCode: area.parkingCode,
      name: area.name,
      capacity: area.capacity,
      location: area.location,
      vehicleType: area.vehicleType,
      description : area.description ?? '',
      parkingMode: area.parkingMode
    })
    setAreaFormError('')
    setAreaFieldErrors({})
    setIsAreaModalOpen(true)
  }

  const handleAreaSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    setAreaFormError('')
    const validationErrors: FieldErrors<AreaFromField> = {}

    if (!areaForm.parkingCode.trim()) validationErrors.parkingCode = 'Parking code is required.'
    if (!areaForm.name.trim()) validationErrors.name = 'Area name is required.'
    if (areaForm.vehicleType === '') validationErrors.vehicleType = 'Please select a vehicle type.'
    if (areaForm.capacity === '' || !Number.isInteger(areaForm.capacity) || areaForm.capacity < 1) {
      validationErrors.capacity = 'Capacity must be a positive whole number.'
    }
    if (areaForm.parkingMode === '') validationErrors.parkingMode = 'Please select a parking mode.'
    if (!areaForm.location.trim()) validationErrors.location = 'Location is required.'

    setAreaFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length) return
    if (areaForm.vehicleType === '' || areaForm.capacity === '' || areaForm.parkingMode === '') return

    setIsAreaSubmitting(true)
    try {
      const data = {
        parkingCode: areaForm.parkingCode.trim(),
        name: areaForm.name.trim(),
        vehicleType: areaForm.vehicleType,
        capacity: areaForm.capacity,
        parkingMode: areaForm.parkingMode,
        location: areaForm.location.trim(),
        description: areaForm.description?.trim() || null,
      }

      if (editingArea) {
        await updateParkingArea({ id: editingArea.id, ...data })
      } else {
        await createParkingArea(data)
      }

      closeAreaModal()
      await loadAreas()
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : `Không thể ${editingArea ? 'cập nhật' : 'tạo'} khu vực đỗ xe.`
      const abpError = getAbpErrorFromException(error)
      const serverErrors = abpError
        ? mapAbpFieldErrors(abpError, areaFieldAliases)
        : mapMessageToFieldErrors(message, areaFieldAliases)
      if (Object.keys(serverErrors).length) setAreaFieldErrors(serverErrors)
      else setAreaFormError(message)
    } finally {
      setIsAreaSubmitting(false)
    }
  }

  const handleDeleteArea = async (area: ParkingAreaDto) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khu vực đỗ xe "${area.name}" không?`)) return

    setDeletingAreaId(area.id)
    setErrorMessage('')
    try {
      await deleteParkingArea(area.id)
      if (parkingAreas.length === 1 && safeCurrentPage > 1) setCurrentPage((page) => page - 1)
      else await loadAreas()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể xóa khu vực đỗ xe.')
    } finally {
      setDeletingAreaId(null)
    }
  }

  const handleAreaStatusChange = async (area: ParkingAreaDto) => {
    const status = statusDrafts[area.id] ?? area.status
    if (status === area.status) return

    setUpdatingStatusId(area.id)
    setErrorMessage('')
    try {
      await changeParkingAreaStatus({ id: area.id, status })
      setStatusDrafts((drafts) => {
        const nextDrafts = { ...drafts }
        delete nextDrafts[area.id]
        return nextDrafts
      })
      await loadAreas()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể thay đổi trạng thái khu vực đỗ xe.')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const isEditingActiveArea = editingArea?.status === 1

  return (
    <div className="workspace roles-workspace">
      <Sidebar />
      <main className="main-content roles-content">
        <header className="roles-header">
              <div>
                <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                <h1>Parking Areas</h1>
              </div>
            {!readOnly && (
              <button className="primary-action" type="button" onClick={openCreateAreaModal}>
                <IconPlus className="action-icon" aria-hidden="true" />
                <span>Create parking area</span>
              </button>
            )}
        </header>

        <section className="roles-card" aria-label="ParkingArea list">
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
                placeholder="Search parkingArea"
                aria-label="Search parkingArea"
              />
            </label>
            <div className="filter-wrap">
              <button
                ref={filterButtonRef}
                className={`filter-trigger${activeFilterCount ? ' has-filters' : ''}`}
                type="button"
                aria-label="Open parkingArea filters"
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
              aria-label="Filter parking areas"
              onSubmit={applyFilters}
              style={{ top: filterPosition.top, right: filterPosition.right }}
            >
              <div className="filter-heading">
                <strong>Filter parking areas</strong>
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
                  onChange={(event) => setFilterDraft((draft) => ({ ...draft, status: event.target.value }))}
                >
                  <option value="">All statuses</option>
                  {parkingAreaStatuses.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>Vehicle type</span>
                <select
                  value={filterDraft.vehicleType}
                  onChange={(event) => setFilterDraft((draft) => ({ ...draft, vehicleType: event.target.value }))}
                >
                  <option value="">All vehicle types</option>
                  {vehicleTypes.map((vehicleType) => (
                    <option key={vehicleType.value} value={vehicleType.value}>{vehicleType.label}</option>
                  ))}
                </select>
              </label>
              <fieldset className="filter-group">
                <legend>Capacity</legend>
                <label className="filter-field">
                  <span>Minimum</span>
                  <input
                    type="number"
                    min="0"
                    value={filterDraft.minCapacity}
                    max={filterDraft.maxCapacity || undefined}
                    onChange={(event) => setFilterDraft((draft) => ({ ...draft, minCapacity: event.target.value }))}
                  />
                </label>
                <label className="filter-field">
                  <span>Maximum</span>
                  <input
                    type="number"
                    min={filterDraft.minCapacity || '0'}
                    value={filterDraft.maxCapacity}
                    onChange={(event) => {
                      setFilterDraft((draft) => ({ ...draft, maxCapacity: event.target.value }))
                      setFilterErrors((errors) => ({ ...errors, maxCapacity: undefined }))
                    }}
                    aria-invalid={Boolean(filterErrors.maxCapacity)}
                    className={filterErrors.maxCapacity ? 'has-error' : undefined}
                  />
                  {filterErrors.maxCapacity && <span className="filter-field-error" role="alert">{filterErrors.maxCapacity}</span>}
                </label>
              </fieldset>
              <label className="filter-field">
                <span>Parking mode</span>
                <select
                  value={filterDraft.parkingMode}
                  onChange={(event) => setFilterDraft((draft) => ({ ...draft, parkingMode: event.target.value }))}
                >
                  <option value="">All parking modes</option>
                  {parkingAreaModes.map((parkingMode) => (
                    <option key={parkingMode.value} value={parkingMode.value}>{parkingMode.label}</option>
                  ))}
                </select>
              </label>
              <div className="filter-actions">
                <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                <button className="primary-action" type="submit">Apply filters</button>
              </div>
            </form>,
            document.body,
          )}
          <div className="roles-table-wrap">
            {isLoading && <p className="roles-status" role="status">Loading parking areas...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
            <table className="roles-table parkingAreas-table">
                  <thead>
                    <tr>
                      {sortHeader('parkingCode', 'Parking code')}
                      {sortHeader('vehicleType', 'Vehicle type')}
                      {sortHeader('capacity', 'Capacity')}
                      {sortHeader('currentOccupancy', 'Current occupancy')}
                      {sortHeader('parkingMode', 'Parking mode')}
                      {sortHeader('location', 'Location')}
                      {sortHeader('status', 'Status')}
                      {!readOnly && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && parkingAreas.map((area)=> (
                      <tr key={area.id}>
                          <td>{area.parkingCode}</td>
                          <td>{area.vehicleTypeName}</td>
                          <td>{area.capacity}</td>
                          <td>{area.currentOccupancy}</td>
                          <td>{area.parkingModeName}</td>
                          <td>{area.location}</td>
                          <td>
                            <div className="staff-status-control">
                                <span>{area.parkingAreaStatusName}</span>
                                {!readOnly && (
                                  <>
                                    <select
                                      value={statusDrafts[area.id] ?? area.status}
                                      onChange={(event) => setStatusDrafts((drafts) => ({
                                        ...drafts,
                                        [area.id]: Number(event.target.value),
                                      }))}
                                      aria-label={`Change status for ${area.name}`}
                                    >
                                      {parkingAreaStatuses.map((status) => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                      ))}
                                    </select>
                                    {(statusDrafts[area.id] ?? area.status) !== area.status && (
                                      <button
                                        className="staff-status-save"
                                        type="button"
                                        aria-label={`Save status for ${area.name}`}
                                        onClick={() => void handleAreaStatusChange(area)}
                                        disabled={updatingStatusId !== null}
                                      >
                                        {updatingStatusId === area.id
                                          ? 'Saving...'
                                          : <IconCheck className="action-icon" aria-hidden="true" />}
                                      </button>
                                    )}
                                  </>
                                )}
                            </div>
                          </td>
                          {!readOnly && (
                            <td>
                              <div className="role-actions">
                                <button className="edit-action" type="button" onClick={() => openEditAreaModal(area)}>
                                  <IconPencil className="action-icon" aria-hidden="true" />
                                  Edit
                                </button>
                                <button
                                  className="delete-action"
                                  type="button"
                                  onClick={() => void handleDeleteArea(area)}
                                  disabled={deletingAreaId !== null}
                                >
                                  <IconTrash className="action-icon" aria-hidden="true" />
                                  {deletingAreaId === area.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          )}
                      </tr>
                    ))}
                  </tbody>
            </table>
            {isLoading && <p className="roles-status" role="status">Loading parking areas...</p>}
            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
             {!isLoading && !errorMessage && parkingAreas.length === 0 && (
              <p className="empty-roles">No areas found.</p>
            )}
          </div>
          <footer className="roles-footer">
             <button
              className="refresh-action"
              type="button"
              aria-label="Refresh areas"
              onClick={() => void loadAreas()}
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
        {!readOnly && isAreaModalOpen && (
          <div   className="role-modal-backdrop"
                role="presentation"
                 onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeAreaModal()
            }}>
             <section className="role-modal area-modal" role="dialog" aria-modal="true" aria-labelledby="area-modal-title">
                <header className="role-modal-header area-modal-header">
                  <div>
                    <span className="eyebrow-label">Parking management</span>
                    <h2 id="area-modal-title">{editingArea ? 'Edit parking area' : 'Create parking area'}</h2>
                    <p>Set up the area details, vehicle type, and parking capacity.</p>
                  </div>
                  <button
                    className="modal-close"
                    type="button"
                    aria-label="Close parking area form"
                    onClick={closeAreaModal}
                  >
                    <IconX className="action-icon" aria-hidden="true" />
                  </button>
                </header>
                <form onSubmit={handleAreaSubmit} noValidate>
                  <div className="role-form-body area-form-grid">
                    <label className="role-field">
                      <span>Parking code <b>*</b></span>
                      <input
                        value={areaForm.parkingCode}
                        onChange={(event) => {
                          setAreaForm((form) => ({ ...form, parkingCode: event.target.value }))
                          setAreaFieldErrors((errors) => ({ ...errors, parkingCode: undefined }))
                        }}
                        placeholder="e.g. CAR-ZONE-B01"
                        aria-invalid={Boolean(areaFieldErrors.parkingCode)}
                        className={areaFieldErrors.parkingCode ? 'has-error' : undefined}
                      />
                      {areaFieldErrors.parkingCode && <span className="role-field-error" role="alert">{areaFieldErrors.parkingCode}</span>}
                    </label>
                    <label className="role-field">
                      <span>Area name <b>*</b></span>
                      <input
                        value={areaForm.name}
                        onChange={(event) => {
                          setAreaForm((form) => ({ ...form, name: event.target.value }))
                          setAreaFieldErrors((errors) => ({ ...errors, name: undefined }))
                        }}
                        placeholder="e.g. Basement parking B"
                        aria-invalid={Boolean(areaFieldErrors.name)}
                        className={areaFieldErrors.name ? 'has-error' : undefined}
                      />
                      {areaFieldErrors.name && <span className="role-field-error" role="alert">{areaFieldErrors.name}</span>}
                    </label>
                    <label className="role-field">
                      <span>Vehicle type <b>*</b></span>
                      <select
                        value={areaForm.vehicleType}
                        disabled={isEditingActiveArea}
                        onChange={(event) => {
                          setAreaForm((form) => ({
                            ...form,
                            vehicleType: event.target.value === '' ? '' : Number(event.target.value),
                          }))
                          setAreaFieldErrors((errors) => ({ ...errors, vehicleType: undefined }))
                        }}
                        aria-invalid={Boolean(areaFieldErrors.vehicleType)}
                        className={areaFieldErrors.vehicleType ? 'has-error' : undefined}
                      >
                        <option value="" disabled>Select a vehicle type</option>
                        {vehicleTypes.map((vehicleType) => (
                          <option key={vehicleType.value} value={vehicleType.value}>{vehicleType.label}</option>
                        ))}
                      </select>
                      {areaFieldErrors.vehicleType && <span className="role-field-error" role="alert">{areaFieldErrors.vehicleType}</span>}
                    </label>
                    <label className="role-field">
                      <span>Capacity <b>*</b></span>
                      <input
                        type="number"
                        min="1"
                        value={areaForm.capacity}
          
                        disabled={isEditingActiveArea}
                        onChange={(event) => {
                          setAreaForm((form) => ({
                            ...form,
                            capacity: event.target.value === '' ? '' : Number(event.target.value),
                          }))
                          setAreaFieldErrors((errors) => ({ ...errors, capacity: undefined }))
                        }}
                        placeholder="Enter total capacity"
                        aria-invalid={Boolean(areaFieldErrors.capacity)}
                        className={areaFieldErrors.capacity ? 'has-error' : undefined}
                      />
                      {areaFieldErrors.capacity && <span className="role-field-error" role="alert">{areaFieldErrors.capacity}</span>}
                    </label>
                    <label className="role-field">
                      <span>Parking mode <b>*</b></span>
                      <select
                        value={areaForm.parkingMode}
                        disabled={isEditingActiveArea}
                        onChange={(event) => {
                          setAreaForm((form) => ({
                            ...form,
                            parkingMode: event.target.value === '' ? '' : Number(event.target.value),
                          }))
                          setAreaFieldErrors((errors) => ({ ...errors, parkingMode: undefined }))
                        }}
                        aria-invalid={Boolean(areaFieldErrors.parkingMode)}
                        className={areaFieldErrors.parkingMode ? 'has-error' : undefined}
                      >
                        <option value="" disabled>Select a parking mode</option>
                        {parkingAreaModes.map((parkingMode) => (
                          <option key={parkingMode.value} value={parkingMode.value}>{parkingMode.label}</option>
                        ))}
                      </select>
                      {areaFieldErrors.parkingMode && <span className="role-field-error" role="alert">{areaFieldErrors.parkingMode}</span>}
                    </label>
                    <label className="role-field">
                      <span>Location <b>*</b></span>
                      <input
                        value={areaForm.location}
                        onChange={(event) => {
                          setAreaForm((form) => ({ ...form, location: event.target.value }))
                          setAreaFieldErrors((errors) => ({ ...errors, location: undefined }))
                        }}
                        placeholder="e.g. Level 1 - Zone B"
                        aria-invalid={Boolean(areaFieldErrors.location)}
                        className={areaFieldErrors.location ? 'has-error' : undefined}
                      />
                      {areaFieldErrors.location && <span className="role-field-error" role="alert">{areaFieldErrors.location}</span>}
                    </label>
                    <label className="role-field area-description-field">
                      <span>Description <small>Optional</small></span>
                      <textarea
                        value={areaForm.description ?? ''}
                        onChange={(event) => {
                          setAreaForm((form) => ({ ...form, description: event.target.value }))
                          setAreaFieldErrors((errors) => ({ ...errors, description: undefined }))
                        }}
                        placeholder="Add any additional details about this parking area..."
                        rows={4}
                        aria-invalid={Boolean(areaFieldErrors.description)}
                        className={areaFieldErrors.description ? 'has-error' : undefined}
                      />
                      {areaFieldErrors.description && <span className="role-field-error" role="alert">{areaFieldErrors.description}</span>}
                    </label>
                    {areaFormError && <p className="role-form-error area-description-field" role="alert">{areaFormError}</p>}
                  </div>
                  <footer className="role-modal-footer">
                    <button className="modal-cancel" type="button" onClick={closeAreaModal} disabled={isAreaSubmitting}>
                      Cancel
                    </button>
                    <button
                      className="primary-action"
                      type="submit"
                      disabled={isAreaSubmitting}
                    >
                      {editingArea
                        ? <IconPencil className="action-icon" aria-hidden="true" />
                        : <IconPlus className="action-icon" aria-hidden="true" />}
                      <span>{isAreaSubmitting ? 'Saving...' : editingArea ? 'Update area' : 'Create area'}</span>
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
export default AdminParkingArea;