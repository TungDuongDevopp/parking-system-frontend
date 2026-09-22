import { useCallback, useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import '../resources/css/dashboard.css'
import { createUser, deleteUser, getUsers, updateUser } from '../services/userService'
import { getRoleNames } from '../services/roleService'
import type { UserDto } from '../types/User/user'

type SortField = 'userName' | 'emailAddress'
type SortDirection = 'asc' | 'desc' | null

function ActionIcon({ type }: { type: 'create' | 'edit' | 'delete' }) {
	const paths = {
		create: <path d="M12 5v14M5 12h14" />,
		edit: <><path d="m4 16-.8 4.8L8 20l11.2-11.2a2.8 2.8 0 0 1 4-4L4 16Z" /><path d="m13.8 6.2 4 4" /></>,
		delete: <><path d="M5 7h14M10 11v5M14 11v5M9 7V4h6v3M7 7l.8 13h8.4L17 7" /></>,
	}

	return (
		<svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
			{paths[type]}
		</svg>
	)
}

function AdminUser() {
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
			const response = await getUsers({
				keyword: query.trim() || undefined,
				sorting,
				skipCount: (safeCurrentPage - 1) * rowsPerPage,
				maxResultCount: rowsPerPage,
			})

			if (!response.success || !response.result) {
				setErrorMessage(response.error?.message || 'Không thể tải danh sách user.')
				setUsers([])
				setTotalCount(0)
				return
			}

			setUsers(response.result.items)
			setTotalCount(response.result.totalCount)
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

	const sortIcon = (field: SortField) => sortField === field && sortDirection
		? sortDirection === 'asc' ? '↑' : '↓'
		: '↕'

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
		setIsUserModalOpen(true)
	}

	const toggleRole = (role: string) => {
		setRoleNames((currentRoles) => currentRoles.some((item) => item.toLowerCase() === role.toLowerCase())
			? currentRoles.filter((item) => item.toLowerCase() !== role.toLowerCase())
			: [...currentRoles, role])
	}

	const isRoleSelected = (role: string) =>
		roleNames.some((selectedRole) => selectedRole.toLowerCase() === role.toLowerCase())

	const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!userName.trim() || !name.trim() || !surname.trim() || !emailAddress.trim() || (!editingUser && !password)) {
			setUserFormError('Please fill in all required fields.')
			return
		}

		setIsUserSubmitting(true)
		setUserFormError('')

		try {
			const response = editingUser
				? await updateUser({
					id: editingUser.id,
					userName: userName.trim(),
					name: name.trim(),
					surname: surname.trim(),
					emailAddress: emailAddress.trim(),
					isActive,
					roleNames,
				})
				: await createUser({
					userName: userName.trim(),
					name: name.trim(),
					surname: surname.trim(),
					emailAddress: emailAddress.trim(),
					password,
					isActive,
					roleNames,
				})

			if (!response.success) {
				setUserFormError(response.error?.message || `Unable to ${editingUser ? 'update' : 'create'} user.`)
				return
			}

			closeUserModal()
			await loadUsers()
		} catch (error) {
			setUserFormError(error instanceof Error ? error.message : `Unable to ${editingUser ? 'update' : 'create'} user.`)
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
			<AdminSidebar />
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
							<span aria-hidden="true">⌕</span>
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
							<button type="button" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={isLoading || safeCurrentPage === 1}>«</button>
							<button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safeCurrentPage === 1}>‹</button>
							<button className="current-page" type="button" aria-current="page">{safeCurrentPage}</button>
							<button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safeCurrentPage === pageCount}>›</button>
							<button type="button" aria-label="Last page" onClick={() => setCurrentPage(pageCount)} disabled={isLoading || safeCurrentPage === pageCount}>»</button>
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
							<button className="modal-close" type="button" aria-label="Close user dialog" onClick={closeUserModal}>×</button>
						</header>
						<form onSubmit={handleUserSubmit}>
							<div className="role-form-body">
								<label className="role-field">
									<span>Username <b>*</b></span>
									<input
										value={userName}
										onChange={(event) => setUserName(event.target.value)}
										autoFocus={!editingUser}
										disabled={Boolean(editingUser)}
										required
									/>
								</label>
								<label className="role-field">
									<span>First name <b>*</b></span>
									<input value={name} onChange={(event) => setName(event.target.value)} required />
								</label>
								<label className="role-field">
									<span>Last name <b>*</b></span>
									<input value={surname} onChange={(event) => setSurname(event.target.value)} required />
								</label>
								<label className="role-field">
									<span>Email address <b>*</b></span>
									<input type="email" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} required />
								</label>
								{!editingUser && (
									<label className="role-field">
										<span>Password <b>*</b></span>
										<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
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
