import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../resources/css/dashboard.scss'
import '../resources/css/customer-profile.scss'
import { getMyStaffProfile, changeStaffProfile } from '../services/staffService'
import { getAbpErrorMessage } from '../services/abpError'
import type { StaffChangeProfileRequest, StaffDto } from '../types/Staff/staff'

const formatDate = (value: string | null) => value?.split('T')[0] ?? ''

const matchesSubmittedProfile = (profile: StaffDto, draft: StaffChangeProfileRequest) =>
    profile.phoneNumber.trim() === draft.phoneNumber &&
    (profile.email ?? '').trim() === draft.email &&
    profile.gender === draft.gender &&
    formatDate(profile.dateOfBirth) === formatDate(draft.dateOfBirth) &&
    (profile.address ?? '').trim() === (draft.address ?? '')

const StaffProfile = () => {
    const [profile, setProfile] = useState<StaffDto | null>(null)
    const [draft, setDraft] = useState<StaffChangeProfileRequest | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

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
            dateOfBirth: formatDate(profile.dateOfBirth) || null,
            address: profile.address ?? '',
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

        const updatedProfile: StaffChangeProfileRequest = {
            phoneNumber: draft.phoneNumber.trim(),
            email: draft.email.trim(),
            gender: draft.gender,
            dateOfBirth: draft.dateOfBirth || null,
            address: draft.address?.trim() || null,
        }

        try {
            await changeStaffProfile(updatedProfile)
            const refreshed = await getMyStaffProfile()
            if (!refreshed.success || !refreshed.result) {
                setErrorMessage(getAbpErrorMessage(
                    refreshed.error,
                    'Không thể xác nhận hồ sơ đã được cập nhật. Vui lòng tải lại trang.',
                ))
                return
            }

            setProfile(refreshed.result)
            if (!matchesSubmittedProfile(refreshed.result, updatedProfile)) {
                setErrorMessage('Máy chủ chưa lưu các thay đổi hồ sơ. Vui lòng thử lại hoặc liên hệ quản trị viên.')
                return
            }

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
                                <form className="customer-profile-form" onSubmit={handleUpdate}>
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
                                            value={draft.email ?? ''}
                                            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        <span>Gender</span>
                                        <select
                                            value={draft.gender === null ? '' : draft.gender.toString()}
                                            onChange={(event) => setDraft({
                                                ...draft,
                                                gender: event.target.value === '' ? null : event.target.value === 'true',
                                            })}
                                        >
                                            <option value="">Not specified</option>
                                            <option value="true">Male</option>
                                            <option value="false">Female</option>
                                        </select>
                                    </label>
                                    <label>
                                        <span>Date of birth</span>
                                        <input
                                            type="date"
                                            autoComplete="bday"
                                            value={formatDate(draft.dateOfBirth)}
                                            onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value || null })}
                                        />
                                    </label>
                                    <label>
                                        <span>Address</span>
                                        <input
                                            autoComplete="street-address"
                                            value={draft.address ?? ''}
                                            onChange={(event) => setDraft({ ...draft, address: event.target.value })}
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
