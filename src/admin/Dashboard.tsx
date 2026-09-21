import "../resources/css/dashboard.css";

const Dashboard = () =>{
   const handleSignOut = () => {
        localStorage.removeItem('accessToken')
        sessionStorage.clear()
        window.location.href = '/login'
    }

    return (
  <div className="workspace">
    <aside className="sidebar">
      <a className="workspace-brand" href="/">
        <span className="brand-square">P</span>
        <span>
          Park<span>ing</span>System
        </span>
      </a>
      <p className="sidebar-label">Workspace</p>
      <nav className="side-nav" aria-label="Admin navigation">
        <a className="active" href="/admin">
          <span className="side-icon">⌂</span>
          <span>Overview</span>
        </a>
        <a href="#locations">
          <span className="side-icon">▦</span>
          <span>Parking locations</span>
        </a>
        <a href="#staff">
          <span className="side-icon">♙</span>
          <span>Staff members</span>
        </a>
        <a href="#reports">
          <span className="side-icon">▥</span>
          <span>Reports</span>
        </a>
      </nav>
      <div className="sidebar-spacer" />
      <div className="help-box">
        <strong>Need a hand?</strong>
        <small>Our support team is ready to help.</small>
        <a href="#support">Contact support</a>
      </div>
      <details className="account-dropdown sidebar-account">
        <summary className="profile">
          <span className="avatar">AD</span>
          <div>
            <strong>Admin account</strong>
            <small>Administrator</small>
          </div>
          <span className="account-chevron"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></span>
        </summary>
        <div className="account-menu">
          <button type="button" onClick={() => { window.location.href = '/change-password' }}><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5a4 4 0 0 0-5.2 5.2L4 16v3h3v-2h2v-2h2.2l2.1-2.1a4 4 0 0 0 1.2-7.4ZM17 4l3 3m-1.5-1.5 1.5-1.5" /></svg></span>Change password</button>
          <button type="button" onClick={handleSignOut}><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10M14 8l4 4-4 4M18 12H9" /></svg></span>Logout</button>
        </div>
      </details>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <span className="crumb">
          Workspace / <strong>Overview</strong>
        </span>
        <div className="topbar-actions">
          <span className="notification">♧</span>
          <span className="avatar">AD</span>
        </div>
      </header>
      <section className="welcome">
        <div>
          <h1>Good morning, Admin</h1>
          <p>Here is what is happening across your parking network today.</p>
        </div>
        <span className="date-pill">▣ September 21, 2026</span>
      </section>
      <section className="metric-grid" aria-label="Parking summary">
        <article className="metric-card">
          <div className="metric-head">
            <span>Total spaces</span>
            <span className="metric-icon">▦</span>
          </div>
          <h2>1,248</h2>
          <span className="metric-change">↗ 8.2% this month</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Occupied now</span>
            <span className="metric-icon">◉</span>
          </div>
          <h2>892</h2>
          <span className="metric-change">↗ 12.4% today</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Active staff</span>
            <span className="metric-icon">♙</span>
          </div>
          <h2>36</h2>
          <span className="metric-change neutral">→ Same as yesterday</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Revenue today</span>
            <span className="metric-icon">$</span>
          </div>
          <h2>$8,420</h2>
          <span className="metric-change">↗ 6.8% this week</span>
        </article>
      </section>
      <section className="content-grid">
        <article className="panel">
          <div className="panel-title">
            <h2>Parking activity</h2>
            <a href="#reports">Last 7 days⌄</a>
          </div>
          <div className="bar-chart">
            {[42, 60, 49, 78, 67, 91, 74].map((height, index) => (
              <div className="bar-column" key={index}>
                <i style={{ height: `${height}%` }} />
                <span>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span>
              <b />
              Vehicles parked
            </span>
            <span>
              <b className="muted" />
              Available spaces
            </span>
          </div>
        </article>
        <article className="panel">
          <div className="panel-title">
            <h2>Live occupancy</h2>
            <a href="#locations">View map</a>
          </div>
          <div className="occupancy">
            <div className="donut" />
            <div className="occupancy-list">
              <div>
                <span>
                  <b className="status-dot" />
                  Occupied
                </span>
                <strong>892</strong>
              </div>
              <div>
                <span>
                  <b className="status-dot open" />
                  Available
                </span>
                <strong>356</strong>
              </div>
              <div>
                <span>
                  <b className="status-dot busy" />
                  Reserved
                </span>
                <strong>84</strong>
              </div>
            </div>
          </div>
        </article>
      </section>
      <section className="panel table-panel">
        <div className="panel-title">
          <h2>Parking locations</h2>
          <a href="#locations">Manage locations →</a>
        </div>
        <table className="parking-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Capacity</th>
              <th>Occupancy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Central Plaza</td>
              <td>420 spaces</td>
              <td>84%</td>
              <td>
                <span className="tag">Operational</span>
              </td>
            </tr>
            <tr>
              <td>Riverside Mall</td>
              <td>318 spaces</td>
              <td>67%</td>
              <td>
                <span className="tag">Operational</span>
              </td>
            </tr>
            <tr>
              <td>Airport Terminal B</td>
              <td>510 spaces</td>
              <td>91%</td>
              <td>
                <span className="tag busy">High traffic</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
);
} 
export default Dashboard;
