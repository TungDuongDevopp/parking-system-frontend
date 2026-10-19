import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../resources/css/dashboard.scss'
import '../resources/css/customer-profile.scss'
import type { CustomerDto, CustomerRequestUpdate } from '../types/Customer/customer'
import { getMyProfile, updateCustomer } from '../services/customerService'
import { getAbpErrorMessage } from '../services/abpError'

const CustomerProfile = () => {
    const navigate = useNavigate()
    const [profile, setProfile] = useState<CustomerDto | null>(null)
    const [draft, setDraft] = useState<CustomerRequestUpdate | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let isMounted = true

        getMyProfile().then((response) => {
            if (!isMounted) return
            if (!response.success) {
                setErrorMessage(getAbpErrorMessage(response.error, 'Unable to load your profile.'))
                return
            }
            if (!response.result) {
                navigate('/customer/profile/create', { replace: true })
                return
            }
            setProfile(response.result)
        }).catch((error: unknown) => {
            if (isMounted) {
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load your profile.')
            }
        }).finally(() => {
            if (isMounted) setIsLoading(false)
        })

        return () => { isMounted = false }
    }, [navigate])

    const startEditing = () => {
        if (!profile) return
        setDraft({
            id: profile.id,
            name: profile.name,
            phoneNumber: profile.phoneNumber,
            email: profile.email,
        })
        setErrorMessage('')
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setDraft(null)
        setErrorMessage('')
        setIsEditing(false)
    }

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!draft) return
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const updatedProfile = {
                ...draft,
                name: draft.name.trim(),
                phoneNumber: draft.phoneNumber.trim(),
                email: draft.email.trim(),
            }
            const response = await updateCustomer(updatedProfile)
            if (!response.success) {
                setErrorMessage(getAbpErrorMessage(response.error, 'Unable to update your profile.'))
                return
            }

            setProfile((current) => current ? { ...current, ...updatedProfile } : current)
            setDraft(null)
            setIsEditing(false)
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to update your profile.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="customer-page customer-profile-page">
            <header className="customer-profile-header">
                <Link className="customer-profile-brand" to="/customer">
                    <span className="brand-square">P</span>
                    <span>Park<span>ing</span>System</span>
                </Link>
                <Link className="customer-profile-back" to="/customer">Back to parking</Link>
            </header>
            <section className="customer-profile-content">
                <p className="section-kicker">YOUR ACCOUNT</p>
                <h1>Profile</h1>
                {isLoading && <p className="customer-profile-status" role="status">Loading profile...</p>}
                {errorMessage && <p className="customer-profile-error" role="alert">{errorMessage}</p>}
                {profile && !isLoading && (
                    <section className="customer-profile-overview" aria-label="Customer profile details">
                        <div className="customer-profile-identity">
                            <span className="customer-profile-avatar" aria-hidden="true">
                                {(isEditing ? draft?.name : profile.name)?.trim().charAt(0).toUpperCase() || 'C'}
                            </span>
                            <p className="customer-profile-identity-label">CUSTOMER PROFILE</p>
                            <span className="customer-profile-name-label">NAME</span>
                            <h2>{isEditing ? draft?.name : profile.name}</h2>
                            <span className="customer-profile-identity-rule" />
                            <p className="customer-profile-identity-note">Parking System</p>
                        </div>
                        <div className="customer-profile-contact">
                            <div className="customer-profile-contact-heading">
                                <span>01</span>
                                <h2>{isEditing ? 'Edit profile' : 'Contact details'}</h2>
                            </div>
                            {isEditing && draft ? (
                                <form className="customer-profile-form" onSubmit={handleUpdate}>
                                    <label>
                                        <span>Name</span>
                                        <input
                                            autoComplete="name"
                                            value={draft.name}
                                            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span>Phone number</span>
                                        <input
                                            type="tel"
                                            autoComplete="tel"
                                            value={draft.phoneNumber}
                                            onChange={(event) => setDraft({ ...draft, phoneNumber: event.target.value })}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={draft.email}
                                            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                                            required
                                        />
                                    </label>
                                    <div className="customer-profile-actions">
                                        <button className="customer-profile-submit" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save changes'}
                                        </button>
                                        <button className="customer-profile-cancel" type="button" onClick={cancelEditing} disabled={isSubmitting}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <dl className="customer-profile-details">
                                        <div>
                                            <span className="customer-profile-field-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><path d="M6.6 3.8h2.8l1.4 4-1.8 1.6a15 15 0 0 0 5.6 5.6l1.6-1.8 4 1.4v2.8a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z" /></svg>
                                            </span>
                                            <dt>Phone number</dt>
                                            <dd>{profile.phoneNumber}</dd>
                                        </div>
                                        <div>
                                            <span className="customer-profile-field-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
                                            </span>
                                            <dt>Email</dt>
                                            <dd>{profile.email}</dd>
                                        </div>
                                    </dl>
                                    <button className="customer-profile-submit" type="button" onClick={startEditing}>
                                        Change profile
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                )}
            </section>
        </main>
    )
}

export default CustomerProfile
