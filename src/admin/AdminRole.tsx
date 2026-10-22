import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import { createRole, deleteRole, getPermission, getRoles, updateRole } from '../services/roleService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import type { Role } from '../types/Role/role'
import type { SubmitEvent } from 'react'
import {
	IconArrowsSort,
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

type SortField = 'name' | 'displayName'
type SortDirection = 'asc' | 'desc' | null
type RoleField = 'name' | 'displayName'

const roleFieldAliases = {
	name: ['name', 'normalizedName'],
	displayName: ['displayName'],
} as const

function ActionIcon({ type }: { type: 'create' | 'edit' | 'delete' | 'refresh' }) {
	const icons = {
		create: IconPlus,
		edit: IconPencil,
		delete: IconTrash,
		refresh: IconRefresh,
	}
	const Icon = icons[type]
	return <Icon className="action-icon" aria-hidden="true" />
}

function AdminRole() {
	const [roles, setRoles] = useState<Role[]>([])
	const [query, setQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [editingRole, setEditingRole] = useState<Role | null>(null)
	const [roleName, setRoleName] = useState('')
	const [displayName, setDisplayName] = useState('')
	const [description, setDescription] = useState('')
	const [permissions, setPermissions] = useState<string[]>([])
	const [isPermissionLoading, setIsPermissionLoading] = useState(true)
	const [permissionError, setPermissionError] = useState('')
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
	const [formError, setFormError] = useState('')
	const [roleFieldErrors, setRoleFieldErrors] = useState<FieldErrors<RoleField>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)
	const [sortField, setSortField] = useState<SortField | null>(null)
	const [sortDirection, setSortDirection] = useState<SortDirection>(null)

	const loadRoles = useCallback(async () => {
		setIsLoading(true)
		setErrorMessage('')

		try {
			const result = await getRoles()
			setRoles(result.items)
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách role.')
			setRoles([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		void loadRoles()
	}, [loadRoles])

	useEffect(() => {
		let isMounted = true

		setIsPermissionLoading(true)
		setPermissionError('')

		getPermission()
			.then((items) => {
				if (isMounted) {
					setPermissions(items.sort((first, second) => first.localeCompare(second)))
				}
			})
			.catch((error) => {
				if (isMounted) {
					setPermissionError(error instanceof Error ? error.message : 'Không thể tải danh sách permission.')
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsPermissionLoading(false)
				}
			})

		return () => {
			isMounted = false
		}
	}, [])

	const filteredRoles = roles.filter((role) =>
		`${role.name} ${role.displayName}`.toLowerCase().includes(query.toLowerCase()),
	)
	const sortedRoles = [...filteredRoles].sort((first, second) => {
		if (!sortField || !sortDirection) return 0

		const comparison = first[sortField].localeCompare(second[sortField], undefined, {
			sensitivity: 'base',
		})
		return sortDirection === 'asc' ? comparison : -comparison
	})

	const handleSort = (field: SortField) => {
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

	const getSortIcon = (field: SortField) => {
		if (sortField !== field || !sortDirection) {
			return <IconArrowsSort className="action-icon" aria-hidden="true" />
		}
		const Icon = sortDirection === 'asc' ? IconSortAscending : IconSortDescending
		return <Icon className="action-icon" aria-hidden="true" />
	}

	const closeCreateModal = () => {
		setIsCreateOpen(false)
		setEditingRole(null)
		setRoleName('')
		setDisplayName('')
		setDescription('')
		setSelectedPermissions([])
		setFormError('')
		setRoleFieldErrors({})
		setIsSubmitting(false)
	}

	const openCreateModal = () => {
		setEditingRole(null)
		setIsCreateOpen(true)
	}

	const openEditModal = (role: Role) => {
		setEditingRole(role)
		setRoleName(role.name)
		setDisplayName(role.displayName)
		setDescription(role.description || '')
		setSelectedPermissions(role.grantedPermissions || [])
		setFormError('')
		setRoleFieldErrors({})
		setIsCreateOpen(true)
	}

	const togglePermission = (permission: string) => {
		setSelectedPermissions((current) =>
			current.includes(permission)
				? current.filter((item) => item !== permission)
				: [...current, permission],
		)
	}

	const handleCreateSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		const validationErrors: FieldErrors<RoleField> = {}
		if (!roleName.trim()) validationErrors.name = 'Role name is required.'
		if (!displayName.trim()) validationErrors.displayName = 'Display name is required.'
		setRoleFieldErrors(validationErrors)
		setFormError('')
		if (Object.keys(validationErrors).length) {
			return
		}

		setIsSubmitting(true)

		try {
			const roleData = {
				name: roleName.trim(),
				normalizedName: roleName.trim().toUpperCase(),
				displayName: displayName.trim(),
				description: description.trim(),
				grantedPermissions: selectedPermissions,
			}
			if (editingRole) await updateRole({ ...editingRole, ...roleData })
			else await createRole(roleData)

			closeCreateModal()
			await loadRoles()
		} catch (error) {
			const message = error instanceof Error ? error.message : `Không thể ${editingRole ? 'cập nhật' : 'tạo'} role.`
			const abpError = getAbpErrorFromException(error)
			const serverErrors = abpError
				? mapAbpFieldErrors(abpError, roleFieldAliases)
				: mapMessageToFieldErrors(message, roleFieldAliases)
			if (Object.keys(serverErrors).length) setRoleFieldErrors(serverErrors)
			else setFormError(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteRole = async (role: Role) => {
		if (!window.confirm(`Bạn có chắc muốn xóa role "${role.displayName}" không?`)) {
			return
		}

		setDeletingRoleId(role.id)
		setErrorMessage('')

		try {
			await deleteRole(role.id)
			await loadRoles()
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Không thể xóa role.')
		} finally {
			setDeletingRoleId(null)
		}
	}

	return (
		<div className="workspace roles-workspace">
			<Sidebar />
			<main className="main-content roles-content">
				<header className="roles-header">
					<div>
						<span className="eyebrow-label">Administration</span>
						<h1>Roles</h1>
					</div>
					<button className="primary-action" type="button" onClick={openCreateModal}>
						<ActionIcon type="create" />
						<span>Create</span>
					</button>
				</header>
				<section className="roles-card" aria-label="Roles list">
					<div className="roles-toolbar">
						<label className="roles-search">
							<span aria-hidden="true"><IconSearch className="action-icon" /></span>
							<input
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search roles"
								aria-label="Search roles"
							/>
						</label>
					</div>
					<div className="roles-table-wrap">
						{isLoading && (
							<p className="roles-status" role="status">
								Loading roles...
							</p>
						)}
						{errorMessage && (
							<p className="roles-status form-error" role="alert">
								{errorMessage}
							</p>
						)}
						<table className="roles-table role-list-table">
							<thead>
								<tr>
									<th>
										Role Name
										<button
											className="sort-button"
											type="button"
											aria-label="Sort by role name"
											onClick={() => handleSort('name')}
										>
											{getSortIcon('name')}
										</button>
									</th>
									<th>
										Display Name
										<button
											className="sort-button"
											type="button"
											aria-label="Sort by display name"
											onClick={() => handleSort('displayName')}
										>
											{getSortIcon('displayName')}
										</button>
									</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{!isLoading && sortedRoles.map((role) => (
									<tr key={role.id}>
										<td>{role.name}</td>
										<td>{role.displayName}</td>
										<td>
											<div className="role-actions">
												<button className="edit-action" type="button" onClick={() => openEditModal(role)}>
													<ActionIcon type="edit" />
													Edit
												</button>
												<button
													className="delete-action"
													type="button"
													onClick={() => void handleDeleteRole(role)}
													disabled={deletingRoleId !== null}
												>
													<ActionIcon type="delete" />
													{deletingRoleId === role.id ? 'Deleting...' : 'Delete'}
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{!isLoading && !errorMessage && filteredRoles.length === 0 && (
							<p className="empty-roles">No roles found.</p>
						)}
					</div>
					<footer className="roles-footer">
						<button
							className="refresh-action"
							type="button"
							aria-label="Refresh roles"
							onClick={() => void loadRoles()}
							disabled={isLoading}
						>
							<ActionIcon type="refresh" />
						</button>
						<span>
							{filteredRoles.length
								? `1-${filteredRoles.length} of ${filteredRoles.length} items`
								: '0 items'}
						</span>
						<label>
							Show{' '}
							<select defaultValue="10" aria-label="Rows per page">
								<option>10</option>
								<option>25</option>
								<option>50</option>
							</select>{' '}
							entries
						</label>
						<div className="pagination">
							<button type="button" aria-label="First page"><IconChevronsLeft className="action-icon" aria-hidden="true" /></button>
							<button type="button" aria-label="Previous page"><IconChevronLeft className="action-icon" aria-hidden="true" /></button>
							<button className="current-page" type="button">1</button>
							<button type="button" aria-label="Next page"><IconChevronRight className="action-icon" aria-hidden="true" /></button>
							<button type="button" aria-label="Last page"><IconChevronsRight className="action-icon" aria-hidden="true" /></button>
						</div>
					</footer>
				</section>
			{isCreateOpen && (
				<div
					className="role-modal-backdrop"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) closeCreateModal()
					}}
				>
					<section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="create-role-title">
						<header className="role-modal-header">
							<div>
								<span className="eyebrow-label">Administration</span>
														<h2 id="create-role-title">{editingRole ? 'Edit role' : 'Create new role'}</h2>
							</div>
							<button
								className="modal-close"
								type="button"
								aria-label="Close create role dialog"
								onClick={closeCreateModal}
							>
								<IconX className="action-icon" aria-hidden="true" />
							</button>
						</header>

						<form onSubmit={handleCreateSubmit} noValidate>
							<div className="role-form-body">
								<label className="role-field">
									<span>Role Name <b>*</b></span>
									<input
										value={roleName}
										onChange={(event) => {
											setRoleName(event.target.value)
											setRoleFieldErrors((errors) => ({ ...errors, name: undefined }))
										}}
										autoFocus
										aria-invalid={Boolean(roleFieldErrors.name)}
										className={roleFieldErrors.name ? 'has-error' : undefined}
									/>
									{roleFieldErrors.name && <span className="role-field-error" role="alert">{roleFieldErrors.name}</span>}
								</label>
								<label className="role-field">
									<span>Display Name <b>*</b></span>
									<input
										value={displayName}
										onChange={(event) => {
											setDisplayName(event.target.value)
											setRoleFieldErrors((errors) => ({ ...errors, displayName: undefined }))
										}}
										aria-invalid={Boolean(roleFieldErrors.displayName)}
										className={roleFieldErrors.displayName ? 'has-error' : undefined}
									/>
									{roleFieldErrors.displayName && <span className="role-field-error" role="alert">{roleFieldErrors.displayName}</span>}
								</label>
								<label className="role-field role-description">
									<span>Role description</span>
									<textarea
										value={description}
										onChange={(event) => setDescription(event.target.value)}
										rows={3}
									/>
								</label>
								<fieldset className="permissions-field">
									<legend>Permissions</legend>
									{isPermissionLoading && (
										<p className="roles-status" role="status">
											Loading permissions...
										</p>
									)}
									{permissionError && (
										<p className="role-form-error" role="alert">
											{permissionError}
										</p>
									)}
									{!isPermissionLoading && !permissionError && (
										<div className="permissions-grid">
											{permissions.map((permission) => (
												<label className="permission-option" key={permission}>
													<input
														type="checkbox"
														checked={selectedPermissions.includes(permission)}
														onChange={() => togglePermission(permission)}
													/>
													<span>{permission}</span>
												</label>
											))}
										</div>
									)}
								</fieldset>
								{formError && (
									<p className="role-form-error" role="alert">
										{formError}
									</p>
								)}
							</div>

							<footer className="role-modal-footer">
								<button className="modal-cancel" type="button" onClick={closeCreateModal} disabled={isSubmitting}>
									Cancel
								</button>
								<button className="primary-action" type="submit" disabled={isSubmitting}>
									<ActionIcon type="create" />
															<span>{isSubmitting ? 'Saving...' : editingRole ? 'Update' : 'Save'}</span>
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

export default AdminRole