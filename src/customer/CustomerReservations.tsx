import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { IconChevronLeft, IconChevronRight, IconRefresh, IconSearch, IconX } from '@tabler/icons-react'
import Header from '../components/homePage/Header'
import Footer from '../components/homePage/Footer'
import { cancelReservation, getReservationById, getReservations } from '../services/reservationService'
import type { ReservationDto } from '../types/Reservation/reservation'
import '../resources/css/homepage.scss'

const pageSize = 10
const statusOptions = [
    { value: 1, label: 'Reserved' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Cancelled' },
    { value: 4, label: 'Expired' },
    { value: 5, label: 'Invalid' },
]

const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value || '—'
    return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const getStatusClass = (reservation: ReservationDto) => {
    const status = String(reservation.status || reservation.reservationStatusName || '').trim().toLowerCase()
    if (status === '1' || status.includes('reserv')) return 'reserved'
    if (status === '2' || status.includes('complet')) return 'completed'
    if (status === '3' || status.includes('cancel')) return 'cancelled'
    if (status === '4' || status.includes('expir')) return 'expired'
    if (status === '5' || status.includes('invalid')) return 'invalid'
    return 'default'
}

const isReservationReserved = (reservation: ReservationDto) => {
    const status = String(reservation.status ?? reservation.reservationStatusName ?? '').trim().toLowerCase()
    return status === '1' || status === 'reserved'
}

const CustomerReservations = () => {
    const [reservations, setReservations] = useState<ReservationDto[]>([])
    const [keywordInput, setKeywordInput] = useState('')
    const [keyword, setKeyword] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null)
    const [isDetailsLoading, setIsDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState('')
    const [cancellingReservationId, setCancellingReservationId] = useState<number | null>(null)
    const [cancellationErrors, setCancellationErrors] = useState<Record<number, string>>({})
    const listRequestId = useRef(0)
    const detailsRequestId = useRef(0)

    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
    const displayedPage = Math.min(page, pageCount)
    const firstItem = totalCount === 0 ? 0 : (displayedPage - 1) * pageSize + 1
    const lastItem = Math.min(displayedPage * pageSize, totalCount)

    const loadReservations = useCallback(async () => {
        const requestId = ++listRequestId.current
        setIsLoading(true)
        setErrorMessage('')
        try {
            const result = await getReservations({
                skipCount: (displayedPage - 1) * pageSize,
                maxResultCount: pageSize,
                keyword: keyword || undefined,
                status: selectedStatus ? Number(selectedStatus) : undefined,
            })
            if (requestId === listRequestId.current) {
                setReservations(result.items)
                setTotalCount(result.totalCount)
            }
        } catch (error) {
            if (requestId === listRequestId.current) {
                setReservations([])
                setTotalCount(0)
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load reservations.')
            }
        } finally {
            if (requestId === listRequestId.current) setIsLoading(false)
        }
    }, [displayedPage, keyword, selectedStatus])

    useEffect(() => {
        void loadReservations()
        return () => {
            listRequestId.current += 1
        }
    }, [loadReservations])

    useEffect(() => {
        if (page !== displayedPage) setPage(displayedPage)
    }, [displayedPage, page])

    const applySearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setPage(1)
        setKeyword(keywordInput.trim())
    }

    const chooseStatus = (value: string) => {
        setSelectedStatus(value)
        setPage(1)
    }

    const openDetails = async (id: number) => {
        const requestId = ++detailsRequestId.current
        setSelectedReservation(null)
        setDetailsError('')
        setIsDetailsLoading(true)
        try {
            const reservation = await getReservationById(id)
            if (requestId === detailsRequestId.current) setSelectedReservation(reservation)
        } catch (error) {
            if (requestId === detailsRequestId.current) {
                setDetailsError(error instanceof Error ? error.message : 'Unable to load reservation details.')
            }
        } finally {
            if (requestId === detailsRequestId.current) setIsDetailsLoading(false)
        }
    }

    const closeDetails = () => {
        detailsRequestId.current += 1
        setSelectedReservation(null)
        setDetailsError('')
        setIsDetailsLoading(false)
    }

    const cancelBooking = async (reservation: ReservationDto) => {
        if (!isReservationReserved(reservation) || cancellingReservationId !== null) return
        if (!window.confirm(`Cancel reservation #${reservation.id}?`)) return

        setCancellingReservationId(reservation.id)
        setCancellationErrors((errors) => ({ ...errors, [reservation.id]: '' }))
        try {
            const updatedReservation = await cancelReservation(reservation.id)
            setSelectedReservation((current) =>
                current?.id === reservation.id ? updatedReservation : current,
            )
            await loadReservations()
        } catch (error) {
            setCancellationErrors((errors) => ({
                ...errors,
                [reservation.id]: error instanceof Error ? error.message : 'Unable to cancel reservation.',
            }))
        } finally {
            setCancellingReservationId(null)
        }
    }

    return (
        <div className="homepage">
            <Header />
            <main className="homepage-main customer-reservations-page">
                <section className="customer-reservations-content" aria-labelledby="reservations-heading">
                    <header className="customer-reservations-heading">
                        <div>
                            <span className="customer-reservations-eyebrow">Your activity</span>
                            <h1 id="reservations-heading">My Reservations</h1>
                            <p>Review and manage your parking reservation history.</p>
                        </div>
                        <button
                            className="customer-reservations-refresh"
                            type="button"
                            onClick={() => void loadReservations()}
                            disabled={isLoading}
                        >
                            <IconRefresh size={17} aria-hidden="true" />
                            Refresh
                        </button>
                    </header>

                    <div className="customer-reservations-toolbar">
                        <form className="customer-reservations-search" onSubmit={applySearch}>
                            <IconSearch size={19} aria-hidden="true" />
                            <input
                                type="search"
                                value={keywordInput}
                                onChange={(event) => setKeywordInput(event.target.value)}
                                placeholder="Search reservations..."
                                aria-label="Search reservations"
                            />
                            <button type="submit">Search</button>
                        </form>
                    </div>

                    <div className="customer-reservations-filters" role="group" aria-label="Filter reservations by status">
                        <button
                            className={!selectedStatus ? 'is-active' : ''}
                            type="button"
                            onClick={() => chooseStatus('')}
                            aria-pressed={!selectedStatus}
                        >
                            All
                        </button>
                        {statusOptions.map((status) => (
                            <button
                                className={selectedStatus === String(status.value) ? 'is-active' : ''}
                                type="button"
                                key={status.value}
                                onClick={() => chooseStatus(String(status.value))}
                                aria-pressed={selectedStatus === String(status.value)}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="customer-reservations-state" role="status">Loading reservations...</div>
                    ) : errorMessage ? (
                        <div className="customer-reservations-state customer-reservations-error" role="alert">
                            <p>{errorMessage}</p>
                            <button type="button" onClick={() => void loadReservations()}>Try again</button>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="customer-reservations-empty">
                            <h2>No reservations found</h2>
                            <p>
                                {keyword || selectedStatus
                                    ? 'Try changing your search or status filter.'
                                    : 'Reservations you make will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="customer-reservation-list">
                            {reservations.map((reservation) => (
                                <article className="customer-reservation-card" key={reservation.id}>
                                    <div className="customer-reservation-card-heading">
                                        <div>
                                            <h2>{reservation.parkingAreaCode || 'Parking area'}</h2>
                                            <p>Reservation #{reservation.id}</p>
                                        </div>
                                        <span className={`customer-reservation-status ${getStatusClass(reservation)}`}>
                                            {reservation.reservationStatusName || reservation.status}
                                        </span>
                                    </div>
                                    <footer className="customer-reservation-card-footer">
                                        {isReservationReserved(reservation) && (
                                            <button
                                                className="customer-reservation-cancel"
                                                type="button"
                                                onClick={() => void cancelBooking(reservation)}
                                                disabled={cancellingReservationId !== null}
                                            >
                                                {cancellingReservationId === reservation.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                        <button type="button" onClick={() => void openDetails(reservation.id)}>
                                            View Details
                                        </button>
                                    </footer>
                                    {cancellationErrors[reservation.id] && (
                                        <p className="customer-reservation-cancel-error" role="alert">
                                            {cancellationErrors[reservation.id]}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}

                    {!isLoading && !errorMessage && totalCount > 0 && (
                        <nav className="customer-reservations-pagination" aria-label="Reservation pages">
                            <span>{firstItem}–{lastItem} of {totalCount}</span>
                            <div>
                                <button
                                    type="button"
                                    aria-label="Previous page"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={displayedPage <= 1}
                                >
                                    <IconChevronLeft size={17} aria-hidden="true" />
                                </button>
                                <span>Page {displayedPage} of {pageCount}</span>
                                <button
                                    type="button"
                                    aria-label="Next page"
                                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                                    disabled={displayedPage >= pageCount}
                                >
                                    <IconChevronRight size={17} aria-hidden="true" />
                                </button>
                            </div>
                        </nav>
                    )}
                </section>

            {(isDetailsLoading || detailsError || selectedReservation) && (
                <div
                    className="customer-reservation-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeDetails()
                    }}
                >
                    <section
                        className="customer-reservation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reservation-detail-heading"
                    >
                        <header>
                            <div>
                                <span>Reservation details</span>
                                <h2 id="reservation-detail-heading">
                                    {selectedReservation ? `Reservation #${selectedReservation.id}` : 'Details'}
                                </h2>
                            </div>
                            <button type="button" onClick={closeDetails} aria-label="Close details">
                                <IconX size={20} aria-hidden="true" />
                            </button>
                        </header>
                        {isDetailsLoading ? (
                            <p className="customer-reservation-modal-state" role="status">Loading reservation details...</p>
                        ) : detailsError ? (
                            <p className="customer-reservation-modal-error" role="alert">{detailsError}</p>
                        ) : selectedReservation ? (
                            <dl className="customer-reservation-detail-list">
                                <div><dt>Status</dt><dd>{selectedReservation.reservationStatusName || selectedReservation.status}</dd></div>
                                <div>
                                    <dt>Parking area</dt>
                                    <dd>
                                        {selectedReservation.parkingAreaName
                                            ? `${selectedReservation.parkingAreaName} (${selectedReservation.parkingAreaCode})`
                                            : selectedReservation.parkingAreaCode || '—'}
                                    </dd>
                                </div>
                                <div><dt>Parking spot</dt><dd>{selectedReservation.parkingSpotCode || 'Capacity Based'}</dd></div>
                                <div><dt>Reservation time</dt><dd>{formatDateTime(selectedReservation.reservedAt)}</dd></div>
                                <div><dt>End time</dt><dd>{formatDateTime(selectedReservation.endTime)}</dd></div>
                                <div><dt>Vehicle</dt><dd>{selectedReservation.vehicleTypeName || '—'}</dd></div>
                                <div><dt>Contact phone</dt><dd>{selectedReservation.contactPhone || '—'}</dd></div>
                            </dl>
                        ) : null}
                    </section>
                </div>
            )}
            </main>
            <Footer />
        </div>
    )
}

export default CustomerReservations
