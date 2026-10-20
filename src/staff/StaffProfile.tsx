import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../resources/css/dashboard.scss'
import '../resources/css/customer-profile.scss'
import { getMyStaffProfile, changeStaffProfile } from '../services/staffService'
import { getAbpErrorMessage } from '../services/abpError'
import type { StaffChangeProfileRequest, StaffDto } from '../types/Staff/staff'
import { mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'

const formatDate = (value: string | null) => value?.split('T')[0] ?? ''

type StaffProfileDraft = {
    phoneNumber: string
    email: string
    gender: boolean | null
    dateOfBirth: string
    address: string
}

type StaffProfileField = keyof StaffProfileDraft

const staffFieldAliases = {
    phoneNumber: ['phone', 'phoneNumber'],
    email: ['email'],
    gender: ['gender'],
    dateOfBirth: ['dateOfBirth', 'birthDate'],
    address: ['address'],
} as const

const matchesSubmittedProfile = (profile: StaffDto, changes: StaffChangeProfileRequest) =>
    (changes.phoneNumber === undefined || profile.phoneNumber.trim() === changes.phoneNumber) &&
    (changes.email === undefined || (profile.email ?? '').trim() === changes.email) &&
    (changes.gender === undefined || profile.gender === changes.gender) &&
    (changes.dateOfBirth === undefined || formatDate(profile.dateOfBirth) === changes.dateOfBirth) &&
    (changes.address === undefined || (profile.address ?? '').trim() === changes.address)

const StaffProfile = () => {
    const [profile, setProfile] = useState<StaffDto | null>(null)
    const [draft, setDraft] = useState<StaffProfileDraft | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<StaffProfileField>>({})
    const [formError, setFormError] = useState('')

    useEffect(() => {
        let isMounted = true

        getMyStaffProfile().then((response) => {
            if (!isMounted) return
            if (!response.success) {
                setErrorMessage(getAbpErrorMessage(response.error, 'Unable to load your profile.'))
                return
            }
            if (!response.result) {
                setErrorMessage('Staff profile not found. Please contact an administrator.')
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
    }, [])

    const startEditing = () => {
        if (!profile) return
        setDraft({
            phoneNumber: profile.phoneNumber,
            email: profile.email ?? '',
            gender: profile.gender,
            dateOfBirth: formatDate(profile.dateOfBirth),
            address: profile.address ?? '',
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

        const phoneNumber = draft.phoneNumber.trim()
        const email = draft.email.trim()
        const dateOfBirth = draft.dateOfBirth
        const address = draft.address.trim()

        if (!phoneNumber) {
            setFieldErrors({ phoneNumber: 'Phone number is required.' })
            return
        }

        const isClearingExistingValue =
            (Boolean(profile.email?.trim()) && !email) ||
            (profile.gender !== null && draft.gender === null) ||
            (profile.dateOfBirth !== null && !dateOfBirth) ||
            (Boolean(profile.address?.trim()) && !address)

        if (isClearingExistingValue) {
            setFieldErrors({
                ...((Boolean(profile.email?.trim()) && !email) ? { email: 'The profile service cannot clear an existing email. Enter a replacement or keep the current value.' } : {}),
                ...(profile.gender !== null && draft.gender === null ? { gender: 'The profile service cannot clear an existing value. Select a replacement or keep the current value.' } : {}),
                ...(profile.dateOfBirth !== null && !dateOfBirth ? { dateOfBirth: 'The profile service cannot clear an existing date. Enter a replacement or keep the current date.' } : {}),
                ...(Boolean(profile.address?.trim()) && !address ? { address: 'The profile service cannot clear an existing address. Enter a replacement or keep the current address.' } : {}),
            })
            return
        }

        const updatedProfile: StaffChangeProfileRequest = {}
        if (phoneNumber !== profile.phoneNumber.trim()) updatedProfile.phoneNumber = phoneNumber
        if (email && email !== (profile.email ?? '').trim()) updatedProfile.email = email
        if (draft.gender !== null && draft.gender !== profile.gender) updatedProfile.gender = draft.gender
        if (dateOfBirth && formatDate(profile.dateOfBirth) !== dateOfBirth) updatedProfile.dateOfBirth = dateOfBirth
        if (address && address !== (profile.address ?? '').trim()) updatedProfile.address = address

        if (Object.keys(updatedProfile).length === 0) {
            setDraft(null)
            setIsEditing(false)
            return
        }

        setIsSubmitting(true)
        try {
            await changeStaffProfile(updatedProfile)
            const refreshed = await getMyStaffProfile()
            if (!refreshed.success || !refreshed.result) {
                setFormError(getAbpErrorMessage(
                    refreshed.error,
                    'Không thể xác nhận hồ sơ đã được cập nhật. Vui lòng tải lại trang.',
                ))
                return
            }

            setProfile(refreshed.result)
            if (!matchesSubmittedProfile(refreshed.result, updatedProfile)) {
                setFormError('Máy chủ chưa lưu các thay đổi hồ sơ. Vui lòng thử lại hoặc liên hệ quản trị viên.')
                return
            }

            setDraft(null)
            setIsEditing(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to update your profile.'
            const serverErrors = mapMessageToFieldErrors(message, staffFieldAliases)
            if (Object.keys(serverErrors).length) setFieldErrors(serverErrors)
            else setFormError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="customer-page customer-profile-page">
            <header className="customer-profile-header">
                <Link className="customer-profile-brand" to="/staff">
                    <span className="brand-square">P</span>
                    <span>Park<span>ing</span>System</span>
                </Link>
                <Link className="customer-profile-back" to="/staff">Back to dashboard</Link>
            </header>
            <section className="customer-profile-content">
                <p className="section-kicker">YOUR ACCOUNT</p>
                <h1>Staff profile</h1>
                {isLoading && <p className="customer-profile-status" role="status">Loading profile...</p>}
                {errorMessage && <p className="customer-profile-error" role="alert">{errorMessage}</p>}
                {profile && !isLoading && (
                    <section className="customer-profile-overview" aria-label="Staff profile details">
                        <div className="customer-profile-identity">
                            <span className="customer-profile-avatar" aria-hidden="true">
                                {profile.name.trim().charAt(0).toUpperCase() || 'S'}
                            </span>
                            <p className="customer-profile-identity-label">STAFF PROFILE</p>
                            <span className="customer-profile-name-label">NAME</span>
                            <h2>{profile.name}</h2>
                            <span className="customer-profile-identity-rule" />
                            <p className="customer-profile-identity-note">Parking System</p>
                        </div>
                        <div className="customer-profile-contact">
                            <div className="customer-profile-contact-heading">
                                <span>01</span>
                                <h2>{isEditing ? 'Edit profile' : 'Personal details'}</h2>
                            </div>
                            {isEditing && draft ? (
                                <form className="customer-profile-form" onSubmit={handleUpdate} noValidate>
                                    <label>
                                        <span>Phone number</span>
                                        <input
                                            type="tel"
                                            autoComplete="tel"
                                            value={draft.phoneNumber}
                                            onChange={(event) => {
                                                setDraft({ ...draft, phoneNumber: event.target.value })
                                                setFieldErrors((errors) => ({ ...errors, phoneNumber: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.phoneNumber)}
                                            className={fieldErrors.phoneNumber ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.phoneNumber && <span className="customer-profile-field-error" role="alert">{fieldErrors.phoneNumber}</span>}
                                    </label>
                                    <label>
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={draft.email ?? ''}
                                            onChange={(event) => {
                                                setDraft({ ...draft, email: event.target.value })
                                                setFieldErrors((errors) => ({ ...errors, email: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.email)}
                                            className={fieldErrors.email ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.email && <span className="customer-profile-field-error" role="alert">{fieldErrors.email}</span>}
                                    </label>
                                    <label>
                                        <span>Gender</span>
                                        <select
                                            value={draft.gender === null ? '' : draft.gender.toString()}
                                            onChange={(event) => {
                                                setDraft({
                                                    ...draft,
                                                    gender: event.target.value === '' ? null : event.target.value === 'true',
                                                })
                                                setFieldErrors((errors) => ({ ...errors, gender: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.gender)}
                                            className={fieldErrors.gender ? 'has-error' : undefined}
                                        >
                                            <option value="">Not specified</option>
                                            <option value="true">Male</option>
                                            <option value="false">Female</option>
                                        </select>
                                        {fieldErrors.gender && <span className="customer-profile-field-error" role="alert">{fieldErrors.gender}</span>}
                                    </label>
                                    <label>
                                        <span>Date of birth</span>
                                        <input
                                            type="date"
                                            autoComplete="bday"
                                            value={formatDate(draft.dateOfBirth)}
                                            onChange={(event) => {
                                                setDraft({ ...draft, dateOfBirth: event.target.value })
                                                setFieldErrors((errors) => ({ ...errors, dateOfBirth: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.dateOfBirth)}
                                            className={fieldErrors.dateOfBirth ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.dateOfBirth && <span className="customer-profile-field-error" role="alert">{fieldErrors.dateOfBirth}</span>}
                                    </label>
                                    <label>
                                        <span>Address</span>
                                        <input
                                            autoComplete="street-address"
                                            value={draft.address ?? ''}
                                            onChange={(event) => {
                                                setDraft({ ...draft, address: event.target.value })
                                                setFieldErrors((errors) => ({ ...errors, address: undefined }))
                                            }}
                                            aria-invalid={Boolean(fieldErrors.address)}
                                            className={fieldErrors.address ? 'has-error' : undefined}
                                        />
                                        {fieldErrors.address && <span className="customer-profile-field-error" role="alert">{fieldErrors.address}</span>}
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
                                    <dl className="customer-profile-details staff-profile-details">
                                        <div><dt>Phone number</dt><dd>{profile.phoneNumber || '—'}</dd></div>
                                        <div><dt>Email</dt><dd>{profile.email || '—'}</dd></div>
                                        <div><dt>Gender</dt><dd>{profile.genderName || (profile.gender === null ? '—' : profile.gender ? 'Male' : 'Female')}</dd></div>
                                        <div><dt>Date of birth</dt><dd>{formatDate(profile.dateOfBirth) || '—'}</dd></div>
                                        <div><dt>Address</dt><dd>{profile.address || '—'}</dd></div>
                                        <div><dt>Hired date</dt><dd>{formatDate(profile.hiredDate) || '—'}</dd></div>
                                        <div><dt>Status</dt><dd>{profile.statusName || '—'}</dd></div>
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

export default StaffProfile
