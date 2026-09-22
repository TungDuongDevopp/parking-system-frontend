import { useEffect, useState } from 'react'
import '../resources/css/dashboard.css'
import { getUserName } from '../services/authService'

const CustomerHome = () => {
    const [displayName, setDisplayName] = useState('Customer')

    useEffect(() => {
        let isMounted = true
        getUserName().then((name) => {
            if (isMounted && name) setDisplayName(name)
        }).catch(() => undefined)
        return () => { isMounted = false }
    }, [])

    const handleSignOut = () => {
        localStorage.removeItem('accessToken')
        sessionStorage.clear()
        window.location.href = '/login'
    }

    return (
    <main className="customer-page">
        <nav className="customer-nav">
            <a className="workspace-brand" href="/">
                <span className="brand-square">P</span>
                <span>
                    Park<span>ing</span>System
                </span>
            </a>

            <div className="main-links">
                <a className="active" href="/customer">Find parking</a>
                <a href="#bookings">My bookings</a>
                <a href="#history">History</a>
            </div>

            <div className="customer-actions">
                <span>Hi, {displayName}</span>
                <details className="account-dropdown customer-account">
                    <summary className="customer-account-trigger">
                        <span className="customer-menu-button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 8h14M5 12h14M5 16h14" />
                            </svg>
                            <span className="customer-menu-dot" />
                        </span>
                    </summary>
                    <div className="account-menu">
                        <button type="button"><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 19.5c.6-3.1 2.8-5 6.5-5s5.9 1.9 6.5 5" /></svg></span>Profile</button>
                        <button type="button"><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg></span><span className="account-menu-label">Notifications</span><b className="menu-badge">2</b></button>
                        <button type="button"><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1.4Z" /></svg></span>Account settings</button>
                        <button type="button"><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.1 1.7c-1.2 1.1-1.8 1.4-1.8 2.8M12 17h.01" /></svg></span>Help Center</button>
                        <div className="account-menu-divider" />
                        <button type="button" onClick={() => { window.location.href = '/change-password' }}><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5a4 4 0 0 0-5.2 5.2L4 16v3h3v-2h2v-2h2.2l2.1-2.1a4 4 0 0 0 1.2-7.4ZM17 4l3 3m-1.5-1.5 1.5-1.5" /></svg></span>Change password</button>
                        <button type="button" onClick={handleSignOut}><span className="account-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10M14 8l4 4-4 4M18 12H9" /></svg></span>Logout</button>
                    </div>
                </details>
            </div>
        </nav>

        <section className="customer-hero">
            <div>
                <p className="section-kicker">SMART PARKING, MADE SIMPLE</p>
                <h1>
                    Find your spot.
                    <br />
                    <span>Keep moving.</span>
                </h1>
                <p>
                    Discover convenient parking spaces near you, reserve in advance,
                    and arrive without the stress.
                </p>
                <a className="hero-button" href="#find-parking">
                    Find a parking spot →
                </a>
            </div>

            <div className="parking-illustration" aria-label="Illustration of a parking garage">
                <div className="illustration-building">
                    PARKING
                    <br />
                    CENTER
                </div>
                <div className="car" />
            </div>
        </section>

        <section className="customer-content">
            <h2>Popular nearby parking</h2>
            <div className="customer-cards">
                <article className="parking-card">
                    <div className="parking-card-top">
                        <h3>Central Plaza</h3>
                        <span className="tag">Open</span>
                    </div>
                    <p>120 Nguyen Hue · 0.4 km away</p>
                    <strong>From $2.50 / hour</strong>
                    <button type="button">View details</button>
                </article>

                <article className="parking-card">
                    <div className="parking-card-top">
                        <h3>Riverside Mall</h3>
                        <span className="tag">Open</span>
                    </div>
                    <p>18 Ton Duc Thang · 1.2 km away</p>
                    <strong>From $1.80 / hour</strong>
                    <button type="button">View details</button>
                </article>

                <article className="parking-card">
                    <div className="parking-card-top">
                        <h3>Opera House Garage</h3>
                        <span className="tag busy">Filling up</span>
                    </div>
                    <p>7 Lam Son · 1.8 km away</p>
                    <strong>From $3.00 / hour</strong>
                    <button type="button">View details</button>
                </article>
            </div>
        </section>
    </main>
    )
}

export default CustomerHome;