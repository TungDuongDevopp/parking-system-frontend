import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../resources/css/dashboard.css'
import '../resources/css/customer-profile.css'
import { createCustomer } from '../services/customerService'

const CreateCustomerProfile = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const response = await createCustomer({
                name: name.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim(),
            })
            if (!response.success) {
                setErrorMessage(response.error?.message || 'Unable to create your profile.')
                return
            }
            navigate('/customer/profile', { replace: true })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to create your profile.')
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
                <form className="customer-profile-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Name</span>
                        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
                    </label>
                    <label>
                        <span>Phone number</span>
                        <input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} autoComplete="tel" required />
                    </label>
                    <label>
                        <span>Email</span>
                        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                    </label>
                    {errorMessage && <p className="customer-profile-error" role="alert">{errorMessage}</p>}
                    <button className="customer-profile-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create profile'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default CreateCustomerProfile
