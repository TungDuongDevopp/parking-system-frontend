import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import '../resources/css/login.css'
import { changePassword } from '../services/authService'
import type { ChangePassWordRequest } from '../types/changePassword'
function LockIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></svg>
}

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
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const navigate = useNavigate();
	const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
		setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }))
	}
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		setErrorMessage('')
		setIsSubmitted(true)
		if (newPassword !== confirmPassword) {
			setErrorMessage('New password and confirmation password must match.')
			setIsSubmitted(false)
			return
		}
		if(newPassword == currentPassword){
			setErrorMessage('New password must not be the same as current password')
			setIsSubmitted(false)
			return
		}
		const account: ChangePassWordRequest = {
			currentPassword : currentPassword,
			newPassword : newPassword
		}
		try{
			const response = await changePassword(account);
			if (!response.success || response.result !== true) {
				setErrorMessage(response.error?.message || 'Change password failed!');
				return
			}
			navigate("/login");

		}
		catch(error){
			console.error(error);
			setErrorMessage('Đổi mật khẩu thất bại')
		}
		finally{
			setIsSubmitted(false)
		}

		

		
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
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="current-password" name="currentPassword" type={visiblePasswords.current ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /><button className="password-toggle" type="button" aria-label={visiblePasswords.current ? 'Hide current password' : 'Show current password'} title={visiblePasswords.current ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('current')}><EyeIcon visible={visiblePasswords.current} /></button></div>
						<label className="field-label" htmlFor="new-password">New password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="new-password" name="newPassword" type={visiblePasswords.new ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter a new password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /><button className="password-toggle" type="button" aria-label={visiblePasswords.new ? 'Hide new password' : 'Show new password'} title={visiblePasswords.new ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('new')}><EyeIcon visible={visiblePasswords.new} /></button></div>
						<label className="field-label" htmlFor="confirm-password">Confirm new password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="confirm-password" name="confirmPassword" type={visiblePasswords.confirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /><button className="password-toggle" type="button" aria-label={visiblePasswords.confirm ? 'Hide confirmation password' : 'Show confirmation password'} title={visiblePasswords.confirm ? 'Hide password' : 'Show password'} onClick={() => togglePasswordVisibility('confirm')}><EyeIcon visible={visiblePasswords.confirm} /></button></div>
						<button className="login-button" type="submit" disabled={isSubmitted}><span>{isSubmitted ? 'Changing password...' : 'Update password'}</span>{!isSubmitted && <ArrowIcon />}</button>
						<Link className="cancel-button" to="/">Cancel</Link>
						{isSubmitted && <p className="form-message" role="status">Changing your password...</p>}
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
