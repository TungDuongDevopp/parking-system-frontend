import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCalendarEvent,
  IconDatabaseOff,
  IconRefresh,
} from '@tabler/icons-react'
import Sidebar from '../components/sidebar/Sidebar'
import { ActivityChart, OccupancyRing } from './dashboard/AdminDashboardCharts'
import { useAdminDashboardData, type DashboardActivityPeriod } from './dashboard/useDashboardData'
import '../resources/css/design-system.scss'
import '../resources/css/dashboard.scss'
import '../resources/css/adminDashboard.scss'

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

const vehicleTypeName = (value: number) =>
  ({
    1: 'Bicycle',
    2: 'E-bike',
    3: 'Motorcycle',
    4: 'E-moto',
    5: 'Car',
  })[value] ?? `Type ${value}`

const parkingModeName = (value: number) =>
  value === 0 ? 'Spot assigned' : value === 1 ? 'Capacity pool' : `Mode ${value}`

const isCheckInActivity = (value: number | string) => value === 1 || value === 'CheckIn'

const Dashboard = () => {
  const [username, setUsername] = useState('Admin')
  const [activityPeriod, setActivityPeriod] = useState<DashboardActivityPeriod>(7)
  const [retryKey, setRetryKey] = useState(0)
  const {
    data,
    isLoading,
    isActivityLoading,
    error,
    activityError,
  } = useAdminDashboardData(activityPeriod, retryKey)
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())
  const summary = data?.summary
  const subscriptions = data?.subscriptions ?? []
  const subscriptionTotal = subscriptions.reduce((total, item) => total + item.count, 0)
  const activity = data?.activity ?? []
  const periodCheckIns = activity.reduce((total, point) => total + point.checkInCount, 0)
  const periodCheckOuts = activity.reduce((total, point) => total + point.checkOutCount, 0)
  const nearFullAreas = (data?.parkingAreas ?? []).filter(
    (area) => area.status === 1 && area.occupancyPercentage >= 85,
  )

  return (
    <div className="workspace">
      <Sidebar onUsernameLoaded={setUsername} />
      <main className="main-content">
        <div className="ps-page admin-ops">
          <header className="ps-page-header">
            <div>
              <span className="ps-kicker">Operations</span>
              <h1>Network control</h1>
              <p>
                {username}, occupancy, capacity pressure and gate traffic for the whole site.
              </p>
            </div>
            <div className="ps-toolbar">
              <span className="ps-live"><i />Dashboard API</span>
              <span className="ps-chip">
                <IconCalendarEvent size={16} />
                {today}
              </span>
              <button className="ps-btn" type="button" onClick={() => setRetryKey((key) => key + 1)} disabled={isLoading}>
                <IconRefresh size={16} />
                Reload
              </button>
            </div>
          </header>
          {error && (
            <div className="dashboard-error-inline" role="alert">
              <IconDatabaseOff size={18} />
              <span>{error}</span>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
                Retry
              </button>
            </div>
          )}

          <section className="ps-kpi-row" aria-label="Capacity snapshot">
            <article className="ps-kpi">
              <span>On site now</span>
              <strong>{isLoading || !summary ? '—' : formatNumber(summary.activeSessionsCount)}</strong>
              <small>Active parking sessions</small>
            </article>
            <article className="ps-kpi">
              <span>Open capacity</span>
              <strong>{isLoading || !summary ? '—' : formatNumber(summary.availableCapacity)}</strong>
              <small>of {summary ? formatNumber(summary.totalCapacity) : '—'} spaces</small>
            </article>
            <article className="ps-kpi">
              <span>Utilization</span>
              <strong>{isLoading || !summary ? '—' : `${Math.round(summary.occupancyRate)}%`}</strong>
              <small>System occupancy</small>
            </article>
            <article className="ps-kpi">
              <span>Active parking areas</span>
              <strong>{isLoading || !summary ? '—' : formatNumber(summary.activeParkingAreasCount)}</strong>
              <small>{data ? `${nearFullAreas.length} near capacity` : 'Currently operational'}</small>
            </article>
          </section>

          <section className="admin-ops-grid">
            <article className="ps-surface">
              <div className="ps-surface-head">
                <div>
                  <h2>Gate traffic</h2>
                  <p>Arrivals versus departures across the selected window</p>
                </div>
                <div className="ps-segmented" role="group" aria-label="Activity period">
                  {([7, 30, 90] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={activityPeriod === period ? 'active' : ''}
                      onClick={() => setActivityPeriod(period)}
                    >
                      {period}d
                    </button>
                  ))}
                </div>
              </div>
              <dl className="admin-ops-metrics">
                <div>
                  <dt>Check-ins</dt>
                  <dd>{isActivityLoading || activityError ? '—' : formatNumber(periodCheckIns)}</dd>
                </div>
                <div>
                  <dt>Check-outs</dt>
                  <dd>{isActivityLoading || activityError ? '—' : formatNumber(periodCheckOuts)}</dd>
                </div>
                <div>
                  <dt>Net stay</dt>
                  <dd>{isActivityLoading || activityError ? '—' : formatNumber(periodCheckIns - periodCheckOuts)}</dd>
                </div>
              </dl>
              {activityError && (
                <p className="dashboard-error-inline" role="alert">{activityError}</p>
              )}
              {isLoading || isActivityLoading ? (
                <div className="ps-skeleton" style={{ height: 220 }} />
              ) : activityError ? (
                <div className="dashboard-empty-state" role="alert">
                  <IconDatabaseOff size={22} />
                  <span>Activity data could not be loaded.</span>
                </div>
              ) : activity.length === 0 ? (
                <div className="dashboard-empty-state">
                  <span>No parking activity for the selected period.</span>
                </div>
              ) : (
                <ActivityChart data={activity} period={activityPeriod} />
              )}
            </article>

            <div className="admin-ops-side">
              <article className="ps-surface">
                <div className="ps-surface-head">
                  <div>
                    <h2>Capacity mix</h2>
                    <p>Used or held, compared with available capacity</p>
                  </div>
                </div>
                {summary ? (
                  <div className="admin-ops-mix">
                    <OccupancyRing
                      unavailable={summary.unavailableCapacity}
                      available={summary.availableCapacity}
                      capacity={summary.totalCapacity}
                      rate={summary.occupancyRate}
                    />
                    <ul>
                      <li><i className="occ" />Unavailable capacity <b>{formatNumber(summary.unavailableCapacity)}</b></li>
                      <li><i className="res" />Vehicles parked <b>{formatNumber(summary.activeSessionsCount)}</b></li>
                      <li><i className="avl" />Held by reservation <b>{formatNumber(summary.reservedCount)}</b></li>
                      <li><i className="avl" />Available capacity <b>{formatNumber(summary.availableCapacity)}</b></li>
                    </ul>
                  </div>
                ) : isLoading ? (
                  <div className="ps-skeleton" style={{ height: 160 }} />
                ) : (
                  <div className="dashboard-empty-state">
                    {error ? 'Capacity data could not be loaded.' : 'No occupancy data available.'}
                  </div>
                )}
              </article>

              <article className="ps-surface">
                <div className="ps-surface-head">
                  <div>
                    <h2>Area watch</h2>
                    <p>Active parking areas close to capacity</p>
                  </div>
                </div>
                <ul className="admin-health-list">
                  {isLoading ? (
                    <li><span className="ps-skeleton" />Loading area occupancy…</li>
                  ) : nearFullAreas.length ? nearFullAreas.map((area) => (
                    <li key={area.id}>
                      <span className="admin-health-dot warn" />
                      <span>
                        <strong>{area.name}</strong>
                        <small>{Math.round(area.occupancyPercentage)}% utilized · {formatNumber(area.availableCapacity)} available</small>
                      </span>
                    </li>
                  )) : (
                    <li>
                      <span className={`admin-health-dot ${error ? 'down' : 'ok'}`} />
                      <span>
                        <strong>{error ? 'Area occupancy unavailable' : 'No areas near capacity'}</strong>
                        <small>{error ?? 'No active parking area currently meets the near-full threshold.'}</small>
                      </span>
                    </li>
                  )}
                </ul>
              </article>
            </div>
          </section>

          <section className="ps-surface">
            <div className="ps-surface-head">
              <div>
                <h2>Parking areas</h2>
                <p>Pressure by facility — near-full highlighted</p>
              </div>
              <Link className="ps-link" to="/admin/parkingAreas">
                Manage <IconArrowRight size={15} />
              </Link>
            </div>
            {error && (
              <div className="dashboard-error-inline" role="alert">
                <IconDatabaseOff size={18} /> {error}
              </div>
            )}
            {isLoading ? (
              <div className="ps-skeleton" style={{ height: 180 }} aria-label="Loading parking areas" />
            ) : (data?.parkingAreas.length ?? 0) === 0 ? (
              <div className="dashboard-empty-state">
                {error ? 'Parking areas could not be loaded.' : 'No parking areas are available.'}
              </div>
            ) : <div className="ps-table-wrap">
              <table className="ps-table admin-ops-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Area</th>
                    <th>Type</th>
                    <th>Mode</th>
                    <th>Capacity</th>
                    <th>Parked</th>
                    <th>Reserved</th>
                    <th>Unavailable</th>
                    <th>Load</th>
                    <th>Free</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.parkingAreas ?? []).map((area) => {
                    const hot = area.status === 1 && area.occupancyPercentage >= 85
                    return (
                      <tr key={area.id}>
                        <td>{area.id}</td>
                        <td>
                          <strong className="admin-ops-name">{area.name}</strong>
                          <span className="ps-mono">{area.parkingCode}</span>
                        </td>
                        <td>{vehicleTypeName(area.vehicleType)}</td>
                        <td>{parkingModeName(area.parkingMode)}</td>
                        <td>{formatNumber(area.capacity)}</td>
                        <td>{formatNumber(area.activeSessionsCount)}</td>
                        <td>{formatNumber(area.reservedCount)}</td>
                        <td>{formatNumber(area.unavailableCapacity)}</td>
                        <td>
                          <div className="admin-ops-load">
                            <div className={`ps-progress${hot ? ' warn' : ''}`}>
                              <span style={{ width: `${Math.min(100, area.occupancyPercentage)}%` }} />
                            </div>
                            <b>{Math.round(area.occupancyPercentage)}%</b>
                          </div>
                        </td>
                        <td>{formatNumber(area.availableCapacity)}</td>
                        <td>
                          <span className={`ps-badge ${area.status === 1 ? (hot ? 'warn' : 'ok') : 'muted'}`}>
                            {area.status === 1 ? (hot ? 'Near full' : 'Active') : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>}
          </section>

          <section className="admin-ops-lower">
            <article className="ps-surface">
              <div className="ps-surface-head">
                <div>
                  <h2>Subscriptions</h2>
                  <p>{formatNumber(subscriptionTotal)} plans on file</p>
                </div>
                <Link className="ps-link" to="/admin/subscriptions">
                  View <IconArrowRight size={15} />
                </Link>
              </div>
              {isLoading ? (
                <div className="ps-skeleton" style={{ height: 120 }} />
              ) : subscriptions.length ? (
                <div className="admin-sub-list">
                  {subscriptions.map((item) => (
                    <div key={item.status}>
                      <span className={`admin-sub-mark s${item.status}`} />
                      <span>{item.subscriptionStatusName}</span>
                      <b>{formatNumber(item.count)}</b>
                      <div className="ps-progress">
                        <span
                          className={`s${item.status}`}
                          style={{ width: `${subscriptionTotal ? (item.count / subscriptionTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  {error ? 'Subscription statistics could not be loaded.' : 'No subscription data available.'}
                </div>
              )}
            </article>

            <article className="ps-surface">
              <div className="ps-surface-head">
                <div>
                  <h2>Latest movements</h2>
                  <p>Most recent gate events</p>
                </div>
                <Link className="ps-link" to="/admin/sessions">
                  Sessions <IconArrowRight size={15} />
                </Link>
              </div>
              {isLoading ? (
                <div className="ps-skeleton" style={{ height: 150 }} />
              ) : data?.recentActivities.length ? <ol className="admin-feed">
                {(data?.recentActivities ?? []).slice(0, 6).map((item) => {
                  const checkIn = isCheckInActivity(item.activityType)
                  const time = item.localEventTime || item.eventTime
                  return (
                    <li key={`${item.parkingSessionId}-${item.activityType}`}>
                      <span className={`ps-badge ${checkIn ? 'ok' : 'info'}`}>
                        {checkIn ? 'In' : 'Out'}
                      </span>
                      <div>
                        <strong className="ps-mono">{item.plateNumber ?? item.ticketCode}</strong>
                        <small>{item.parkingAreaName}</small>
                      </div>
                      <time dateTime={time}>
                        {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(time))}
                      </time>
                    </li>
                  )
                })}
              </ol> : (
                <div className="dashboard-empty-state">
                  {error ? 'Recent activities could not be loaded.' : 'No recent parking activities.'}
                </div>
              )}
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
