import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import '../resources/css/filters.scss'
import {
    createQuotation,
    updateQuotation,
    deleteQuotation,
    getQuotations
} from '../services/quotationService'
import type {QuotationDto} from '../types/Quotation/quotation'
import type { QuotationQuery } from '../types/Quotation/quotationQuery'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'

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

const vehicleTypes = [
  {value:1, label:'Bicycle'},
  {value:2, label:'ElectricBicycle'},
  {value:3, label:'Motorcycle'},
  {value:4, label:'ElectricMotorcycle'},
  {value:5, label:'Car'}
]
const durationUnits = [
    {value:1, label: 'Hour'},
    {value:2, label: 'Day'},
    {value:3, label: 'Week'},
    {value:4, label: 'Month'},
    {value:5, label: 'Year'}
]

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})
type QuotationSortField = 
    | 'vehicleType'
    | 'duration'
    | 'durationUnit'
    | 'price'
type SortDirection = 'asc' | 'desc' | null

const backendSortField: Record<QuotationSortField, string> = {
    vehicleType: 'VehicleType',
    duration: 'Duration',
    durationUnit: 'DurationUnit',
    price: 'Price'
}

type QuotationFilters = Pick <
QuotationQuery,
'duration' | 'durationUnit' | 'minPrice' | 'maxPrice' | 'vehicleType'
>
type QuotationFilterField = 'minPrice' | 'maxPrice' | 'duration' | 'durationUnit'
type QuotationFilterErrors = FieldErrors<QuotationFilterField>
type FilterDraft = {
    vehicleType : string,
    duration: string,
    durationUnit: string,
    minPrice: string,
    maxPrice:string
}
const emptyFilterDraft: FilterDraft = {
    vehicleType : '',
    duration: '',
    durationUnit: '',
    minPrice: '',
    maxPrice: ''
}
type QuotationFormValues = {
    vehicleType : number| '',
    duration: number | '',
    durationUnit: number | '',
    price: number| ''
}
type QuotationFormField = keyof QuotationFormValues
const emptyQuotationForm : QuotationFormValues = {
    vehicleType : '',
    duration: '',
    durationUnit: '',
    price: ''
}

const quotationFieldAliases : Record<QuotationFormField,readonly string[]>= {
    duration :['duration'],
    durationUnit : ['durationUnit'],
    vehicleType : ['vehicleType', 'vehicleTypeId'],
    price: ['price']
}

const AdminQuotation = ({ readOnly = false }: { readOnly?: boolean }) =>{
    const [quotations,setQuotations] = useState<QuotationDto[]>([])
    const [isLoading,setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
//action 
    const [deletingQuotationId, setDeletingQuotationId] = useState<number | null>(null)
//Pagintation
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
    const safeCurrentPage = Math.min(currentPage, pageCount)
    const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
    const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)
//Sorting
    const [sortField, setSortField] = useState<QuotationSortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)       
//Search & Filter
    const [keyword, setKeyword] = useState('')
    const [filters, setFilters] = useState<QuotationFilters>({})
    const [filterDraft, setFilterDraft] = useState<FilterDraft>(emptyFilterDraft)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterErrors, setFilterErrors] = useState<QuotationFilterErrors>({})
    const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length
    const filterButtonRef = useRef<HTMLButtonElement>(null)
    const filterPopoverRef = useRef<HTMLFormElement>(null)
    const [filterPosition, setFilterPosition] = useState({ top: 12, right: 12 })
    
