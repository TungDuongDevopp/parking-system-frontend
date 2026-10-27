import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import loginImage from '../assets/image_login.png'
import logoImage from '../assets/logo-purple.png'
import '../resources/css/login2.scss'
import { changePassword } from '../services/authService'
import type { ChangePassWordRequest } from '../types/Account/changePassword'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword'

const passwordFieldAliases = {
	currentPassword: ['currentPassword'],
	newPassword: ['newPassword'],
	confirmPassword: ['confirmPassword'],
} as const
function ArrowIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function EyeIcon({ visible }: { visible: boolean }) {
	return visible
		? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
		: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.3 17.3 0 0 1-3.1 3.8M6.3 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.6-.3 3.7-.8" /></svg>
}

function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [visiblePasswords, setVisiblePasswords] = useState({ current: false, new: false, confirm: false })
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<PasswordField>>({})
	const [formError, setFormError] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const navigate = useNavigate();
	const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
		setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }))
	}
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const nextErrors: FieldErrors<PasswordField> = {}
		if (!currentPassword) nextErrors.currentPassword = 'Current password is required.'
		if (newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters.'
		if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your new password.'
		setIsSubmitted(true)
		if (newPassword !== confirmPassword) {
			nextErrors.confirmPassword = 'New password and confirmation password must match.'
		}
		if (newPassword && newPassword == currentPassword) {
			nextErrors.newPassword = 'New password must not be the same as current password.'
		}
		setFieldErrors(nextErrors)
		setFormError('')
		if (Object.keys(nextErrors).length) {
			setIsSubmitted(false)
			return
		}
		const account: ChangePassWordRequest = {
			currentPassword : currentPassword,
			newPassword : newPassword
		}
		try{
			await changePassword(account)
			navigate("/login");

		}
		catch(error){
			console.error(error);
			const message = error instanceof Error ? error.message : 'Đổi mật khẩu thất bại'
			const abpError = getAbpErrorFromException(error)
			const serverErrors = abpError
				? mapAbpFieldErrors(abpError, passwordFieldAliases)
				: mapMessageToFieldErrors(message, passwordFieldAliases)
			if (Object.keys(serverErrors).length) setFieldErrors(serverErrors)
			else setFieldErrors({ currentPassword: message })
		}
		finally{
			setIsSubmitted(false)
		}

		

		
	}

	return (
		<main className="main-container public-auth-page change-password-page">
			<section className="image-content" aria-label="ParkingSystem introduction">
				<img src={loginImage} alt="Modern parking facility on a sunny day" />
				<div className="image-caption">
					<span className="image-caption-tag">ACCOUNT SECURITY</span>
					<h2>Keep your account secure.</h2>
					<p>Update your password regularly to protect your ParkingSystem account.</p>
				</div>
			</section>

			<section className="login-panel" aria-labelledby="change-password-title">
				<div className="login-panel-inner">
					<div className="login-brand">
						<img src={logoImage} alt="" />
						<span>Parking<span className="brand-accent">System</span></span>
					</div>

					<div className="title">
						<span className="title-eyebrow">ACCOUNT SECURITY</span>
						<h1 id="change-password-title">Change your password</h1>
						<p>Keep your ParkingSystem account secure.</p>
					</div>

					<form className="login-form change-password-form" onSubmit={handleSubmit} noValidate>
						<label htmlFor="current-password">Current password</label>
						<div className="password-field">
							<input id="current-password" name="currentPassword" type={visiblePasswords.current ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your current password" value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); setFieldErrors((errors) => ({ ...errors, currentPassword: undefined })) }} aria-invalid={Boolean(fieldErrors.currentPassword)} aria-describedby={fieldErrors.currentPassword ? 'current-password-error' : undefined} className={fieldErrors.currentPassword ? 'has-error' : undefined} />
							<button className="password-toggle" type="button" aria-label={visiblePasswords.current ? 'Hide current password' : 'Show current password'} title={visiblePasswords.current ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('current')}><EyeIcon visible={visiblePasswords.current} /></button>
						</div>
						{fieldErrors.currentPassword && <p id="current-password-error" className="field-error" role="alert">{fieldErrors.currentPassword}</p>}

						<label htmlFor="new-password">New password</label>
						<div className="password-field">
							<input id="new-password" name="newPassword" type={visiblePasswords.new ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter a new password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setFieldErrors((errors) => ({ ...errors, newPassword: undefined, confirmPassword: undefined })) }} aria-invalid={Boolean(fieldErrors.newPassword)} aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined} className={fieldErrors.newPassword ? 'has-error' : undefined} />
							<button className="password-toggle" type="button" aria-label={visiblePasswords.new ? 'Hide new password' : 'Show new password'} title={visiblePasswords.new ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('new')}><EyeIcon visible={visiblePasswords.new} /></button>
						</div>
						{fieldErrors.newPassword && <p id="new-password-error" className="field-error" role="alert">{fieldErrors.newPassword}</p>}

						<label htmlFor="confirm-password">Confirm new password</label>
						<div className="password-field">
							<input id="confirm-password" name="confirmPassword" type={visiblePasswords.confirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((errors) => ({ ...errors, confirmPassword: undefined })) }} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined} className={fieldErrors.confirmPassword ? 'has-error' : undefined} />
							<button className="password-toggle" type="button" aria-label={visiblePasswords.confirm ? 'Hide confirmation password' : 'Show confirmation password'} title={visiblePasswords.confirm ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('confirm')}><EyeIcon visible={visiblePasswords.confirm} /></button>
						</div>
						{fieldErrors.confirmPassword && <p id="confirm-password-error" className="field-error" role="alert">{fieldErrors.confirmPassword}</p>}

						<button className="login-button" type="submit" disabled={isSubmitted}>
							<span>{isSubmitted ? 'Changing password...' : 'Update password'}</span>
							{!isSubmitted && <ArrowIcon />}
						</button>
						{isSubmitted && <p className="form-message" role="status">Changing your password...</p>}
						{formError && <p className="form-error" role="alert">{formError}</p>}
					</form>

					<p className="register-prompt change-password-links">
						<Link to="/login">Back to sign in</Link>
						<Link to="/">Return to home</Link>
					</p>
				</div>
			</section>
		</main>
	)
}

export default ChangePassword
