import { useState } from 'react';
import "../resources/css/dashboard.css";
import AdminSidebar from '../admin/AdminSidebar';

const StaffHome = () =>{
    const [username, setUsername] = useState('Minh Nguyen')

    return (
  <div className="workspace">
    <AdminSidebar variant="staff" onUsernameLoaded={setUsername} />
    <main className="main-content">
      <section className="welcome">
        <div>
          <h1>Good morning, {username}</h1>
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
