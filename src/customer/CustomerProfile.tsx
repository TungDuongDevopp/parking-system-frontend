import { useEffect, useState, type FormEvent } from 'react'
import '../resources/css/dashboard.scss'
import '../resources/css/customer-profile.scss'
import '../resources/css/homepage.scss'
import '../resources/css/customer-portal.scss'
import Header from '../components/homePage/Header'
import Footer from '../components/homePage/Footer'
import type { CustomerDto, CustomerRequestUpdate } from '../types/Customer/customer'
import { getMyProfile, updateCustomer } from '../services/customerService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'

type CustomerProfileDraft = {
    name: string
    phoneNumber: string
    email: string
}

type CustomerProfileField = keyof CustomerProfileDraft
type CustomerProfileFieldErrors = FieldErrors<CustomerProfileField>

const matchesSubmittedProfile = (profile: CustomerDto, changes: CustomerRequestUpdate) =>
    (changes.name === undefined || profile.name.trim() === changes.name) &&
    (changes.phoneNumber === undefined || (profile.phoneNumber ?? '').trim() === (changes.phoneNumber ?? '').trim()) &&
    (changes.email === undefined || profile.email.trim() === changes.email)

const customerFieldAliases = {
    name: ['name'],
    phoneNumber: ['phone', 'phoneNumber'],
    email: ['email'],
} as const

const mapServerErrorsToFields = (error: Parameters<typeof mapAbpFieldErrors>[0]) =>
    mapAbpFieldErrors(error, customerFieldAliases)

const CustomerProfile = () => {
    const [profile, setProfile] = useState<CustomerDto | null>(null)
    const [draft, setDraft] = useState<CustomerProfileDraft | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState<CustomerProfileFieldErrors>({})
    const [formError, setFormError] = useState('')

    useEffect(() => {
        let isMounted = true

        getMyProfile().then((result) => {
            if (!isMounted) return
            if (!result) {
                setErrorMessage('Your profile is unavailable. Please contact an administrator.')
                return
            }
            setProfile(result)
        }).catch((error: unknown) => {
            if (isMounted) {
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load your profile.')
            }
        }).finally(() => {
            if (isMounted) setIsLoading(false)
        })

        return () => { isMounted = false }
    }, [])

    const startEditing = () => {
        if (!profile) return
        setDraft({
            name: profile.name,
            phoneNumber: profile.phoneNumber ?? '',
            email: profile.email,
        })
        setFieldErrors({})
        setFormError('')
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setDraft(null)
        setFieldErrors({})
        setFormError('')
        setIsEditing(false)
    }

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!draft || !profile) return
        setFieldErrors({})
        setFormError('')

        try {
            const name = draft.name.trim()
            const phoneNumber = draft.phoneNumber.trim()
            const email = draft.email.trim()

            const validationErrors: CustomerProfileFieldErrors = {}
            if (!name) validationErrors.name = 'Name is required.'
            if (!email) validationErrors.email = 'Email is required.'
            if (Object.keys(validationErrors).length) {
                setFieldErrors(validationErrors)
                return
            }

            const changes: CustomerRequestUpdate = { id: profile.id }
            if (name !== profile.name.trim()) changes.name = name
            if (phoneNumber !== (profile.phoneNumber ?? '').trim()) changes.phoneNumber = phoneNumber || null
            if (email !== profile.email.trim()) changes.email = email

            if (Object.keys(changes).length === 1) {
                setDraft(null)
                setIsEditing(false)
                return
            }

            setIsSubmitting(true)
            const updatedProfile = await updateCustomer(changes)
            setProfile(updatedProfile)
            if (!matchesSubmittedProfile(updatedProfile, changes)) {
                setFormError('The server did not save all profile changes. Please try again or contact an administrator.')
                return
            }

            setDraft(null)
            setIsEditing(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to update your profile.'
            const serverError = getAbpErrorFromException(error)
            const fieldErrorsByMessage = serverError
                ? mapServerErrorsToFields(serverError)
                : mapMessageToFieldErrors(message, customerFieldAliases)
            if (Object.keys(fieldErrorsByMessage).length) setFieldErrors(fieldErrorsByMessage)
            else setFormError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="homepage customer-profile-shell customer-portal-shell">
            <Header />
            <main className="customer-profile-page">
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
                                <form className="customer-profile-form" onSubmit={handleUpdate} noValidate>
                                    <label>
                                        <span>Name</span>
                                        <input
                                            id="customer-profile-name"
                                            autoComplete="name"
                                            value={draft.name}
                                            onChange={(event) => {
                                                setDraft({ ...draft, name: event.target.value })
                                                setFieldErrors((current) => ({ ...current, name: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.name)}
                                            aria-describedby={fieldErrors.name ? 'customer-profile-name-error' : undefined}
                                            className={fieldErrors.name ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.name && <span id="customer-profile-name-error" className="customer-profile-field-error" role="alert">{fieldErrors.name}</span>}
                                    </label>
                                    <label>
                                        <span>Phone number</span>
                                        <input
                                            id="customer-profile-phone-number"
                                            type="tel"
                                            autoComplete="tel"
                                            value={draft.phoneNumber}
                                            onChange={(event) => {
                                                setDraft({ ...draft, phoneNumber: event.target.value })
                                                setFieldErrors((current) => ({ ...current, phoneNumber: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.phoneNumber)}
                                            aria-describedby={fieldErrors.phoneNumber ? 'customer-profile-phone-number-error' : undefined}
                                            className={fieldErrors.phoneNumber ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.phoneNumber && <span id="customer-profile-phone-number-error" className="customer-profile-field-error" role="alert">{fieldErrors.phoneNumber}</span>}
                                    </label>
                                    <label>
                                        <span>Email</span>
                                        <input
                                            id="customer-profile-email"
                                            type="email"
                                            autoComplete="email"
                                            value={draft.email ?? ''}
                                            onChange={(event) => {
                                                setDraft({ ...draft, email: event.target.value })
                                                setFieldErrors((current) => ({ ...current, email: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.email)}
                                            aria-describedby={fieldErrors.email ? 'customer-profile-email-error' : undefined}
                                            className={fieldErrors.email ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.email && <span id="customer-profile-email-error" className="customer-profile-field-error" role="alert">{fieldErrors.email}</span>}
                                    </label>
                                    <div className="customer-profile-actions">
                                        <button className="customer-profile-submit" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save changes'}
                                        </button>
                                        <button className="customer-profile-cancel" type="button" onClick={cancelEditing} disabled={isSubmitting}>
                                            Cancel
                                        </button>
                                    </div>
                                    {formError && <p className="customer-profile-error" role="alert">{formError}</p>}
                                </form>
                            ) : (
                                <>
                                    <dl className="customer-profile-details">
                                        <div>
                                            <span className="customer-profile-field-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><path d="M6.6 3.8h2.8l1.4 4-1.8 1.6a15 15 0 0 0 5.6 5.6l1.6-1.8 4 1.4v2.8a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z" /></svg>
                                            </span>
                                            <dt>Phone number</dt>
                                            <dd>{profile.phoneNumber || '—'}</dd>
                                        </div>
                                        <div>
                                            <span className="customer-profile-field-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
                                            </span>
                                            <dt>Email</dt>
                                            <dd>{profile.email || '—'}</dd>
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
            <Footer />
        </div>
    )
}

export default CustomerProfile
