import "../resources/css/dashboard.css";

const StaffHome = () =>{
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
      <p className="sidebar-label">Staff desk</p>
      <nav className="side-nav" aria-label="Staff navigation">
        <a className="active" href="/staff">
          <span className="side-icon">⌂</span>
          <span>My dashboard</span>
        </a>
        <a href="#check-in">
          <span className="side-icon">↗</span>
          <span>Check in vehicle</span>
        </a>
        <a href="#tickets">
          <span className="side-icon">▤</span>
          <span>Tickets</span>
        </a>
        <a href="#incidents">
          <span className="side-icon">!</span>
          <span>Incidents</span>
        </a>
      </nav>
      <div className="sidebar-spacer" />
      <div className="help-box">
        <strong>Shift support</strong>
        <small>Ask the supervisor if you need assistance.</small>
        <a href="#support">Open help desk</a>
      </div>
      <details className="account-dropdown sidebar-account">
        <summary className="profile">
          <span className="avatar">MN</span>
          <div>
            <strong>Minh Nguyen</strong>
            <small>Parking attendant</small>
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
          Staff desk / <strong>My dashboard</strong>
        </span>
        <div className="topbar-actions">
          <span className="notification">♧</span>
          <span className="avatar">MN</span>
        </div>
      </header>
      <section className="welcome">
        <div>
          <h1>Good morning, Minh</h1>
          <p>Your shift is active at Central Plaza. Keep the flow moving.</p>
        </div>
        <span className="date-pill">● On shift · 08:00 - 16:00</span>
      </section>
      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-head">
            <span>Cars checked in</span>
            <span className="metric-icon">↗</span>
          </div>
          <h2>128</h2>
          <span className="metric-change">↗ 14 since last hour</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Available spots</span>
            <span className="metric-icon">▦</span>
          </div>
          <h2>76</h2>
          <span className="metric-change">Safe capacity</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Pending tickets</span>
            <span className="metric-icon">▤</span>
          </div>
          <h2>08</h2>
          <span className="metric-change neutral">Requires attention</span>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>Shift revenue</span>
            <span className="metric-icon">$</span>
          </div>
          <h2>$1,240</h2>
          <span className="metric-change">↗ 9.5% today</span>
        </article>
      </section>
      <section className="content-grid">
        <article className="panel">
          <div className="panel-title">
            <h2>Quick check-in</h2>
            <a href="#check-in">Open scanner →</a>
          </div>
          <p style={{ color: "#8195a9", fontSize: "12px", lineHeight: 1.7 }}>
            Register a vehicle entering the parking area and assign the closest
            available spot.
          </p>
          <a className="hero-button" href="#check-in">
            + Check in vehicle
          </a>
        </article>
        <article className="panel">
          <div className="panel-title">
            <h2>Current zone</h2>
            <a href="#map">View map</a>
          </div>
          <div className="occupancy-list">
            <div>
              <span>
                <b className="status-dot open" />
                Zone A · Ground floor
              </span>
              <strong>24 open</strong>
            </div>
            <div>
              <span>
                <b className="status-dot" />
                Zone B · Level 1
              </span>
              <strong>38 open</strong>
            </div>
            <div>
              <span>
                <b className="status-dot busy" />
                Zone C · Level 2
              </span>
              <strong>14 open</strong>
            </div>
          </div>
        </article>
      </section>
      <section className="panel table-panel">
        <div className="panel-title">
          <h2>Recent activity</h2>
          <a href="#tickets">See all activity →</a>
        </div>
        <table className="parking-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Vehicle</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#PS-2048</td>
              <td>29A-123.45</td>
              <td>10:42 AM</td>
              <td>
                <span className="tag">Checked in</span>
              </td>
            </tr>
            <tr>
              <td>#PS-2047</td>
              <td>51F-882.10</td>
              <td>10:38 AM</td>
              <td>
                <span className="tag">Checked out</span>
              </td>
            </tr>
            <tr>
              <td>#PS-2046</td>
              <td>30K-665.21</td>
              <td>10:31 AM</td>
              <td>
                <span className="tag busy">Payment due</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
);
}
export default StaffHome;
