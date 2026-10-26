import { useCallback, useEffect, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react'
import Header from '../components/homePage/Header'
import Footer from '../components/homePage/Footer'
import { getSubscriptions } from '../services/subscriptionService'
import type { SubscriptionDto } from '../types/Subscription/subscription'
import '../resources/css/homepage.scss'

const pageSize = 10
const statusOptions = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'In Use' },
    { value: 2, label: 'Expired' },
    { value: 3, label: 'Canceled' },
]

const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value || '—'
    return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const getStatusClass = (status: number) => {
    if (status === 0) return 'pending'
    if (status === 1) return 'in-use'
    if (status === 2) return 'expired'
    if (status === 3) return 'canceled'
    return 'default'
}

const CustomerSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([])
    const [statusFilter, setStatusFilter] = useState<number | undefined>()
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
    const displayedPage = Math.min(page, pageCount)

    const loadSubscriptions = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage('')
        try {
            const result = await getSubscriptions({
                skipCount: (displayedPage - 1) * pageSize,
                maxResultCount: pageSize,
                status: statusFilter,
            })
            setSubscriptions(result.items)
            setTotalCount(result.totalCount)
        } catch (error) {
            setSubscriptions([])
            setTotalCount(0)
            setErrorMessage(error instanceof Error ? error.message : 'Unable to load subscriptions.')
        } finally {
            setIsLoading(false)
        }
    }, [displayedPage, statusFilter])

    useEffect(() => {
        void loadSubscriptions()
    }, [loadSubscriptions])

    useEffect(() => {
        if (page > pageCount) setPage(pageCount)
    }, [page, pageCount])

    return (
        <div className="homepage">
            <Header />
            <main className="homepage-main customer-subscriptions-page">
                <section className="customer-subscriptions-content" aria-labelledby="subscriptions-heading">
                    <header className="customer-subscriptions-heading">
                        <div>
                            <span>YOUR ACCOUNT</span>
                            <h1 id="subscriptions-heading">My Subscriptions</h1>
                            <p>View the status and term of your parking subscriptions.</p>
                        </div>
                        <button
                            type="button"
                            className="customer-subscriptions-refresh"
                            onClick={() => void loadSubscriptions()}
                            disabled={isLoading}
                        >
                            <IconRefresh size={17} aria-hidden="true" />
                            Refresh
                        </button>
                    </header>

                    <div className="customer-subscriptions-filters" role="group" aria-label="Filter subscriptions by status">
                        <button
                            type="button"
                            className={statusFilter === undefined ? 'is-active' : ''}
                            aria-pressed={statusFilter === undefined}
                            onClick={() => {
                                setStatusFilter(undefined)
                                setPage(1)
                            }}
                        >
                            All
                        </button>
                        {statusOptions.map((status) => (
                            <button
                                type="button"
                                key={status.value}
                                className={statusFilter === status.value ? 'is-active' : ''}
                                aria-pressed={statusFilter === status.value}
                                onClick={() => {
                                    setStatusFilter(status.value)
                                    setPage(1)
                                }}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="customer-subscriptions-state" role="status">Loading subscriptions...</div>
                    ) : errorMessage ? (
                        <div className="customer-subscriptions-state customer-subscriptions-error" role="alert">
                            <p>{errorMessage}</p>
                            <button type="button" onClick={() => void loadSubscriptions()}>Try again</button>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="customer-subscriptions-state">
                            <h2>No subscriptions found</h2>
                            <p>Subscriptions you create will appear here.</p>
                        </div>
                    ) : (
                        <div className="customer-subscription-list">
                            {subscriptions.map((subscription) => (
                                <article className="customer-subscription-card" key={subscription.id}>
                                    <header>
                                        <div>
                                            <h2>{subscription.vehicleTypeName} parking</h2>
                                            <p>Subscription #{subscription.id}</p>
                                        </div>
                                        <span className={`customer-subscription-status ${getStatusClass(subscription.status)}`}>
                                            {subscription.subscriptionStatusName || 'Unknown'}
                                        </span>
                                    </header>
                                    <dl>
                                        <div>
                                            <dt>Plan</dt>
                                            <dd>{subscription.duration} {subscription.durationUnitName}</dd>
                                        </div>
                                        <div>
                                            <dt>Start time</dt>
                                            <dd>{formatDateTime(subscription.startTime)}</dd>
                                        </div>
                                        <div>
                                            <dt>End time</dt>
                                            <dd>{formatDateTime(subscription.endTime)}</dd>
                                        </div>
                                        <div>
                                            <dt>Price</dt>
                                            <dd>{new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                                maximumFractionDigits: 0,
                                            }).format(subscription.price)}</dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    )}

                    {!isLoading && !errorMessage && totalCount > 0 && (
                        <nav className="customer-subscriptions-pagination" aria-label="Subscription pages">
                            <span>{(displayedPage - 1) * pageSize + 1}–{Math.min(displayedPage * pageSize, totalCount)} of {totalCount}</span>
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
            </main>
            <Footer />
        </div>
    )
}

export default CustomerSubscriptions
