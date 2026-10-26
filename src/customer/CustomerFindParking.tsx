import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconAdjustments, IconSearch } from '@tabler/icons-react'
import Header from '../components/homePage/Header'
import Footer from '../components/homePage/Footer'
import { getAvailableParkingAreas } from '../services/parkingAreaService'
import { getParkingSpots } from '../services/parkingSpotService'
import { createReservation } from '../services/reservationService'
import type { ParkingAreaLookupDto } from '../types/ParkingArea/parkingArea'
import type { ParkingSpotDto } from '../types/ParkingSpot/parkingSpot'
import '../resources/css/homepage.scss'

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)
const toLocalDateTimeInput = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return localDate.toISOString().slice(0, 16)
}
const getNextLocalMinute = () => toLocalDateTimeInput(new Date(Math.ceil(Date.now() / 60_000) * 60_000))
const getLocalDayBounds = () => {
    const nextMinute = getNextLocalMinute()
    const today = toLocalDateTimeInput(new Date()).slice(0, 10)
    return {
        min: nextMinute,
        max: `${today}T23:59`,
        today,
        canBookToday: nextMinute.slice(0, 10) === today,
    }
}

type BookingSelection = {
    areaId: number
    spotId: number | null
}

const CustomerFindParking = () => {
    const [parkingAreas, setParkingAreas] = useState<ParkingAreaLookupDto[]>([])
    const [parkingSpots, setParkingSpots] = useState<Record<number, ParkingSpotDto[]>>({})
    const [expandedAreaId, setExpandedAreaId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingSpotsAreaId, setLoadingSpotsAreaId] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [spotsError, setSpotsError] = useState('')
    const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null)
    const [bookingDateTime, setBookingDateTime] = useState(getNextLocalMinute)
    const [bookingError, setBookingError] = useState('')
    const [bookingSubmitting, setBookingSubmitting] = useState(false)
    const [reservationMessages, setReservationMessages] = useState<Record<number, string>>({})
    const dateBounds = getLocalDayBounds()

    const loadAreas = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage('')
        try {
            setParkingAreas(await getAvailableParkingAreas())
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to load parking areas.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadAreas()
    }, [loadAreas])

    const visibleAreas = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()
        return parkingAreas.filter((area) =>
            area.status === 1 &&
            (!selectedVehicle || area.vehicleType.toString() === selectedVehicle) &&
            (!normalizedSearch ||
                area.name.toLocaleLowerCase().includes(normalizedSearch) ||
                area.parkingCode.toLocaleLowerCase().includes(normalizedSearch)),
        )
    }, [parkingAreas, search, selectedVehicle])

    const loadAreaSpots = useCallback(async (areaId: number) => {
        setLoadingSpotsAreaId(areaId)
        setSpotsError('')
        try {
            const pageSize = 100
            const firstPage = await getParkingSpots({
                parkingAreaId: areaId,
                skipCount: 0,
                maxResultCount: pageSize,
            })
            const allSpots = [...firstPage.items]
            for (let skipCount = pageSize; skipCount < firstPage.totalCount; skipCount += pageSize) {
                const page = await getParkingSpots({
                    parkingAreaId: areaId,
                    skipCount,
                    maxResultCount: pageSize,
                })
                if (!page.items.length) {
                    throw new Error('Unable to load all parking spots for this area.')
                }
                allSpots.push(...page.items)
            }
            setParkingSpots((current) => ({ ...current, [areaId]: allSpots }))
            return true
        } catch (error) {
            setSpotsError(error instanceof Error ? error.message : 'Unable to load parking spots.')
            return false
        } finally {
            setLoadingSpotsAreaId(null)
        }
    }, [])

    const toggleAreaSpots = async (area: ParkingAreaLookupDto) => {
        if (expandedAreaId === area.id) {
            setExpandedAreaId(null)
            return
        }

        setExpandedAreaId(area.id)
        if (parkingSpots[area.id]) return

        await loadAreaSpots(area.id)
    }

    const openBooking = (areaId: number, spotId: number | null = null) => {
        setBookingSelection({ areaId, spotId })
        setBookingDateTime(getNextLocalMinute())
        setBookingError('')
        setReservationMessages((messages) => ({ ...messages, [areaId]: '' }))
    }

    const submitBooking = async (area: ParkingAreaLookupDto) => {
        const selection = bookingSelection
        if (!selection || selection.areaId !== area.id) return
        setBookingError('')
        const selectedDate = new Date(bookingDateTime)
        if (!bookingDateTime || Number.isNaN(selectedDate.getTime())) {
            setBookingError('Select a valid reservation date and time.')
            return
        }
        if (bookingDateTime.slice(0, 10) !== dateBounds.today) {
            setBookingError('Reservations can only be made for today.')
            return
        }
        if (selectedDate.getTime() < Date.now()) {
            setBookingError('Select a future time today.')
            return
        }

        setBookingSubmitting(true)
        try {
            await createReservation({
                parkingAreaId: area.id,
                ...(selection.spotId === null ? {} : { ParkingSpotId: selection.spotId }),
                reservedAt: selectedDate.toISOString(),
            })
            setBookingSelection(null)
            setReservationMessages((messages) => ({
                ...messages,
                [area.id]: 'Reservation created successfully.',
            }))
            await loadAreas()
            if (area.parkingMode === 0 && parkingSpots[area.id]) {
                await loadAreaSpots(area.id)
            }
        } catch (error) {
            setBookingError(error instanceof Error ? error.message : 'Unable to create reservation.')
        } finally {
            setBookingSubmitting(false)
        }
    }

    return (
        <div className="homepage">
            <Header />
            <main className="homepage-main find-parking-page">
                <section className="find-parking-content" aria-labelledby="find-parking-heading">
                    <header className="find-parking-heading">
                        <h1 id="find-parking-heading">Find Your Parking</h1>
                        <p>Explore parking areas and check available spaces.</p>
                    </header>

                    <div className="find-parking-toolbar">
                        <label className="find-parking-search">
                            <IconSearch size={19} aria-hidden="true" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search parking areas..."
                                aria-label="Search parking areas"
                            />
                        </label>
                        <button
                            className={`find-parking-filter-button${isFilterOpen ? ' is-active' : ''}`}
                            type="button"
                            aria-label="Toggle parking filters"
                            aria-expanded={isFilterOpen}
                            onClick={() => setIsFilterOpen((open) => !open)}
                        >
                            <IconAdjustments size={21} aria-hidden="true" />
                        </button>
                    </div>

                    {isFilterOpen && (
                        <label className="find-parking-filter">
                            Vehicle type
                            <select
                                value={selectedVehicle}
                                onChange={(event) => setSelectedVehicle(event.target.value)}
                            >
                                <option value="">All vehicles</option>
                                <option value="1">Bicycle</option>
                                <option value="2">Electric Bicycle</option>
                                <option value="3">Motorcycle</option>
                                <option value="4">Electric Motorcycle</option>
                                <option value="5">Car</option>
                            </select>
                        </label>
                    )}

                    {isLoading ? (
                        <p className="find-parking-status" role="status">Loading parking areas...</p>
                    ) : errorMessage ? (
                        <div className="find-parking-status find-parking-error" role="alert">
                            <p>{errorMessage}</p>
                            <button type="button" onClick={() => void loadAreas()}>Try again</button>
                        </div>
                    ) : visibleAreas.length ? (
                        <div className="find-parking-grid">
                            {visibleAreas.map((area) => {
                                const available = Math.max(0, area.availableCapacity)
                                const capacity = Math.max(0, area.capacity)
                                const unavailable = Math.max(0, capacity - available)
                                const unavailablePercent = capacity
                                    ? Math.min(100, (unavailable / capacity) * 100)
                                    : 0
                                const isIndividual = area.parkingMode === 0
                                const isExpanded = expandedAreaId === area.id
                                const isBookingThisArea = bookingSelection?.areaId === area.id

                                const bookingForm = isBookingThisArea ? (
                                    <form
                                        className="find-parking-booking-form"
                                        onSubmit={(event) => {
                                            event.preventDefault()
                                            void submitBooking(area)
                                        }}
                                    >
                                        <label>
                                            Reservation time (today)
                                            <input
                                                type="datetime-local"
                                                value={bookingDateTime}
                                                min={dateBounds.min}
                                                max={dateBounds.max}
                                                onChange={(event) => {
                                                    setBookingDateTime(event.target.value)
                                                    setBookingError('')
                                                }}
                                                required
                                            />
                                        </label>
                                        {!dateBounds.canBookToday && (
                                            <p role="alert">No future reservation times remain today.</p>
                                        )}
                                        {bookingError && <p role="alert">{bookingError}</p>}
                                        <div className="find-parking-booking-actions">
                                            <button type="submit" disabled={bookingSubmitting || !dateBounds.canBookToday}>
                                                {bookingSubmitting ? 'Reserving...' : 'Confirm reservation'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBookingSelection(null)
                                                    setBookingError('')
                                                }}
                                                disabled={bookingSubmitting}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : null

                                return (
                                    <article className="find-parking-card" key={area.id}>
                                        <div className="find-parking-card-heading">
                                            <h2>{area.name}</h2>
                                            <span className="find-parking-availability-badge">
                                                {available > 0 ? 'Available' : 'Full'}
                                            </span>
                                        </div>
                                        <p className="find-parking-mode">
                                            {isIndividual ? 'Individual Spot' : 'Capacity Based'}
                                        </p>

                                        {isIndividual ? (
                                            <>
                                                <div className="find-parking-individual-summary">
                                                    <strong>{formatNumber(available)} / {formatNumber(capacity)}</strong>
                                                    <span>Available spaces</span>
                                                </div>
                                                <button
                                                    className="find-parking-card-button"
                                                    type="button"
                                                    aria-expanded={isExpanded}
                                                    onClick={() => void toggleAreaSpots(area)}
                                                >
                                                    {isExpanded ? 'Hide Spots' : 'View Spots'}
                                                </button>
                                                {isExpanded && (
                                                    <div className="find-parking-spots">
                                                        {bookingForm}
                                                        {loadingSpotsAreaId === area.id ? (
                                                            <p role="status">Loading spots...</p>
                                                        ) : spotsError ? (
                                                            <p className="find-parking-inline-error" role="alert">{spotsError}</p>
                                                        ) : (
                                                            <>
                                                                <div className="find-parking-spot-legend">
                                                                    <span><i className="available" />Available</span>
                                                                    <span><i className="reserved" />Reserved</span>
                                                                    <span><i className="occupied" />Occupied</span>
                                                                    <span><i className="unavailable" />Unavailable</span>
                                                                </div>
                                                                <div className="find-parking-spot-grid">
                                                                    {(parkingSpots[area.id] ?? []).map((spot) => (
                                                                        spot.status === 1 ? (
                                                                            <button
                                                                                className="find-parking-spot status-1"
                                                                                key={spot.id}
                                                                                type="button"
                                                                                title="Click to reserve this spot"
                                                                                aria-label={`Reserve ${spot.spotCode}`}
                                                                                onClick={() => openBooking(area.id, spot.id)}
                                                                            >
                                                                                <span>{spot.spotCode.split('-').at(-1)}</span>
                                                                                <span className="find-parking-spot-tooltip">Click to reserve</span>
                                                                            </button>
                                                                        ) : (
                                                                            <span
                                                                                className={`find-parking-spot status-${spot.status}`}
                                                                                key={spot.id}
                                                                                title={`${spot.spotCode} · ${spot.parkingSpotStatusName}`}
                                                                            >
                                                                                {spot.spotCode.split('-').at(-1)}
                                                                            </span>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="find-parking-capacity">
                                                <div className="find-parking-capacity-heading">
                                                    <strong>{formatNumber(available)} / {formatNumber(capacity)} available</strong>
                                                </div>
                                                <div
                                                    className="find-parking-capacity-track"
                                                    role="progressbar"
                                                    aria-label={`Unavailable capacity at ${area.name}`}
                                                    aria-valuemin={0}
                                                    aria-valuemax={Math.max(1, capacity)}
                                                    aria-valuenow={unavailable}
                                                >
                                                    <span style={{ width: `${unavailablePercent}%` }} />
                                                </div>
                                                <p>{formatNumber(unavailable)} spaces currently unavailable</p>
                                            </div>
                                        )}
                                        {!isIndividual && available > 0 && (
                                            <button
                                                className="find-parking-card-button find-parking-reserve-button"
                                                type="button"
                                                onClick={() => openBooking(area.id)}
                                            >
                                                Reserve Now
                                            </button>
                                        )}
                                        {!isIndividual && bookingForm}
                                        {reservationMessages[area.id] && (
                                            <div className="find-parking-booking-success" role="status">
                                                <p>{reservationMessages[area.id]}</p>
                                                <Link to="/customer/reservations">View My Reservations</Link>
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="find-parking-status">
                            No active parking areas match your search.
                        </p>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default CustomerFindParking
