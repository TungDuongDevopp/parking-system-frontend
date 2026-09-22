import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import '../resources/css/dashboard.css'

const roles = [
	{ name: 'Admin', displayName: 'Quyền quản trị' },
	{ name: 'Customer', displayName: 'Quyền khách hàng' },
	{ name: 'Staff', displayName: 'Quyền nhân viên' },
]

function AdminRole() {
	const [query, setQuery] = useState('')
	const filteredRoles = roles.filter((role) => `${role.name} ${role.displayName}`.toLowerCase().includes(query.toLowerCase()))

	return (
		<div className="workspace roles-workspace">
			<AdminSidebar />
			<main className="main-content roles-content">
				<header className="roles-header">
					<div><span className="eyebrow-label">Administration</span><h1>Roles</h1></div>
					<button className="primary-action" type="button"><span>＋</span> Create</button>
				</header>
				<section className="roles-card" aria-label="Roles list">
					<div className="roles-toolbar">
						<label className="roles-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles" aria-label="Search roles" /></label>
					</div>
					<div className="roles-table-wrap">
						<table className="roles-table">
							<thead><tr><th>Role Name <span>↕</span></th><th>Display Name <span>↕</span></th><th>Actions</th></tr></thead>
							<tbody>{filteredRoles.map((role) => <tr key={role.name}><td>{role.name}</td><td>{role.displayName}</td><td><div className="role-actions"><button className="edit-action" type="button">✎ Edit</button><button className="delete-action" type="button">▣ Delete</button></div></td></tr>)}</tbody>
						</table>
						{filteredRoles.length === 0 && <p className="empty-roles">No roles found.</p>}
					</div>
					<footer className="roles-footer"><button className="refresh-action" type="button" aria-label="Refresh roles">⟳</button><span>{filteredRoles.length ? `1-${filteredRoles.length} of ${filteredRoles.length} items` : '0 items'}</span><label>Show <select defaultValue="10" aria-label="Rows per page"><option>10</option><option>25</option><option>50</option></select> entries</label><div className="pagination"><button type="button">«</button><button type="button">‹</button><button className="current-page" type="button">1</button><button type="button">›</button><button type="button">»</button></div></footer>
				</section>
				<p className="roles-note"><Link to="/admin">← Back to dashboard</Link></p>
			</main>
		</div>
	)
}

export default AdminRole