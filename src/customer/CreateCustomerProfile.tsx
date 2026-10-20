import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { SubmitEvent } from 'react'
import '../resources/css/dashboard.scss'
import '../resources/css/customer-profile.scss'
import { createCustomer } from '../services/customerService'
import { getAbpErrorMessage } from '../services/abpError'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'

type CustomerProfileField = 'name' | 'phoneNumber' | 'email'

const customerFieldAliases = {
    name: ['name'],
    phoneNumber: ['phone', 'phoneNumber'],
    email: ['email'],
} as const

const CreateCustomerProfile = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<CustomerProfileField>>({})
    const [formError, setFormError] = useState('')

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        const nextErrors: FieldErrors<CustomerProfileField> = {}
        if (!name.trim()) nextErrors.name = 'Name is required.'
        if (!phoneNumber.trim()) nextErrors.phoneNumber = 'Phone number is required.'
        if (!email.trim()) nextErrors.email = 'Email is required.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.'
        setFieldErrors(nextErrors)
        setFormError('')
        if (Object.keys(nextErrors).length) return

        setIsSubmitting(true)

        try {
            const response = await createCustomer({
                name: name.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim(),
            })
            if (!response.success) {
                const serverErrors = mapAbpFieldErrors(response.error, customerFieldAliases)
                if (Object.keys(serverErrors).length) setFieldErrors(serverErrors)
                else setFormError(getAbpErrorMessage(response.error, 'Unable to create your profile.'))
                return
            }
            navigate('/customer/profile', { replace: true })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create your profile.'
            const serverErrors = mapMessageToFieldErrors(message, customerFieldAliases)
            if (Object.keys(serverErrors).length) setFieldErrors(serverErrors)
            else setFormError(message)
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
                <h1>Create profile</h1>
                <form className="customer-profile-form" onSubmit={handleSubmit} noValidate>
                    <label>
                        <span>Name</span>
                        <input
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value)
                                setFieldErrors((errors) => ({ ...errors, name: undefined }))
                            }}
                            autoComplete="name"
                            aria-invalid={Boolean(fieldErrors.name)}
                            className={fieldErrors.name ? 'has-error' : undefined}
                        />
                        {fieldErrors.name && <span className="customer-profile-field-error" role="alert">{fieldErrors.name}</span>}
                    </label>
                    <label>
                        <span>Phone number</span>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value)
                                setFieldErrors((errors) => ({ ...errors, phoneNumber: undefined }))
                            }}
                            autoComplete="tel"
                            aria-invalid={Boolean(fieldErrors.phoneNumber)}
                            className={fieldErrors.phoneNumber ? 'has-error' : undefined}
                        />
                        {fieldErrors.phoneNumber && <span className="customer-profile-field-error" role="alert">{fieldErrors.phoneNumber}</span>}
                    </label>
                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value)
                                setFieldErrors((errors) => ({ ...errors, email: undefined }))
                            }}
                            autoComplete="email"
                            aria-invalid={Boolean(fieldErrors.email)}
                            className={fieldErrors.email ? 'has-error' : undefined}
                        />
                        {fieldErrors.email && <span className="customer-profile-field-error" role="alert">{fieldErrors.email}</span>}
                    </label>
                    {formError && <p className="customer-profile-error" role="alert">{formError}</p>}
                    <button className="customer-profile-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create profile'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default CreateCustomerProfile
