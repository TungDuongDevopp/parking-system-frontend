import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import type { CustomerDto } from '../types/Customer/customer'
import { deleteCustomer,updateCustomer,getCustomers } from '../services/customerService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import {
  IconSearch,
  IconPencil,
  IconTrash,
  IconRefresh,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconX,
} from '@tabler/icons-react'
type SortField = 'name' | 'phoneNumber' | 'email'
type SortDirection = 'asc' | 'desc' | null
type CustomerField = 'name' | 'phoneNumber' | 'email'

const customerFieldAliases = {
	name: ['name'],
	phoneNumber: ['phone', 'phoneNumber'],
	email: ['email'],
} as const

const backendSortField: Record<SortField, string> = {
    name: 'Name',
    phoneNumber: 'PhoneNumber',
    email: 'Email',
}
function ActionIcon({ type }: { type: 'edit' | 'delete' | 'refresh' }) {
	const icons = {
		edit: IconPencil,
		delete: IconTrash,
		refresh: IconRefresh,
	}
	const Icon = icons[type]

	return <Icon className="action-icon" aria-hidden="true" />
}

const AdminCustomer = () => {
	const [customers, setCustomers] = useState<CustomerDto[]>([])

	const [totalCount, setTotalCount] = useState(0)
	const [query, setQuery] = useState('')
	const [sortField, setSortField] = useState<SortField | null>(null)
	const [sortDirection, setSortDirection] = useState<SortDirection>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, pageCount)
	const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
	const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)

	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null)
	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
	const [editingCustomer, setEditingCustomer] = useState<CustomerDto | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [customerFormError, setCustomerFormError] = useState('')
	const [customerFieldErrors, setCustomerFieldErrors] = useState<FieldErrors<CustomerField>>({})

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phoneNumber, setPhoneNumber] = useState('')
	
	const loadCustomers = useCallback(async () => {
		setIsLoading(true)
		setErrorMessage('')
		try {
			const result = await getCustomers({
				keyword: query.trim() || undefined,
				sorting: sortField && sortDirection ? `${backendSortField[sortField]} ${sortDirection}` : undefined,
				skipCount: (safeCurrentPage - 1) * rowsPerPage,
				maxResultCount: rowsPerPage,
			})
			setCustomers(result.items)
			setTotalCount(result.totalCount)
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to load customers.')
			setCustomers([])
			setTotalCount(0)
		} finally {
			setIsLoading(false)
		}
	}, [query, rowsPerPage, safeCurrentPage, sortDirection, sortField])

		useEffect(() => {
		void loadCustomers()
	}, [loadCustomers])

	const handleSort = (field: SortField) => {
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
	const sortIcon = (field: SortField) => {
		if (sortField !== field || !sortDirection) {
			return <IconArrowsSort className="action-icon" aria-hidden="true" />
		}

		const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
		return <Icon className="action-icon" aria-hidden="true" />
	}
	const closeCustomerModal = () => {
		setIsCustomerModalOpen(false)
		setEditingCustomer(null)
		setName('')
		setEmail('')
		setPhoneNumber('')
		setCustomerFormError('')
		setCustomerFieldErrors({})
		setIsSubmitting(false)
	}
	const openEditCustomerModal = (customer: CustomerDto) =>{
		setEditingCustomer(customer)
		setName(customer.name)
		setEmail(customer.email ?? '')
		setPhoneNumber(customer.phoneNumber)
		setCustomerFormError('')
		setCustomerFieldErrors({})
		setIsCustomerModalOpen(true)
	}
	const handleCustomerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const validationErrors: FieldErrors<CustomerField> = {}
		if (!editingCustomer) {
			setCustomerFormError('Customer creation is not available for admin accounts.')
			return
		}
		if (!name.trim()) validationErrors.name = 'Name is required.'
		if (!phoneNumber.trim()) validationErrors.phoneNumber = 'Phone number is required.'
		if (!email.trim()) validationErrors.email = 'Email is required.'
		setCustomerFieldErrors(validationErrors)
		setCustomerFormError('')
		if (Object.keys(validationErrors).length) {
			return
		}
		setIsSubmitting(true)
		try{
			await updateCustomer({
				id: editingCustomer.id,
				phoneNumber :phoneNumber.trim(),
				email: email.trim(),
				name: name.trim()
			})
			closeCustomerModal()
			await loadCustomers()
		} catch(error) {
			const message = error instanceof Error ? error.message : 'Unable to update customer.'
			const abpError = getAbpErrorFromException(error)
			const serverErrors = abpError
				? mapAbpFieldErrors(abpError, customerFieldAliases)
				: mapMessageToFieldErrors(message, customerFieldAliases)
			if (Object.keys(serverErrors).length) setCustomerFieldErrors(serverErrors)
			else setCustomerFormError(message)
		} finally {
			setIsSubmitting(false)
		}
	}
	const handleDeleteCustomer = async (customer: CustomerDto) => {
		if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) return
		setDeletingCustomerId(customer.id)
		setErrorMessage('')
		try {
			await deleteCustomer(customer.id)
			if (customers.length === 1 && safeCurrentPage > 1) setCurrentPage((page) => page - 1)
			else await loadCustomers()
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to delete customer.')
		} finally {
			setDeletingCustomerId(null)
		}
	}

	return (
		<div className="workspace roles-workspace">
			<Sidebar />
			<main className="main-content roles-content">
				<header className="roles-header">
					<div>
						<span className="eyebrow-label">Administration</span>
						<h1>Customers</h1>
					</div>
				</header>
				<section className="roles-card" aria-label="Customers list">
					<div className="roles-toolbar">
						<label className="roles-search">
							<span aria-hidden="true">
								<IconSearch className="action-icon" />
							</span>
							<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Search customers" aria-label="Search customers" />
						</label>
					</div>
					
					<div className="roles-table-wrap">
						{isLoading && <p className="roles-status" role="status">Loading customers...</p>}{errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
						<table className="roles-table customers-table"><thead><tr>
								{(['name', 'phoneNumber', 'email'] as SortField[]).map((field) => <th key={field}>{field === 'name' ? 'Name' : field === 'phoneNumber' ? 'Phone number' : 'Email address'}<button className="sort-button" type="button" aria-label={`Sort by ${field}`} onClick={() => handleSort(field)}>{sortIcon(field)}</button></th>)}<th>Actions</th>
							</tr></thead><tbody>
								{!isLoading && customers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.phoneNumber}</td><td>{customer.email}</td><td><div className="role-actions"><button className="edit-action" type="button" onClick={() => openEditCustomerModal(customer)}><ActionIcon type="edit" />Edit</button><button className="delete-action" type="button" onClick={() => void handleDeleteCustomer(customer)} disabled={deletingCustomerId !== null}><ActionIcon type="delete" />{deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}</button></div></td></tr>)}
							</tbody></table>
						{!isLoading && !errorMessage && customers.length === 0 && <p className="empty-roles">No customers found.</p>}
					</div>
					<footer className="roles-footer"><button className="refresh-action" type="button" aria-label="Refresh customers" onClick={() => void loadCustomers()} disabled={isLoading}><ActionIcon type="refresh" /></button><span>{totalCount ? `${firstItem}-${lastItem} of ${totalCount} items` : '0 items'}</span><label>Show <select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setCurrentPage(1) }} aria-label="Rows per page"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select> entries</label><div className="pagination"><button type="button" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={isLoading || safeCurrentPage === 1}><IconChevronsLeft className="action-icon" aria-hidden="true" /></button><button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safeCurrentPage === 1}><IconChevronLeft className="action-icon" aria-hidden="true" /></button><button className="current-page" type="button" aria-current="page">{safeCurrentPage}</button><button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safeCurrentPage === pageCount}><IconChevronRight className="action-icon" aria-hidden="true" /></button><button type="button" aria-label="Last page" onClick={() => setCurrentPage(pageCount)} disabled={isLoading || safeCurrentPage === pageCount}><IconChevronsRight className="action-icon" aria-hidden="true" /></button></div></footer>
				</section>
				{isCustomerModalOpen && <div className="role-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCustomerModal() }}><section className="role-modal customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title"><header className="role-modal-header"><div><span className="eyebrow-label">Administration</span><h2 id="customer-modal-title">Edit customer</h2></div><button className="modal-close" type="button" aria-label="Close customer dialog" onClick={closeCustomerModal}><IconX className="action-icon" aria-hidden="true" /></button></header><form onSubmit={handleCustomerSubmit} noValidate><div className="role-form-body"><label className="role-field"><span>Name <b>*</b></span><input value={name} onChange={(event) => { setName(event.target.value); setCustomerFieldErrors((errors) => ({ ...errors, name: undefined })) }} autoFocus aria-invalid={Boolean(customerFieldErrors.name)} className={customerFieldErrors.name ? 'has-error' : undefined} />{customerFieldErrors.name && <span className="role-field-error" role="alert">{customerFieldErrors.name}</span>}</label><label className="role-field"><span>Phone number <b>*</b></span><input value={phoneNumber} onChange={(event) => { setPhoneNumber(event.target.value); setCustomerFieldErrors((errors) => ({ ...errors, phoneNumber: undefined })) }} aria-invalid={Boolean(customerFieldErrors.phoneNumber)} className={customerFieldErrors.phoneNumber ? 'has-error' : undefined} />{customerFieldErrors.phoneNumber && <span className="role-field-error" role="alert">{customerFieldErrors.phoneNumber}</span>}</label><label className="role-field"><span>Email address <b>*</b></span><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setCustomerFieldErrors((errors) => ({ ...errors, email: undefined })) }} aria-invalid={Boolean(customerFieldErrors.email)} className={customerFieldErrors.email ? 'has-error' : undefined} />{customerFieldErrors.email && <span className="role-field-error" role="alert">{customerFieldErrors.email}</span>}</label>{customerFormError && <p className="role-form-error" role="alert">{customerFormError}</p>}</div><footer className="role-modal-footer"><button className="modal-cancel" type="button" onClick={closeCustomerModal} disabled={isSubmitting}>Cancel</button><button className="primary-action" type="submit" disabled={isSubmitting}><ActionIcon type="edit" /><span>{isSubmitting ? 'Saving...' : 'Save'}</span></button></footer></form></section></div>}
			</main>
		</div>
	)
}

export default AdminCustomer;