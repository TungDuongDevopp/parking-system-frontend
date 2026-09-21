import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../resources/css/login.css'

function LockIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></svg>
}

function ArrowIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		setErrorMessage('')
		setIsSubmitted(false)

		if (newPassword !== confirmPassword) {
			setErrorMessage('New password and confirmation password must match.')
			return
		}

		setIsSubmitted(true)
	}

	return (
		<main className="login-page">
			<div className="login-glow login-glow-top" />
			<div className="login-glow login-glow-bottom" />
			<section className="login-shell" aria-labelledby="change-password-title">
				<Link className="login-brand" to="/" aria-label="ParkingSystem - Trang chu">
					<div className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 20.5 24 12l14 8.5v14L24 42 10 34.5z" /><path d="M17 24.5 24 20l7 4.5v7L24 36l-7-4.5z" /><path d="M24 12v8M10 20.5l7 4M38 20.5l-7 4M24 36v6" /></svg></div>
					<div><strong>Park<span>ing</span>System</strong><small>SMART PARKING PLATFORM</small></div>
				</Link>
				<div className="login-card change-password-card">
					<div className="login-heading"><p className="eyebrow">ACCOUNT SECURITY</p><h1 id="change-password-title">Change your password</h1><p>Keep your ParkingSystem account secure.</p></div>
					<form onSubmit={handleSubmit}>
						<label className="field-label" htmlFor="current-password">Current password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" placeholder="Enter your current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
						<label className="field-label" htmlFor="new-password">New password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="new-password" name="newPassword" type="password" autoComplete="new-password" placeholder="Enter a new password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></div>
						<label className="field-label" htmlFor="confirm-password">Confirm new password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div>
						<button className="login-button" type="submit"><span>Update password</span><ArrowIcon /></button>
						{isSubmitted && <p className="form-message" role="status">Your password details are ready to be submitted.</p>}
						{errorMessage && <p className="form-message form-error" role="alert">{errorMessage}</p>}
					</form>
					<p className="register-prompt"><Link to="/login">Back to sign in</Link></p>
				</div>
				<p className="login-footer">© 2026 ParkingSystem <span>•</span> Secure access for modern parking teams</p>
			</section>
		</main>
	)
}

export default ChangePassword
