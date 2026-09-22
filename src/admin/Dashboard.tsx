import { useState } from 'react';
import "../resources/css/dashboard.css";
import AdminSidebar from './AdminSidebar';

const Dashboard = () =>{
    const [username, setUsername] = useState('Admin')

    return (
  <div className="workspace">
    <AdminSidebar onUsernameLoaded={setUsername} />
    <main className="main-content">
      <section className="welcome">
        <div>
          <h1>Good morning, {username}</h1>
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
