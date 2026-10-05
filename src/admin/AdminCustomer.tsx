import { useCallback, useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import '../resources/css/dashboard.css'
import type { CustomerDto } from '../types/Customer/customer'
import { deleteCustomer,updateCustomer,getCustomers } from '../services/customerService'
type SortField = 'name' | 'phoneNumber' | 'email'
type SortDirection = 'asc' | 'desc' | null

const backendSortField: Record<SortField, string> = {
    name: 'Name',
    phoneNumber: 'PhoneNumber',
    email: 'Email',
}
function ActionIcon({ type }: { type: 'create' | 'edit' | 'delete' | 'refresh' }) {
	const paths = {
		create: <path d="M12 5v14M5 12h14" />,
		edit: <><path d="m4 16-.8 4.8L8 20l11.2-11.2a2.8 2.8 0 0 1 4-4L4 16Z" /><path d="m13.8 6.2 4 4" /></>,
		delete: <><path d="M5 7h14M10 11v5M14 11v5M9 7V4h6v3M7 7l.8 13h8.4L17 7" /></>,
		refresh: <path d="M20 11a8 8 0 0 0-14.7-4L3 10m0-5v5h5M4 13a8 8 0 0 0 14.7 4L21 14m0 5v-5h-5" />,
	}

	return (
		<svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
			{paths[type]}
		</svg>
	)
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

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phoneNumber, setPhoneNumber] = useState('')
	
	const loadCustomers = useCallback(async () => {
		setIsLoading(true)
		setErrorMessage('')
		try {
			const response = await getCustomers({
				keyword: query.trim() || undefined,
				sorting: sortField && sortDirection ? `${backendSortField[sortField]} ${sortDirection}` : undefined,
				skipCount: (safeCurrentPage - 1) * rowsPerPage,
				maxResultCount: rowsPerPage,
			})
			if (!response.success || !response.result) {
				setErrorMessage(response.error?.message || 'Unable to load customers.')
				setCustomers([])
				setTotalCount(0)
				return
			}
			setCustomers(response.result.items)
			setTotalCount(response.result.totalCount)
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
	const sortIcon = (field: SortField) => sortField === field && sortDirection
		? sortDirection === 'asc' ? '↑' : '↓'
		: '↕'
	const closeCustomerModal = () => {
		setIsCustomerModalOpen(false)
		setEditingCustomer(null)
		setName('')
		setEmail('')
		setPhoneNumber('')
		setCustomerFormError('')
		setIsSubmitting(false)
	}
	const openEditCustomerModal = (customer: CustomerDto) =>{
		setEditingCustomer(customer)
		setName(customer.name)
		setEmail(customer.email)
		setPhoneNumber(customer.phoneNumber)
		setCustomerFormError('')
		setIsCustomerModalOpen(true)
	}
	const handleCustomerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!editingCustomer) {
			setCustomerFormError('Customer creation is not available for admin accounts.')
			return
		}
		if(!name.trim() || !phoneNumber.trim() || !email.trim()){
			setCustomerFormError('Please fill in all required fields.')
			return
		}
		setIsSubmitting(true)
		setCustomerFormError('')
		try{
			const response = await updateCustomer({
				id: editingCustomer.id,
				phoneNumber :phoneNumber.trim(),
				email: email.trim(),
				name: name.trim()
			})
			if (!response.success) {
				setCustomerFormError(response.error?.message || 'Unable to update customer.')
				return
			}
			closeCustomerModal()
			await loadCustomers()
		} catch(error) {
			setCustomerFormError(error instanceof Error ? error.message : 'Unable to update customer.')
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
			<AdminSidebar />
			<main className="main-content roles-content">
				<header className="roles-header"><div><span className="eyebrow-label">Administration</span><h1>Customers</h1></div></header>
				<section className="roles-card" aria-label="Customers list">
					<div className="roles-toolbar"><label className="roles-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Search customers" aria-label="Search customers" /></label></div>
					<div className="roles-table-wrap">
						{isLoading && <p className="roles-status" role="status">Loading customers...</p>}{errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
						<table className="roles-table customers-table"><thead><tr>
								{(['name', 'phoneNumber', 'email'] as SortField[]).map((field) => <th key={field}>{field === 'name' ? 'Name' : field === 'phoneNumber' ? 'Phone number' : 'Email address'}<button className="sort-button" type="button" aria-label={`Sort by ${field}`} onClick={() => handleSort(field)}>{sortIcon(field)}</button></th>)}<th>Actions</th>
							</tr></thead><tbody>
								{!isLoading && customers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.phoneNumber}</td><td>{customer.email}</td><td><div className="role-actions"><button className="edit-action" type="button" onClick={() => openEditCustomerModal(customer)}><ActionIcon type="edit" />Edit</button><button className="delete-action" type="button" onClick={() => void handleDeleteCustomer(customer)} disabled={deletingCustomerId !== null}><ActionIcon type="delete" />{deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}</button></div></td></tr>)}
							</tbody></table>
						{!isLoading && !errorMessage && customers.length === 0 && <p className="empty-roles">No customers found.</p>}
					</div>
					<footer className="roles-footer"><button className="refresh-action" type="button" aria-label="Refresh customers" onClick={() => void loadCustomers()} disabled={isLoading}><ActionIcon type="refresh" /></button><span>{totalCount ? `${firstItem}-${lastItem} of ${totalCount} items` : '0 items'}</span><label>Show <select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setCurrentPage(1) }} aria-label="Rows per page"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select> entries</label><div className="pagination"><button type="button" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={isLoading || safeCurrentPage === 1}>«</button><button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safeCurrentPage === 1}>‹</button><button className="current-page" type="button" aria-current="page">{safeCurrentPage}</button><button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safeCurrentPage === pageCount}>›</button><button type="button" aria-label="Last page" onClick={() => setCurrentPage(pageCount)} disabled={isLoading || safeCurrentPage === pageCount}>»</button></div></footer>
				</section>
				{isCustomerModalOpen && <div className="role-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCustomerModal() }}><section className="role-modal customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title"><header className="role-modal-header"><div><span className="eyebrow-label">Administration</span><h2 id="customer-modal-title">Edit customer</h2></div><button className="modal-close" type="button" aria-label="Close customer dialog" onClick={closeCustomerModal}>×</button></header><form onSubmit={handleCustomerSubmit}><div className="role-form-body"><label className="role-field"><span>Name <b>*</b></span><input value={name} onChange={(event) => setName(event.target.value)} autoFocus required /></label><label className="role-field"><span>Phone number <b>*</b></span><input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required /></label><label className="role-field"><span>Email address <b>*</b></span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>{customerFormError && <p className="role-form-error" role="alert">{customerFormError}</p>}</div><footer className="role-modal-footer"><button className="modal-cancel" type="button" onClick={closeCustomerModal} disabled={isSubmitting}>Cancel</button><button className="primary-action" type="submit" disabled={isSubmitting}><ActionIcon type="edit" /><span>{isSubmitting ? 'Saving...' : 'Save'}</span></button></footer></form></section></div>}
			</main>
		</div>
	)
}

export default AdminCustomer;