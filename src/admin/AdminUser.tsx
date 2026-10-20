import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import { createUser, deleteUser, getUsers, updateUser } from '../services/userService'
import { getRoleNames } from '../services/roleService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import type { UserDto } from '../types/User/user'
import type { SubmitEvent } from 'react'
import {
	IconArrowsSort,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconPencil,
	IconPlus,
	IconSearch,
	IconSortAscending,
	IconSortDescending,
	IconTrash,
	IconX,
} from '@tabler/icons-react'

type SortField = 'userName' | 'emailAddress'
type SortDirection = 'asc' | 'desc' | null
type UserField = 'userName' | 'name' | 'surname' | 'emailAddress' | 'password'

const userFieldAliases = {
	userName: ['userName', 'username'],
	name: ['name', 'firstName'],
	surname: ['surname', 'lastName'],
	emailAddress: ['email', 'emailAddress'],
	password: ['password'],
} as const

function ActionIcon({ type }: { type: 'create' | 'edit' | 'delete' }) {
	const icons = {
		create: IconPlus,
		edit: IconPencil,
		delete: IconTrash,
	}
	const Icon = icons[type]
	return <Icon className="action-icon" aria-hidden="true" />
}
const AdminUser = () => {
	const [users, setUsers] = useState<UserDto[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [query, setQuery] = useState('')
	const [sortField, setSortField] = useState<SortField | null>(null)
	const [sortDirection, setSortDirection] = useState<SortDirection>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
	const [isUserModalOpen, setIsUserModalOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<UserDto | null>(null)
	const [userName, setUserName] = useState('')
	const [name, setName] = useState('')
	const [surname, setSurname] = useState('')
	const [emailAddress, setEmailAddress] = useState('')
	const [password, setPassword] = useState('')
	const [isActive, setIsActive] = useState(true)
	const [roleNames, setRoleNames] = useState<string[]>([])
	const [userFormError, setUserFormError] = useState('')
	const [userFieldErrors, setUserFieldErrors] = useState<FieldErrors<UserField>>({})
	const [isUserSubmitting, setIsUserSubmitting] = useState(false)
	const [availableRoles, setAvailableRoles] = useState<string[]>([])
	const [isRoleLoading, setIsRoleLoading] = useState(true)
	const [roleLoadError, setRoleLoadError] = useState('')

	const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, pageCount)
	const firstItem = totalCount ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0
	const lastItem = Math.min(safeCurrentPage * rowsPerPage, totalCount)

	const loadUsers = useCallback(async () => {
		setIsLoading(true)
		setErrorMessage('')

		try {
			const sorting = sortField && sortDirection
				? `${sortField === 'userName' ? 'UserName' : 'EmailAddress'} ${sortDirection === 'asc' ? 'asc' : 'desc'}`
				: undefined
			const result = await getUsers({
				keyword: query.trim() || undefined,
				sorting,
				skipCount: (safeCurrentPage - 1) * rowsPerPage,
				maxResultCount: rowsPerPage,
			})

			setUsers(result.items)
			setTotalCount(result.totalCount)
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách user.')
			setUsers([])
			setTotalCount(0)
		} finally {
			setIsLoading(false)
		}
	}, [query, rowsPerPage, safeCurrentPage, sortDirection, sortField])

	useEffect(() => {
		void loadUsers()
	}, [loadUsers])

	useEffect(() => {
		getRoleNames()
			.then((roleNames) => setAvailableRoles(roleNames))
			.catch((error) => setRoleLoadError(error instanceof Error ? error.message : 'Không thể tải danh sách role.'))
			.finally(() => setIsRoleLoading(false))
	}, [])

	const handleSort = (field: SortField) => {
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

	const closeUserModal = () => {
		setIsUserModalOpen(false)
		setEditingUser(null)
		setUserName('')
		setName('')
		setSurname('')
		setEmailAddress('')
		setPassword('')
		setIsActive(true)
		setRoleNames([])
		setUserFormError('')
		setUserFieldErrors({})
		setIsUserSubmitting(false)
	}

	const openCreateUserModal = () => {
		closeUserModal()
		setIsUserModalOpen(true)
	}

	const openEditUserModal = (user: UserDto) => {
		setEditingUser(user)
		setUserName(user.userName)
		setName(user.name)
		setSurname(user.surname)
		setEmailAddress(user.emailAddress)
		setIsActive(user.isActive)
		setRoleNames(user.roleNames || [])
		setUserFormError('')
		setUserFieldErrors({})
		setIsUserModalOpen(true)
	}

	const toggleRole = (role: string) => {
		setRoleNames((currentRoles) => currentRoles.some((item) => item.toLowerCase() === role.toLowerCase())
			? currentRoles.filter((item) => item.toLowerCase() !== role.toLowerCase())
			: [...currentRoles, role])
	}

	const isRoleSelected = (role: string) =>
		roleNames.some((selectedRole) => selectedRole.toLowerCase() === role.toLowerCase())

	const handleUserSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		const validationErrors: FieldErrors<UserField> = {}
		if (!userName.trim()) validationErrors.userName = 'Username is required.'
		if (!name.trim()) validationErrors.name = 'First name is required.'
		if (!surname.trim()) validationErrors.surname = 'Last name is required.'
		if (!emailAddress.trim()) validationErrors.emailAddress = 'Email is required.'
		if (!editingUser && !password) validationErrors.password = 'Password is required.'
		setUserFieldErrors(validationErrors)
		setUserFormError('')
		if (Object.keys(validationErrors).length) {
			return
		}

		setIsUserSubmitting(true)

		try {
			if (editingUser) {
				await updateUser({
					id: editingUser.id,
					userName: userName.trim(),
					name: name.trim(),
					surname: surname.trim(),
					emailAddress: emailAddress.trim(),
					isActive,
					roleNames,
				})
			} else {
				await createUser({
					userName: userName.trim(),
					name: name.trim(),
					surname: surname.trim(),
					emailAddress: emailAddress.trim(),
					password,
					isActive,
					roleNames,
				})
			}

			closeUserModal()
			await loadUsers()
		} catch (error) {
			const message = error instanceof Error ? error.message : `Unable to ${editingUser ? 'update' : 'create'} user.`
			const abpError = getAbpErrorFromException(error)
			const serverErrors = abpError
				? mapAbpFieldErrors(abpError, userFieldAliases)
				: mapMessageToFieldErrors(message, userFieldAliases)
			if (Object.keys(serverErrors).length) setUserFieldErrors(serverErrors)
			else setUserFormError(message)
		} finally {
			setIsUserSubmitting(false)
		}
	}

	const handleDeleteUser = async (user: UserDto) => {
		if (!window.confirm(`Bạn có chắc muốn xóa user "${user.userName}" không?`)) return

		setDeletingUserId(user.id)
		setErrorMessage('')

		try {
			await deleteUser(user.id)
			await loadUsers()
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Không thể xóa user.')
		} finally {
			setDeletingUserId(null)
		}
	}

	return (
		<div className="workspace roles-workspace">
			<Sidebar />
			<main className="main-content roles-content">
				<header className="roles-header">
					<div>
						<span className="eyebrow-label">Administration</span>
						<h1>Users</h1>
					</div>
					<button className="primary-action" type="button" onClick={openCreateUserModal}>
						<ActionIcon type="create" />
						<span>Create</span>
					</button>
				</header>
				<section className="roles-card" aria-label="Users list">
					<div className="roles-toolbar">
						<label className="roles-search">
							<span aria-hidden="true"><IconSearch className="action-icon" /></span>
							<input
								type="search"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value)
									setCurrentPage(1)
								}}
								placeholder="Search users"
								aria-label="Search users"
							/>
						</label>
					</div>
					<div className="roles-table-wrap">
						{isLoading && <p className="roles-status" role="status">Loading users...</p>}
						{errorMessage && <p className="roles-status form-error" role="alert">{errorMessage}</p>}
						<table className="roles-table users-table">
							<thead>
								<tr>
									<th>
										User name
										<button className="sort-button" type="button" aria-label="Sort by user name" onClick={() => handleSort('userName')}>
											{sortIcon('userName')}
										</button>
									</th>
									<th>Full name</th>
									<th>
										Email address
										<button className="sort-button" type="button" aria-label="Sort by email address" onClick={() => handleSort('emailAddress')}>
											{sortIcon('emailAddress')}
										</button>
									</th>
									<th>Is active</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{!isLoading && users.map((user) => (
									<tr key={user.id}>
										<td>{user.userName}</td>
										<td>{user.fullName}</td>
										<td>{user.emailAddress}</td>
										<td>
											<input
												type="checkbox"
														checked={user.isActive}
														readOnly
												aria-label={`Set ${user.userName} active`}
											/>
										</td>
										<td>
											<div className="role-actions">
													<button className="edit-action" type="button" onClick={() => openEditUserModal(user)}>
													<ActionIcon type="edit" />
													Edit
												</button>
													<button
														className="delete-action"
														type="button"
														onClick={() => void handleDeleteUser(user)}
														disabled={deletingUserId !== null}
													>
													<ActionIcon type="delete" />
														{deletingUserId === user.id ? 'Deleting...' : 'Delete'}
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{!isLoading && !errorMessage && users.length === 0 && <p className="empty-roles">No users found.</p>}
					</div>
					<footer className="roles-footer">
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
								<option>10</option>
								<option>25</option>
								<option>50</option>
							</select>{' '}
							entries
						</label>
						<div className="pagination">
							<button type="button" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={isLoading || safeCurrentPage === 1}><IconChevronsLeft className="action-icon" aria-hidden="true" /></button>
							<button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safeCurrentPage === 1}><IconChevronLeft className="action-icon" aria-hidden="true" /></button>
							<button className="current-page" type="button" aria-current="page">{safeCurrentPage}</button>
							<button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safeCurrentPage === pageCount}><IconChevronRight className="action-icon" aria-hidden="true" /></button>
							<button type="button" aria-label="Last page" onClick={() => setCurrentPage(pageCount)} disabled={isLoading || safeCurrentPage === pageCount}><IconChevronsRight className="action-icon" aria-hidden="true" /></button>
						</div>
					</footer>
				</section>
			{isUserModalOpen && (
				<div
					className="role-modal-backdrop"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) closeUserModal()
					}}
				>
					<section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
						<header className="role-modal-header">
							<div>
								<span className="eyebrow-label">Administration</span>
								<h2 id="user-modal-title">{editingUser ? 'Edit user' : 'Create new user'}</h2>
							</div>
							<button className="modal-close" type="button" aria-label="Close user dialog" onClick={closeUserModal}><IconX className="action-icon" aria-hidden="true" /></button>
						</header>
						<form onSubmit={handleUserSubmit} noValidate>
							<div className="role-form-body">
								<label className="role-field">
									<span>Username <b>*</b></span>
									<input
										value={userName}
										onChange={(event) => { setUserName(event.target.value); setUserFieldErrors((errors) => ({ ...errors, userName: undefined })) }}
										autoFocus={!editingUser}
										disabled={Boolean(editingUser)}
										aria-invalid={Boolean(userFieldErrors.userName)}
										className={userFieldErrors.userName ? 'has-error' : undefined}
									/>
									{userFieldErrors.userName && <span className="role-field-error" role="alert">{userFieldErrors.userName}</span>}
								</label>
								<label className="role-field">
									<span>First name <b>*</b></span>
									<input value={name} onChange={(event) => { setName(event.target.value); setUserFieldErrors((errors) => ({ ...errors, name: undefined })) }} aria-invalid={Boolean(userFieldErrors.name)} className={userFieldErrors.name ? 'has-error' : undefined} />
									{userFieldErrors.name && <span className="role-field-error" role="alert">{userFieldErrors.name}</span>}
								</label>
								<label className="role-field">
									<span>Last name <b>*</b></span>
									<input value={surname} onChange={(event) => { setSurname(event.target.value); setUserFieldErrors((errors) => ({ ...errors, surname: undefined })) }} aria-invalid={Boolean(userFieldErrors.surname)} className={userFieldErrors.surname ? 'has-error' : undefined} />
									{userFieldErrors.surname && <span className="role-field-error" role="alert">{userFieldErrors.surname}</span>}
								</label>
								<label className="role-field">
									<span>Email address <b>*</b></span>
									<input type="email" value={emailAddress} onChange={(event) => { setEmailAddress(event.target.value); setUserFieldErrors((errors) => ({ ...errors, emailAddress: undefined })) }} aria-invalid={Boolean(userFieldErrors.emailAddress)} className={userFieldErrors.emailAddress ? 'has-error' : undefined} />
									{userFieldErrors.emailAddress && <span className="role-field-error" role="alert">{userFieldErrors.emailAddress}</span>}
								</label>
								{!editingUser && (
									<label className="role-field">
										<span>Password <b>*</b></span>
										<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setUserFieldErrors((errors) => ({ ...errors, password: undefined })) }} aria-invalid={Boolean(userFieldErrors.password)} className={userFieldErrors.password ? 'has-error' : undefined} />
										{userFieldErrors.password && <span className="role-field-error" role="alert">{userFieldErrors.password}</span>}
									</label>
								)}
								<label className="role-field">
									<span>Is active</span>
									<input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
								</label>
								<fieldset className="permissions-field">
									<legend>User roles</legend>
									{isRoleLoading && <p className="roles-status" role="status">Loading roles...</p>}
									{roleLoadError && <p className="role-form-error" role="alert">{roleLoadError}</p>}
									{!isRoleLoading && !roleLoadError && <div className="permissions-grid">
										{availableRoles.map((role) => (
											<label className="permission-option" key={role}>
												<input type="checkbox" checked={isRoleSelected(role)} onChange={() => toggleRole(role)} />
												<span>{role}</span>
											</label>
										))}
									</div>}
								</fieldset>
								{userFormError && <p className="role-form-error" role="alert">{userFormError}</p>}
							</div>
							<footer className="role-modal-footer">
								<button className="modal-cancel" type="button" onClick={closeUserModal} disabled={isUserSubmitting}>Cancel</button>
								<button className="primary-action" type="submit" disabled={isUserSubmitting}>
									<ActionIcon type="create" />
									<span>{isUserSubmitting ? 'Saving...' : editingUser ? 'Update' : 'Save'}</span>
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

export default AdminUser
