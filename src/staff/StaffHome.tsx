import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowRight,
  IconBuildingCommunity,
  IconCalendar,
  IconClock,
  IconDatabaseOff,
  IconLogin2,
  IconLogout2,
  IconParking,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import Sidebar from '../components/sidebar/Sidebar'
import { useStaffDashboardData } from '../admin/dashboard/useDashboardData'
import { getParkingAreas } from '../services/parkingAreaService'
import { getParkingSpots } from '../services/parkingSpotService'
import { getReservations } from '../services/reservationService'
import { checkIn } from '../services/sessionService'
import type { ParkingAreaDto } from '../types/ParkingArea/parkingArea'
import type { RecentActivityDto } from '../types/Dashboard/dashboard'
import type { ParkingSpotDto } from '../types/ParkingSpot/parkingSpot'
import type { ReservationDto } from '../types/Reservation/reservation'
import '../resources/css/design-system.scss'
import '../resources/css/dashboard.scss'
import '../resources/css/staffDashboard.scss'

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

const isCheckInActivity = (value: RecentActivityDto['activityType']) =>
  value === 1 || value === 'CheckIn'

const vehicleTypeName = (value: number) =>
  ({ 1: 'Bicycle', 2: 'E-bike', 3: 'Motorcycle', 4: 'E-moto', 5: 'Car' })[value] ?? `Type ${value}`

const vehicleTypes = [
  { id: 1, label: 'Bicycle' },
  { id: 2, label: 'Electric Bicycle' },
  { id: 3, label: 'Motorcycle' },
  { id: 4, label: 'Electric Motorcycle' },
  { id: 5, label: 'Car' },
]

const parkingModeName = (value: number) =>
  value === 0 ? 'Individual spot' : value === 1 ? 'Capacity based' : `Mode ${value}`

