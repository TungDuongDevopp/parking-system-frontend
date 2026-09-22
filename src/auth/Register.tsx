import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../resources/css/login.css'
import { register } from '../services/authService'
import type { RegisterRequest } from '../types/register'

function UserIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 19.5c.6-3.1 2.8-5 6.5-5s5.9 1.9 6.5 5" /></svg>
}

function MailIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m5 8 7 5 7-5" /></svg>
}

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

function Register() {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState('');
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [username,setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [firstName,setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		setErrorMessage('')
		setIsSubmitted(true)
		const account : RegisterRequest ={
			userName : username,
			emailAddress : email,
			name : firstName,
			surname: lastName,
			password: password
		}
		try {
				const response = await register(account);
				if(!response.success){
					setErrorMessage(response.error?.message || 'Đăng ký thất bại');
					return;
				}
				navigate("/login");

		}
		catch(error){
			console.error(error);
			setErrorMessage(error instanceof Error ? error.message : 'Đăng ký thất bại')
		}
		finally{
			setIsSubmitted(false);
		}
	}

	return (
		<main className="login-page register-page">
			<div className="login-glow login-glow-top" />
			<div className="login-glow login-glow-bottom" />
			<section className="login-shell" aria-labelledby="register-title">
				<a className="login-brand" href="/" aria-label="ParkingSystem - Trang chu">
					<div className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 20.5 24 12l14 8.5v14L24 42 10 34.5z" /><path d="M17 24.5 24 20l7 4.5v7L24 36l-7-4.5z" /><path d="M24 12v8M10 20.5l7 4M38 20.5l-7 4M24 36v6" /></svg></div>
					<div><strong>Park<span>ing</span>System</strong><small>SMART PARKING PLATFORM</small></div>
				</a>
				<div className="login-card register-card">
					<div className="login-heading"><p className="eyebrow">GET STARTED</p><h1 id="register-title">Create your account</h1><p>Join ParkingSystem and make parking easier.</p></div>
					<form onSubmit={handleSubmit}>
						<label className="field-label" htmlFor="first-name">First name</label>
						<div className="input-wrap"><span className="input-icon"><UserIcon /></span><input id="first-name" name="firstName" type="text" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Your first name" required /></div>
						<label className="field-label" htmlFor="last-name">Last name</label>
						<div className="input-wrap"><span className="input-icon"><UserIcon /></span><input id="last-name" name="lastName" type="text" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Your last name" required /></div>
						<label className="field-label" htmlFor="register-email">Email address</label>
						<div className="input-wrap"><span className="input-icon"><MailIcon /></span><input id="register-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
						<label className="field-label" htmlFor="register-username">Username</label>
						<div className="input-wrap"><span className="input-icon"><UserIcon /></span><input id="register-username" name="username" type="text" autoComplete="username" value={username} onChange={(event) => setUserName(event.target.value)} placeholder="Choose a username" required /></div>
						<label className="field-label" htmlFor="register-password">Password</label>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="register-password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" minLength={8} required /><button className="password-toggle" type="button" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'} title={isPasswordVisible ? 'Hide password' : 'Show password'} onClick={() => setIsPasswordVisible((visible) => !visible)}><EyeIcon visible={isPasswordVisible} /></button></div>
						<button className="login-button" type="submit" disabled={isSubmitted}><span>{isSubmitted ? 'Creating account...' : 'Register'}</span>{!isSubmitted && <ArrowIcon />}</button>
						{errorMessage && <p className="form-message form-error" role="alert">{errorMessage}</p>}
					</form>
					<p className="register-prompt">Already have an account? <a href="/login">Sign in</a></p>
				</div>
				<p className="login-footer">© 2026 ParkingSystem <span>•</span> Secure access for modern parking teams</p>
			</section>
		</main>
	)
}

export default Register