// form
    const [isQuotationModalOpen,setIsQuotationModalOpen] = useState(false)
    const [quotationFormError,setQuotationFormError] = useState('')    
    const [editingQuotation,setEditingQuotation] = useState<QuotationDto|null>(null)
    const [isQuotationSubmitting, setIsQuotationSubmitting] = useState(false)
    const [quotationForm, setQuotationForm] = useState<QuotationFormValues>(emptyQuotationForm)
    const [quotationFieldErrors, setQuotationFieldErrors] = useState<FieldErrors<QuotationFormField>>({})
    const handleSort = (field: QuotationSortField) => {
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
    const sortIcon = (field: QuotationSortField) => {
        if (sortField !== field || !sortDirection) {
          return <IconArrowsSort className="action-icon" aria-hidden="true" />
        }
    
        const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
        return <Icon className="action-icon" aria-hidden="true" />
    }
    const sortHeader = (field: QuotationSortField, label: string) => (
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
    
    const openFilters = () => {
        setFilterDraft({
        vehicleType: filters.vehicleType?.toString() ?? '',
        duration: filters.duration?.toString() ?? '',
        durationUnit: filters.durationUnit?.toString() ?? '',
        minPrice: filters.minPrice?.toString() ?? '',
        maxPrice: filters.maxPrice?.toString() ?? '',
        })
        setFilterErrors({})
        setIsFilterOpen((open) => !open)
     }
    const applyFilters = (event: SubmitEvent) => {
        event.preventDefault()
        const minPrice = filterDraft.minPrice === '' ? undefined : Number(filterDraft.minPrice)
        const maxPrice = filterDraft.maxPrice === '' ? undefined : Number(filterDraft.maxPrice)
        const duration = filterDraft.duration === '' ? undefined : Number(filterDraft.duration)
        const durationUnit = filterDraft.durationUnit === '' ? undefined: Number(filterDraft.durationUnit)
        const vehicleType = filterDraft.vehicleType === '' ? undefined : Number(filterDraft.vehicleType)
        const validationErrors: QuotationFilterErrors = {}
        
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
          validationErrors.maxPrice= 'Maximum price must be greater than or equal to minimum price.'
        }
        if (minPrice !== undefined && minPrice < 0) {
          validationErrors.minPrice = 'Minimum price cannot be negative.'
        }
        if (maxPrice !== undefined && maxPrice < 0) {
          validationErrors.maxPrice = 'Maximum price cannot be negative.'
        }
        if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0)) {
          validationErrors.duration = 'Duration must be a positive whole number.'
        }
        setFilterErrors(validationErrors)
        if (Object.keys(validationErrors).length) return
    
        setFilters({
          vehicleType,
          minPrice,
          maxPrice,
          duration,
          durationUnit
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

    const openCreateQuotationModal = () =>{
        setQuotationFieldErrors({})
        setQuotationFormError('')
        setEditingQuotation(null)
        setIsQuotationModalOpen(true)
        setIsQuotationSubmitting(false)
        setQuotationForm(emptyQuotationForm)
    }
    const closeQuotationModal = () =>{
        setIsQuotationSubmitting(false)
        setIsQuotationModalOpen(false)
        setQuotationFieldErrors({})
        setQuotationFormError('')
        setQuotationForm(emptyQuotationForm)
        setEditingQuotation(null)
    }
    const openEditQuotationModal = (quotation: QuotationDto) =>{
        setEditingQuotation(quotation)
        setQuotationForm({
            price: quotation.price,
            duration: quotation.duration,
            durationUnit:quotation.durationUnit,
            vehicleType: quotation.vehicleType
        })
        setQuotationFormError('')
        setQuotationFieldErrors({})
        setIsQuotationModalOpen(true)
    }
    const handleDeleteQuotation = async (quotation:QuotationDto)=>{
         if (!window.confirm(`Bạn có chắc muốn xóa bảng giá "${quotation.id}" không?`)) return
         setDeletingQuotationId(quotation.id)
         setErrorMessage('')
          try {
               await deleteQuotation(quotation.id)
               if (quotations.length === 1 && safeCurrentPage > 1) setCurrentPage((page) => page - 1)
               else await loadQuotations()
             } catch (error) {
               setErrorMessage(error instanceof Error ? error.message : 'Không thể xóa bảng giá.')
             } finally {
               setDeletingQuotationId(null)
             }
    }
    const handleQuotationSubmit = async (event: SubmitEvent)=>{
        event.preventDefault()
        setQuotationFormError('')
       
       const validationErrors: FieldErrors<QuotationFormField> = {} 
          if (quotationForm.vehicleType === '') validationErrors.vehicleType = 'Please select a vehicle type.'
          if (quotationForm.price === '' || !Number.isInteger(quotationForm.price ) || quotationForm.price  < 1) {
            validationErrors.price = 'Price must be a positive whole number.'
            }
          if (quotationForm.duration === '' || !Number.isInteger(quotationForm.duration ) || quotationForm.duration  < 1) {
            validationErrors.duration = 'Duration must be a positive whole number.'
            } 
           if (quotationForm.durationUnit === '') validationErrors.durationUnit = 'Please select a duration unit.' 
           setQuotationFieldErrors(validationErrors)  
            if (Object.keys(validationErrors).length) return
            if (quotationForm.vehicleType === '' || quotationForm.price === '' || quotationForm.durationUnit === '' || quotationForm.duration === '') return
            setIsQuotationSubmitting(true)
            try{
                const data = {
                    price : quotationForm.price,
                    duration: quotationForm.duration,
                    durationUnit: quotationForm.durationUnit,
                    vehicleType: quotationForm.vehicleType
                }
                if(editingQuotation){
                    await updateQuotation({id:editingQuotation.id,...data})
                }
                else{
                    await createQuotation(data)
                }
                await loadQuotations()
                closeQuotationModal()
            }
            catch(error){
                const message = error instanceof Error
                        ? error.message
                        : `Không thể ${editingQuotation ? 'cập nhật' : 'tạo'} bảng giá.`
                      const abpError = getAbpErrorFromException(error)
                      const serverErrors = abpError
                        ? mapAbpFieldErrors(abpError, quotationFieldAliases)
                        : mapMessageToFieldErrors(message, quotationFieldAliases)
                      if (Object.keys(serverErrors).length) setQuotationFieldErrors(serverErrors)
                      else setQuotationFormError(message)  
            }
            finally{
                setIsQuotationSubmitting(false)
            }
    }
    const loadQuotations = useCallback(async () =>{
        setIsLoading(true)
        setErrorMessage('')
        try{
            const result = await getQuotations({
                    skipCount: (safeCurrentPage-1) *rowsPerPage,
                    maxResultCount:rowsPerPage,
                    keyword: keyword.trim() || undefined,
                    sorting: sortField && sortDirection
                        ? sortField === 'duration'
                            ? `DurationUnit ${sortDirection}, Duration ${sortDirection}`
                            : `${backendSortField[sortField]} ${sortDirection}`
                        : undefined,
                    ...filters,
                  })
                  setQuotations(result.items)
                  setTotalCount(result.totalCount)
        }
        catch (error){
            setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách bảng giá.')
            setQuotations([])
            setTotalCount(0)
        }
        finally{
            setIsLoading(false)
        }
    },[filters,keyword,rowsPerPage,safeCurrentPage,sortDirection,sortField])
    
    useEffect(() => {
    void loadQuotations()
     }, [loadQuotations])

    return(
        <div className="workspace roles-workspace">
            <Sidebar />
            <main className="main-content roles-content">
                 <header className="roles-header">
                    <div>
                        <span className="eyebrow-label">{readOnly ? 'Staff lookup' : 'Administration'}</span>
                        <h1>Quotation</h1>
                    </div>
                    {!readOnly && (
                        <button className="primary-action" type="button" onClick={openCreateQuotationModal}>
                            <IconPlus className="action-icon" aria-hidden="true" />
                            <span>Create quotation</span>
                        </button>
                    )}
                 </header>
                 
                  <section className="roles-card" aria-label="Quotation list">
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
                                placeholder="Search quotation"
                                aria-label="Search quotation"
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
                             {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
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
                            <strong>Filter quotations</strong>
                             <button
                                className="filter-close"
                                type="button"
                                aria-label="Close filters"
                                onClick={() => setIsFilterOpen(false)}>
                                <IconX className="action-icon" aria-hidden="true" />
                            </button>
                        </div>  
                        <div className="quotation-filter-fields">
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
                                <legend>Price</legend>
                                    <label className="filter-field">
                                     <span>Min price</span>
                                    <input
                                        type="number"
                                        value={filterDraft.minPrice}
                                        aria-invalid={Boolean(filterErrors.minPrice)}
                                        className={filterErrors.minPrice ? 'has-error' : undefined}
                                        onChange={(event) => {
                                          setFilterDraft((draft) => ({ ...draft, minPrice: event.target.value }))
                                          setFilterErrors((errors) => ({ ...errors, minPrice: undefined, maxPrice: undefined }))
                                        }}
                                    />
                                    {filterErrors.minPrice && <span className="filter-field-error" role="alert">{filterErrors.minPrice}</span>}
                                    </label>
                                    <label className="filter-field">
                                    <span>Max price</span>
                                    <input
                                        type="number"
                                        value={filterDraft.maxPrice}
                                        onChange={(event) => {
                                        setFilterDraft((draft) => ({ ...draft, maxPrice: event.target.value }))
                                        setFilterErrors((errors) => ({ ...errors, maxPrice: undefined }))
                                        }}
                                        aria-invalid={Boolean(filterErrors.maxPrice)}
                                        className={filterErrors.maxPrice ? 'has-error' : undefined}
                                    />
                  {filterErrors.maxPrice && <span className="filter-field-error" role="alert">{filterErrors.maxPrice}</span>}
                                    </label>
                            </fieldset>
                            <label className="filter-field">
                                <span>Duration</span>
                                <input
                                        type="number"
                                        aria-invalid={Boolean(filterErrors.duration)}
                                        className={filterErrors.duration ? 'has-error' : undefined}
                                        value={filterDraft.duration}
                                        onChange={(event) => {
                                          setFilterDraft((draft) => ({ ...draft, duration: event.target.value }))
                                          setFilterErrors((errors) => ({ ...errors, duration: undefined }))
                                        }}
                                    />
                                {filterErrors.duration && <span className="filter-field-error" role="alert">{filterErrors.duration}</span>}
                            </label>
                            <label className="filter-field">
                                <span>Duration unit</span>
                                <select
                                value={filterDraft.durationUnit}
                                onChange={(event) => setFilterDraft((draft) => ({ ...draft, durationUnit: event.target.value }))}
                                >   
                                <option value="">All duration units</option>
                                {durationUnits.map((durationUnit) => (
                                    <option key={durationUnit.value} value={durationUnit.value}>{durationUnit.label}</option>
                                ))}
                                </select>
                                {filterErrors.durationUnit && <span className="filter-field-error" role="alert">{filterErrors.durationUnit}</span>}
                            </label>
                        </div>
                        <div className="filter-actions">
                            <button className="filter-reset" type="button" onClick={clearFilters}>Clear</button>
                            <button className="primary-action" type="submit">Apply filters</button>
                        </div>
                        </form>,document.body
                    )}
                     <div className="roles-table-wrap">
                            <table className="roles-table quotation-table">
                                <thead>
                                    <tr>
                                        {sortHeader('vehicleType','Vehicle Type')}
                                        {sortHeader('duration','Duration')}
                                        {sortHeader('price','Price')}
                                        {!readOnly && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!isLoading && quotations.map((quotation)=>(
                                        <tr key={quotation.id}>
                                            <td>{quotation.vehicleTypeName}</td>
                                            <td>
                                                {quotation.duration}{' '}
                                                {quotation.durationUnitType}
                                                </td>
                                            <td>{vndFormatter.format(quotation.price)}</td>
                                        {!readOnly &&(
                                            <td>
                                                <div className="role-actions">
                                                    <button className="edit-action" type="button" onClick={() => openEditQuotationModal(quotation)}>
                                                    <IconPencil className="action-icon" aria-hidden="true" />
                                                    Edit
                                                    </button>
                                                    <button
                                                        className="delete-action"
                                                        type="button"
                                                        onClick={() => void handleDeleteQuotation(quotation)}
                                                        disabled={deletingQuotationId!== null}
                                                        >
                                                        <IconTrash className="action-icon" aria-hidden="true" />
                                                        {deletingQuotationId === quotation.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        )}    
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {isLoading && <p className="roles-status" role="status">Loading quotations...</p>}
                            {errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
                            {!isLoading && !errorMessage && quotations.length === 0 && (
                            <p className="empty-roles">No quotations found.</p>
                            )}
                     </div>
                     <footer className="roles-footer">
                            <button className="refresh-action"
                                type="button"
                                aria-label="Refresh areas"
                                onClick={() => void loadQuotations()}
                                disabled={isLoading}>
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
                  {!readOnly && isQuotationModalOpen && (
                    <div
                      className="role-modal-backdrop"
                      role="presentation"
                      onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isQuotationSubmitting) closeQuotationModal()
                      }}
                    >
                      <section
                        className="role-modal quotation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quotation-modal-title"
                      >
                        <header className="role-modal-header">
                          <div>
                            <span className="eyebrow-label">Administration</span>
                            <h2 id="quotation-modal-title">{editingQuotation ? 'Edit quotation' : 'Create quotation'}</h2>
                          </div>
                          <button
                            className="modal-close"
                            type="button"
                            aria-label="Close quotation dialog"
                            onClick={closeQuotationModal}
                            disabled={isQuotationSubmitting}
                          >
                            <IconX className="action-icon" aria-hidden="true" />
                          </button>
                        </header>
                        <form onSubmit={handleQuotationSubmit} noValidate>
                          <div className="role-form-body">
                            <label className="role-field">
                              <span>Vehicle type <b>*</b></span>
                              <select
                                value={quotationForm.vehicleType}
                                onChange={(event) => {
                                  setQuotationForm((form) => ({
                                    ...form,
                                    vehicleType: event.target.value === '' ? '' : Number(event.target.value),
                                  }))
                                  setQuotationFieldErrors((errors) => ({ ...errors, vehicleType: undefined }))
                                }}
                                autoFocus
                                aria-invalid={Boolean(quotationFieldErrors.vehicleType)}
                                className={quotationFieldErrors.vehicleType ? 'has-error' : undefined}
                                disabled={isQuotationSubmitting}
                              >
                                <option value="">Select vehicle type</option>
                                {vehicleTypes.map((vehicleType) => (
                                  <option key={vehicleType.value} value={vehicleType.value}>{vehicleType.label}</option>
                                ))}
                              </select>
                              {quotationFieldErrors.vehicleType && (
                                <span className="role-field-error" role="alert">{quotationFieldErrors.vehicleType}</span>
                              )}
                            </label>
                            <label className="role-field">
                              <span>Duration <b>*</b></span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={quotationForm.duration}
                                onChange={(event) => {
                                  setQuotationForm((form) => ({
                                    ...form,
                                    duration: event.target.value === '' ? '' : Number(event.target.value),
                                  }))
                                  setQuotationFieldErrors((errors) => ({ ...errors, duration: undefined }))
                                }}
                                aria-invalid={Boolean(quotationFieldErrors.duration)}
                                className={quotationFieldErrors.duration ? 'has-error' : undefined}
                                disabled={isQuotationSubmitting}
                              />
                              {quotationFieldErrors.duration && (
                                <span className="role-field-error" role="alert">{quotationFieldErrors.duration}</span>
                              )}
                            </label>
                            <label className="role-field">
                              <span>Duration unit <b>*</b></span>
                              <select
                                value={quotationForm.durationUnit}
                                onChange={(event) => {
                                  setQuotationForm((form) => ({
                                    ...form,
                                    durationUnit: event.target.value === '' ? '' : Number(event.target.value),
                                  }))
                                  setQuotationFieldErrors((errors) => ({ ...errors, durationUnit: undefined }))
                                }}
                                aria-invalid={Boolean(quotationFieldErrors.durationUnit)}
                                className={quotationFieldErrors.durationUnit ? 'has-error' : undefined}
                                disabled={isQuotationSubmitting}
                              >
                                <option value="">Select duration unit</option>
                                {durationUnits.map((durationUnit) => (
                                  <option key={durationUnit.value} value={durationUnit.value}>{durationUnit.label}</option>
                                ))}
                              </select>
                              {quotationFieldErrors.durationUnit && (
                                <span className="role-field-error" role="alert">{quotationFieldErrors.durationUnit}</span>
                              )}
                            </label>
                            <label className="role-field">
                              <span>Price (VND) <b>*</b></span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={quotationForm.price}
                                onChange={(event) => {
                                  setQuotationForm((form) => ({
                                    ...form,
                                    price: event.target.value === '' ? '' : Number(event.target.value),
                                  }))
                                  setQuotationFieldErrors((errors) => ({ ...errors, price: undefined }))
                                }}
                                aria-invalid={Boolean(quotationFieldErrors.price)}
                                className={quotationFieldErrors.price ? 'has-error' : undefined}
                                disabled={isQuotationSubmitting}
                              />
                              {quotationFieldErrors.price && (
                                <span className="role-field-error" role="alert">{quotationFieldErrors.price}</span>
                              )}
                            </label>
                            {quotationFormError && (
                              <p className="quotation-form-error" role="alert">{quotationFormError}</p>
                            )}
                          </div>
                          <footer className="role-modal-footer">
                            <button
                              className="modal-cancel"
                              type="button"
                              onClick={closeQuotationModal}
                              disabled={isQuotationSubmitting}
                            >
                              Cancel
                            </button>
                            <button className="primary-action" type="submit" disabled={isQuotationSubmitting}>
                              {editingQuotation
                                ? <IconCheck className="action-icon" aria-hidden="true" />
                                : <IconPlus className="action-icon" aria-hidden="true" />}
                              <span>{isQuotationSubmitting
                                ? (editingQuotation ? 'Saving...' : 'Creating...')
                                : (editingQuotation ? 'Save' : 'Create')}</span>
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
export default AdminQuotation;