const StaffHome = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('Staff')
  const [retryKey, setRetryKey] = useState(0)
  const [isCheckInFormOpen, setIsCheckInFormOpen] = useState(false)
  const [isCheckInLookupsLoading, setIsCheckInLookupsLoading] = useState(false)
  const [checkInLookupError, setCheckInLookupError] = useState('')
  const [checkInParkingAreas, setCheckInParkingAreas] = useState<ParkingAreaDto[]>([])
  const [checkInReservations, setCheckInReservations] = useState<ReservationDto[]>([])
  const [checkInParkingSpots, setCheckInParkingSpots] = useState<ParkingSpotDto[]>([])
  const [selectedCheckInAreaId, setSelectedCheckInAreaId] = useState<number | ''>('')
  const [selectedCheckInSpotId, setSelectedCheckInSpotId] = useState<number | ''>('')
  const [selectedCheckInReservationId, setSelectedCheckInReservationId] = useState<number | ''>('')
  const [selectedCheckInVehicleType, setSelectedCheckInVehicleType] = useState<number | ''>('')
  const [areCheckInSpotsLoading, setAreCheckInSpotsLoading] = useState(false)
  const [checkInSpotsError, setCheckInSpotsError] = useState('')
  const [checkInPlateNumber, setCheckInPlateNumber] = useState('')
  const [checkInSubmitError, setCheckInSubmitError] = useState('')
  const [checkInSuccessMessage, setCheckInSuccessMessage] = useState('')
  const [checkInTicketCode, setCheckInTicketCode] = useState('')
  const [isCheckInSubmitting, setIsCheckInSubmitting] = useState(false)
  const [isCheckInConfirmationOpen, setIsCheckInConfirmationOpen] = useState(false)
  const [isReservationSearchOpen, setIsReservationSearchOpen] = useState(false)
  const [reservationSearch, setReservationSearch] = useState('')
  const [selectedSpotAreaId, setSelectedSpotAreaId] = useState<number | ''>('')
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotDto[]>([])
  const [areSpotsLoading, setAreSpotsLoading] = useState(false)
  const [spotsError, setSpotsError] = useState('')
  const { data, isLoading, error } = useStaffDashboardData(retryKey)
  const summary = data?.summary
  const parkingAreas = data?.parkingAreas ?? []
  const individualParkingAreas = parkingAreas.filter((area) => area.parkingMode === 0)
  const selectedSpotArea = individualParkingAreas.find((area) => area.id === selectedSpotAreaId)
    ?? individualParkingAreas[0]
  const recentActivities = data?.recentActivities ?? []
  const nearFullAreas = parkingAreas.filter(
    (area) => area.status === 1 && area.occupancyPercentage >= 85,
  )
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const openCheckInForm = async () => {
    setIsCheckInFormOpen(true)
    setIsCheckInLookupsLoading(true)
    setCheckInLookupError('')
    try {
      const pageSize = 100
      const [areaPage, reservationPage] = await Promise.all([
        getParkingAreas({ status: 1, skipCount: 0, maxResultCount: pageSize }),
        getReservations({ status: 1, skipCount: 0, maxResultCount: pageSize }),
      ])

      const areas = [...areaPage.items]
      const reservations = [...reservationPage.items]
      const pagesToLoad = Math.max(
        Math.ceil(areaPage.totalCount / pageSize),
        Math.ceil(reservationPage.totalCount / pageSize),
      )
      for (let page = 1; page < pagesToLoad; page += 1) {
        const [nextAreas, nextReservations] = await Promise.all([
          page * pageSize < areaPage.totalCount
            ? getParkingAreas({ status: 1, skipCount: page * pageSize, maxResultCount: pageSize })
            : Promise.resolve(null),
          page * pageSize < reservationPage.totalCount
            ? getReservations({ status: 1, skipCount: page * pageSize, maxResultCount: pageSize })
            : Promise.resolve(null),
        ])
        if (nextAreas) areas.push(...nextAreas.items)
        if (nextReservations) reservations.push(...nextReservations.items)
      }

      setCheckInParkingAreas(areas)
      setCheckInReservations(reservations)
      setSelectedCheckInAreaId('')
      setSelectedCheckInSpotId('')
      setSelectedCheckInReservationId('')
      setSelectedCheckInVehicleType('')
      setCheckInPlateNumber('')
      setCheckInSubmitError('')
      setCheckInSuccessMessage('')
      setCheckInTicketCode('')
      setIsCheckInConfirmationOpen(false)
      setCheckInParkingSpots([])
    } catch (lookupError) {
      setCheckInLookupError(
        lookupError instanceof Error ? lookupError.message : 'Unable to load check-in options.',
      )
    } finally {
      setIsCheckInLookupsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedCheckInAreaId) {
      setCheckInParkingSpots([])
      setSelectedCheckInSpotId('')
      setCheckInSpotsError('')
      setAreCheckInSpotsLoading(false)
      return
    }

    let cancelled = false
    const loadCheckInSpots = async () => {
      setAreCheckInSpotsLoading(true)
      setCheckInSpotsError('')
      setCheckInParkingSpots([])
      try {
        const pageSize = 100
        const firstPage = await getParkingSpots({
          parkingAreaId: selectedCheckInAreaId,
          status: 1,
          skipCount: 0,
          maxResultCount: pageSize,
        })
        const spots = [...firstPage.items]
        for (let skipCount = pageSize; skipCount < firstPage.totalCount; skipCount += pageSize) {
          const page = await getParkingSpots({
            parkingAreaId: selectedCheckInAreaId,
            status: 1,
            skipCount,
            maxResultCount: pageSize,
          })
          if (!page.items.length) throw new Error('Unable to load all available parking spots.')
          spots.push(...page.items)
        }
        if (!cancelled) setCheckInParkingSpots(spots)
      } catch (error) {
        if (!cancelled) {
          setCheckInSpotsError(error instanceof Error ? error.message : 'Unable to load parking spots.')
        }
      } finally {
        if (!cancelled) setAreCheckInSpotsLoading(false)
      }
    }

    void loadCheckInSpots()
    return () => {
      cancelled = true
    }
  }, [selectedCheckInAreaId])

  const selectedCheckInReservation = checkInReservations.find(
    (reservation) => reservation.id === selectedCheckInReservationId,
  )

  const submitCheckIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckInSubmitError('')
    setCheckInSuccessMessage('')
    setCheckInTicketCode('')

    if (!selectedCheckInReservationId) {
      if (!selectedCheckInAreaId) {
        setCheckInSubmitError('Select a parking area.')
        return
      }
      if (
        checkInParkingAreas.find((area) => area.id === selectedCheckInAreaId)?.parkingMode === 0 &&
        !selectedCheckInSpotId
      ) {
        setCheckInSubmitError('Select a parking spot.')
        return
      }
    }
    if (!selectedCheckInVehicleType) {
      setCheckInSubmitError('Select a vehicle type.')
      return
    }
    if (!checkInPlateNumber.trim()) {
      setCheckInSubmitError('Enter a license plate number.')
      return
    }

    setIsCheckInConfirmationOpen(true)
  }

  const confirmCheckIn = async () => {
    setCheckInSubmitError('')
    setIsCheckInSubmitting(true)
    try {
      const result = await checkIn({
        ...(selectedCheckInReservationId
          ? { reservationId: selectedCheckInReservationId }
          : {
              parkingAreaId: Number(selectedCheckInAreaId),
              parkingSpotId: selectedCheckInSpotId ? Number(selectedCheckInSpotId) : null,
            }),
        vehicleType: Number(selectedCheckInVehicleType),
        plateNumber: checkInPlateNumber.trim(),
      })
      if (!result.success) {
        setCheckInSubmitError(result.message || 'Check-in could not be completed.')
        return
      }
      setCheckInSuccessMessage(result.message || 'Vehicle checked in successfully.')
      setCheckInTicketCode(result.ticketCode ?? '')
      setIsCheckInConfirmationOpen(false)
      setRetryKey((key) => key + 1)
    } catch (submitError) {
      setCheckInSubmitError(
        submitError instanceof Error ? submitError.message : 'Unable to check in vehicle.',
      )
    } finally {
      setIsCheckInSubmitting(false)
    }
  }

  useEffect(() => {
    if (!selectedSpotArea) {
      setParkingSpots([])
      setSpotsError('')
      setAreSpotsLoading(false)
      return
    }

    let cancelled = false
    const loadParkingSpots = async () => {
      setParkingSpots([])
      setAreSpotsLoading(true)
      setSpotsError('')
      try {
        const pageSize = 100
        const firstPage = await getParkingSpots({
          parkingAreaId: selectedSpotArea.id,
          skipCount: 0,
          maxResultCount: pageSize,
        })
        const allSpots = [...firstPage.items]
        for (let skipCount = pageSize; skipCount < firstPage.totalCount; skipCount += pageSize) {
          const page = await getParkingSpots({
            parkingAreaId: selectedSpotArea.id,
            skipCount,
            maxResultCount: pageSize,
          })
          if (!page.items.length) {
            throw new Error('Unable to load all parking spots for this area.')
          }
          allSpots.push(...page.items)
        }
        if (!cancelled) setParkingSpots(allSpots)
      } catch (spotError) {
        if (!cancelled) {
          setParkingSpots([])
          setSpotsError(
            spotError instanceof Error ? spotError.message : 'Unable to load parking spots.',
          )
        }
      } finally {
        if (!cancelled) setAreSpotsLoading(false)
      }
    }

    void loadParkingSpots()
    return () => {
      cancelled = true
    }
  }, [selectedSpotArea])

  const kpis = [
    {
      label: 'Vehicles on site',
      value: summary?.activeSessionsCount,
      descriptor: 'Active parking sessions',
      icon: IconLogin2,
      tone: 'blue',
    },
    {
      label: 'Available capacity',
      value: summary?.availableCapacity,
      descriptor: 'Spaces available across areas',
      icon: IconParking,
      tone: 'teal',
    },
    {
      label: 'Active parking areas',
      value: summary?.activeParkingAreasCount,
      descriptor: 'Currently operational',
      icon: IconBuildingCommunity,
      tone: 'navy',
    },
    {
      label: 'Areas near capacity',
      value: data ? nearFullAreas.length : undefined,
      descriptor: '85% utilization or higher',
      icon: IconBuildingCommunity,
      tone: 'amber',
    },
  ]

  return (
    <div className="workspace">
      <Sidebar onUsernameLoaded={setUsername} />
      <main className="main-content">
        <div className="ps-page staff-ops">
          <header className="ps-page-header">
            <div>
              <span className="ps-kicker">Staff operations</span>
              <h1>Parking operations</h1>
              <p>{username}, review live capacity and recent vehicle movements.</p>
            </div>
            <div className="ps-toolbar">
              <span className="ps-chip">
                <IconClock size={16} />
                {today}
              </span>
              <button
                className="ps-btn"
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
                disabled={isLoading}
              >
                <IconRefresh size={16} />
                {isLoading ? 'Refreshing' : 'Refresh'}
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

          <section className="staff-ops-hero" aria-label="Parking workspace">
            <div className="staff-workspace-actions">
              <article className="ps-surface staff-gate">
                <div className="ps-surface-head">
                  <div>
                    <h2>Session workspace</h2>
                    <p>Vehicle check-in and check-out</p>
                  </div>
                  <IconParking size={19} aria-hidden="true" />
                </div>
                <div className="staff-gate-actions">
                  <button
                    className="ps-btn ps-btn-primary staff-session-primary staff-workspace-action"
                    type="button"
                    onClick={() => void openCheckInForm()}
                  >
                    <IconLogin2 size={16} /> Check-in
                  </button>
                  <Link className="ps-btn staff-checkout-link staff-workspace-action" to="/staff/sessions">
                    <IconLogout2 size={16} /> Check-out / sessions
                  </Link>
                </div>
              </article>

              <article className="ps-surface staff-reservation-workspace">
                <div className="ps-surface-head">
                  <div>
                    <h2>Reservation workspace</h2>
                    <p>Manage upcoming reservations</p>
                  </div>
                  <IconCalendar size={19} aria-hidden="true" />
                </div>
                <Link className="ps-btn ps-btn-primary staff-reservation-link" to="/staff/reservations">
                  <IconCalendar size={16} /> View reservations
                </Link>
                {isReservationSearchOpen ? (
                  <form
                    className="staff-reservation-search"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const query = reservationSearch.trim()
                      if (!query) return
                      navigate(`/staff/reservations?${new URLSearchParams({ keyword: query })}`)
                    }}
                  >
                    <label>
                      <IconSearch size={16} aria-hidden="true" />
                      <input
                        autoFocus
                        type="search"
                        value={reservationSearch}
                        onChange={(event) => setReservationSearch(event.target.value)}
                        placeholder="Search reservation"
                        aria-label="Search reservation"
                      />
                    </label>
                    <button className="ps-btn ps-btn-primary" type="submit" disabled={!reservationSearch.trim()}>
                      Search
                    </button>
                  </form>
                ) : (
                  <button
                    className="ps-btn staff-reservation-find"
                    type="button"
                    onClick={() => setIsReservationSearchOpen(true)}
                  >
                    <IconSearch size={16} /> Find reservation
                  </button>
                )}
              </article>
            </div>

            <article className="ps-surface staff-capacity-summary">
              <div className="ps-surface-head">
                <div>
                  <h2>Individual spot area</h2>
                </div>
                <IconParking size={19} aria-hidden="true" />
              </div>
              {isLoading ? (
                <div className="ps-skeleton" style={{ height: 74 }} />
              ) : summary ? (
                <div className="staff-capacity-content">
                  {individualParkingAreas.length > 0 ? (
                    <div className="staff-spot-browser">
                      <div className="staff-spot-area-select">
                        <select
                          aria-label="Select individual-spot parking area"
                          value={selectedSpotArea?.id ?? ''}
                          onChange={(event) => setSelectedSpotAreaId(Number(event.target.value))}
                        >
                          {individualParkingAreas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name} ({area.parkingCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="staff-spot-legend" aria-label="Parking spot status legend">
                        <span><i className="available" />Available</span>
                        <span><i className="reserved" />Reserved</span>
                        <span><i className="occupied" />Occupied</span>
                        <span><i className="unavailable" />Unavailable</span>
                      </div>
                      {areSpotsLoading ? (
                        <div className="ps-skeleton staff-spot-loading" aria-label="Loading parking spots" />
                      ) : spotsError ? (
                        <div className="dashboard-error-inline" role="alert">{spotsError}</div>
                      ) : parkingSpots.length > 0 ? (
                        <div className="staff-spot-grid" aria-label={`Parking spots for ${selectedSpotArea?.name}`}>
                          {parkingSpots.map((spot) => (
                            <div
                              className={`staff-spot ${spot.status === 1 ? 'available' : spot.status === 2 ? 'reserved' : spot.status === 3 ? 'occupied' : 'unavailable'}`}
                              key={spot.id}
                              title={`${spot.spotCode} · ${spot.parkingSpotStatusName}`}
                              aria-label={`${spot.spotCode}, ${spot.parkingSpotStatusName}`}
                            >
                              {spot.spotCode.split('-').at(-1)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="dashboard-empty-state staff-spot-empty">
                          No parking spots are available in this area.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dashboard-empty-state staff-spot-empty">
                      No individual-spot areas are available.
                    </div>
                  )}
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  {error ? 'Capacity data could not be loaded.' : 'No capacity data available.'}
                </div>
              )}
            </article>
          </section>

          <section className="ps-kpi-row" aria-label="Operations summary">
            {kpis.map(({ label, value, descriptor, icon: Icon, tone }) => (
              <article className="ps-kpi" key={label}>
                <span>{label}</span>
                <strong className={`staff-kpi-value ${tone}`}>
                  {isLoading || value === undefined ? '—' : formatNumber(value)}
                  <Icon size={17} aria-hidden="true" />
                </strong>
                <small>{descriptor}</small>
              </article>
            ))}
          </section>

          <section className="ps-surface">
            <div className="ps-surface-head">
              <div>
                <h2>Parking areas</h2>
                <p>Capacity, availability and current utilization by area.</p>
              </div>
              <Link className="ps-link" to="/staff/parkingAreas">
                All areas <IconArrowRight size={15} />
              </Link>
            </div>
            {isLoading ? (
              <div className="ps-skeleton" style={{ height: 180 }} aria-label="Loading parking areas" />
            ) : parkingAreas.length ? (
              <div className="staff-area-cards">
                {parkingAreas.map((area) => {
                  const nearFull = area.status === 1 && area.occupancyPercentage >= 85
                  return (
                    <article className="staff-area-card" key={area.id}>
                      <span className="ps-mono">{area.parkingCode}</span>
                      <strong>{area.name}</strong>
                      <span>{vehicleTypeName(area.vehicleType)} · {parkingModeName(area.parkingMode)}</span>
                      <span className={`ps-badge ${area.status === 1 ? (nearFull ? 'warn' : 'ok') : 'muted'}`}>
                        {area.status === 1 ? (nearFull ? 'Near capacity' : 'Active') : 'Inactive'}
                      </span>
                      <div className={`ps-progress${nearFull ? ' warn' : ''}`}>
                        <span style={{ width: `${Math.min(100, Math.max(0, area.occupancyPercentage))}%` }} />
                      </div>
                      <div className="staff-area-capacity-values">
                        <span>{formatNumber(area.activeSessionsCount)} vehicles parked</span>
                        <span>{formatNumber(area.reservedCount)} reserved</span>
                        <span>{formatNumber(area.availableCapacity)} available / {formatNumber(area.capacity)}</span>
                      </div>
                      {area.parkingMode === 0 ? (
                        <Link className="ps-link" to="/staff/parkingSpots">
                          View parking spots <IconArrowRight size={15} />
                        </Link>
                      ) : (
                        <small className="dashboard-muted-note">
                          Capacity-based area; no individual spot data is shown.
                        </small>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                {error ? 'Parking area data could not be loaded.' : 'No parking areas available.'}
              </div>
            )}
          </section>

          <section className="ps-surface">
            <div className="ps-surface-head">
              <div>
                <h2>Recent parking activity</h2>
                <p>Latest Check-in and Check-out events</p>
              </div>
              <Link className="ps-link" to="/staff/sessions">
                All sessions <IconArrowRight size={15} />
              </Link>
            </div>
            {isLoading ? (
              <div className="ps-skeleton" style={{ height: 160 }} aria-label="Loading recent activities" />
            ) : recentActivities.length ? (
              <div className="ps-table-wrap">
                <table className="ps-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Ticket</th>
                      <th>Plate number</th>
                      <th>Activity</th>
                      <th>Parking area</th>
                      <th>Staff</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => {
                      const checkIn = isCheckInActivity(activity.activityType)
                      const time = activity.localEventTime || activity.eventTime
                      return (
                        <tr key={`${activity.parkingSessionId}-${activity.activityType}`}>
                          <td>{activity.parkingSessionId}</td>
                          <td><Link to="/staff/sessions">{activity.ticketCode}</Link></td>
                          <td>{activity.plateNumber ?? '—'}</td>
                          <td>{checkIn ? 'Check-in' : 'Check-out'}</td>
                          <td>{activity.parkingAreaName}</td>
                          <td>{activity.staffName ?? '—'}</td>
                          <td>
                            <time dateTime={time}>
                              {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time))}
                            </time>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-empty-state">
                {error ? 'Recent activities could not be loaded.' : 'No recent parking activity.'}
              </div>
            )}
          </section>
        </div>

        {isCheckInFormOpen && (
          <div
            className="staff-checkin-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsCheckInFormOpen(false)
            }}
          >
            <section
              className="staff-checkin-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="staff-checkin-heading"
            >
              <header className="staff-checkin-dialog-header">
                <div>
                  <span>Session workspace</span>
                  <h2 id="staff-checkin-heading">Vehicle Check-in</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckInFormOpen(false)}
                  aria-label="Close check-in form"
                >
                  ×
                </button>
              </header>

              {isCheckInLookupsLoading ? (
                <p className="staff-checkin-state" role="status">Loading check-in options...</p>
              ) : checkInLookupError ? (
                <div className="staff-checkin-error" role="alert">
                  <p>{checkInLookupError}</p>
                  <button type="button" onClick={() => void openCheckInForm()}>Try again</button>
                </div>
              ) : (
                <form className="staff-checkin-form" onSubmit={submitCheckIn}>
                  {isCheckInConfirmationOpen && !checkInSuccessMessage ? (
                    <div className="staff-checkin-confirmation">
                      <p>Please confirm the vehicle and reservation details before checking in.</p>
                      <dl>
                        <div>
                          <dt>License plate</dt>
                          <dd>{checkInPlateNumber.trim()}</dd>
                        </div>
                        <div>
                          <dt>Vehicle type</dt>
                          <dd>{vehicleTypes.find((vehicle) => vehicle.id === selectedCheckInVehicleType)?.label ?? '—'}</dd>
                        </div>
                        {selectedCheckInReservation ? (
                          <>
                            <div>
                              <dt>Reservation</dt>
                              <dd>#{selectedCheckInReservation.id}</dd>
                            </div>
                            <div>
                              <dt>Parking area</dt>
                              <dd>{selectedCheckInReservation.parkingAreaCode}</dd>
                            </div>
                            <div>
                              <dt>Parking spot</dt>
                              <dd>{selectedCheckInReservation.parkingSpotCode ?? 'Capacity-based area'}</dd>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <dt>Parking area</dt>
                              <dd>{checkInParkingAreas.find((area) => area.id === selectedCheckInAreaId)?.name ?? '—'}</dd>
                            </div>
                            <div>
                              <dt>Parking spot</dt>
                              <dd>{checkInParkingSpots.find((spot) => spot.id === selectedCheckInSpotId)?.spotCode ?? '—'}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                      <p className="staff-checkin-confirmation-warning">
                        Verify the vehicle type matches the reservation to avoid an invalid check-in.
                      </p>
                    </div>
                  ) : (
                    <div className="staff-checkin-fields">
                  <label className="staff-checkin-field">
                    Parking area
                    <select
                      value={selectedCheckInAreaId}
                      disabled={Boolean(selectedCheckInReservationId)}
                      onChange={(event) => {
                        setSelectedCheckInAreaId(event.target.value ? Number(event.target.value) : '')
                        setSelectedCheckInSpotId('')
                        setSelectedCheckInReservationId('')
                      }}
                    >
                      <option value="">
                        {checkInParkingAreas.length ? 'Select parking area' : 'No active parking areas'}
                      </option>
                      {checkInParkingAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} ({area.parkingCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="staff-checkin-field">
                    Parking spot
                    <select
                      value={selectedCheckInSpotId}
                      onChange={(event) => {
                        const spotId = event.target.value ? Number(event.target.value) : ''
                        setSelectedCheckInSpotId(spotId)
                        if (selectedCheckInReservation?.parkingSpotId !== spotId) {
                          setSelectedCheckInReservationId('')
                        }
                      }}
                      disabled={Boolean(selectedCheckInReservationId) || !selectedCheckInAreaId || areCheckInSpotsLoading ||
                        checkInParkingAreas.find((area) => area.id === selectedCheckInAreaId)?.parkingMode !== 0}
                    >
                      <option value="">
                        {!selectedCheckInAreaId
                          ? 'Select a parking area first'
                          : checkInParkingAreas.find((area) => area.id === selectedCheckInAreaId)?.parkingMode !== 0
                            ? 'Capacity-based area'
                            : areCheckInSpotsLoading
                              ? 'Loading available spots...'
                                : checkInParkingSpots.length
                                  ? 'Select parking spot'
                                  : 'No available spots'}
                      </option>
                      {checkInParkingSpots.map((spot) => (
                        <option key={spot.id} value={spot.id}>
                          {spot.spotCode}
                        </option>
                      ))}
                      {selectedCheckInReservation?.parkingSpotId &&
                        selectedCheckInReservation.parkingAreaId === selectedCheckInAreaId &&
                        !checkInParkingSpots.some((spot) => spot.id === selectedCheckInReservation.parkingSpotId) && (
                          <option value={selectedCheckInReservation.parkingSpotId}>
                            {selectedCheckInReservation.parkingSpotCode ?? `Spot #${selectedCheckInReservation.parkingSpotId}`} (reserved)
                          </option>
                        )}
                    </select>
                    {checkInSpotsError && <span className="staff-checkin-field-error" role="alert">{checkInSpotsError}</span>}
                  </label>

                  <label className="staff-checkin-field">
                    Reservation
                    <select
                      value={selectedCheckInReservationId}
                      onChange={(event) => {
                        const reservationId = event.target.value ? Number(event.target.value) : ''
                        setSelectedCheckInReservationId(reservationId)
                        const reservation = checkInReservations.find((item) => item.id === reservationId)
                        if (reservation) {
                          setSelectedCheckInAreaId(reservation.parkingAreaId)
                          setSelectedCheckInSpotId(reservation.parkingSpotId ?? '')
                          setSelectedCheckInVehicleType(reservation.vehicleType ?? '')
                        }
                      }}
                    >
                      <option value="">
                        {checkInReservations.length ? 'No reservation' : 'No reserved bookings'}
                      </option>
                      {checkInReservations.map((reservation) => (
                        <option key={reservation.id} value={reservation.id}>
                          #{reservation.id} · {reservation.parkingAreaCode}
                          {reservation.parkingSpotCode ? ` · ${reservation.parkingSpotCode}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="staff-checkin-field">
                    License plate
                    <input
                      type="text"
                      value={checkInPlateNumber}
                      onChange={(event) => setCheckInPlateNumber(event.target.value)}
                      autoComplete="off"
                      maxLength={32}
                      placeholder="Enter license plate"
                    />
                  </label>

                  <label className="staff-checkin-field">
                    Vehicle type
                    <select
                      value={selectedCheckInVehicleType}
                      onChange={(event) => setSelectedCheckInVehicleType(event.target.value ? Number(event.target.value) : '')}
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypes.map((vehicleType) => (
                        <option key={vehicleType.id} value={vehicleType.id}>{vehicleType.label}</option>
                      ))}
                    </select>
                  </label>
                    </div>
                  )}

                  {checkInSubmitError && (
                    <p className="staff-checkin-submit-error" role="alert">{checkInSubmitError}</p>
                  )}
                  {checkInSuccessMessage && (
                    <div className="staff-checkin-success" role="status">
                      <strong>{checkInSuccessMessage}</strong>
                      {checkInTicketCode && <span>Ticket: {checkInTicketCode}</span>}
                    </div>
                  )}
                  <footer className="staff-checkin-actions">
                    {checkInSuccessMessage ? (
                      <button
                        className="ps-btn"
                        type="button"
                        onClick={() => setIsCheckInFormOpen(false)}
                      >
                        Done
                      </button>
                    ) : isCheckInConfirmationOpen ? (
                      <>
                        <button
                          className="ps-btn"
                          type="button"
                          onClick={() => {
                            setIsCheckInConfirmationOpen(false)
                            setCheckInSubmitError('')
                          }}
                          disabled={isCheckInSubmitting}
                        >
                          Back to edit
                        </button>
                        <button
                          className="ps-btn ps-btn-primary"
                          type="button"
                          onClick={() => void confirmCheckIn()}
                          disabled={isCheckInSubmitting}
                        >
                          {isCheckInSubmitting ? 'Checking in...' : 'Confirm Check-in'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="ps-btn"
                          type="button"
                          onClick={() => setIsCheckInFormOpen(false)}
                        >
                          Close
                        </button>
                        <button
                          className="ps-btn ps-btn-primary"
                          type="submit"
                          disabled={areCheckInSpotsLoading}
                        >
                          Review Check-in
                        </button>
                      </>
                    )}
                  </footer>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffHome
