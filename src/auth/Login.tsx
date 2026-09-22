import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode";


import '../resources/css/login.css';
import { login } from '../services/authService';
import type { LoginRequest } from '../types/login'
import type { JwtPayload } from "../types/auth";

function UserIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 19.5c.6-3.1 2.8-5 6.5-5s5.9 1.9 6.5 5" /></svg>
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

function Login() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage('');
		setIsSubmitting(true);

		const credentials: LoginRequest = {
			userNameOrEmailAddress: username,
			password: password,
			rememberClient: rememberMe
		}

		try {
			const response = await login(credentials);
			

			if (!response.success || !response.result?.accessToken) {
				setErrorMessage(response.error?.message || 'Username or password is incorrect.');
				return
			}
			const accessToken = response.result?.accessToken;
			if (rememberMe) {
				localStorage.setItem("accessToken", accessToken);
				sessionStorage.removeItem("accessToken");
			} else {
				localStorage.removeItem("accessToken");
				sessionStorage.setItem("accessToken", accessToken);
			}

				const payload = jwtDecode<JwtPayload>(accessToken);

				const role =
				payload[
					"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
				];
			
							switch (role) {
				case "Admin":
					navigate("/admin");
					break;

				case "Staff":
					navigate("/staff");
					break;

				case "Customer":
					navigate("/customer");
					break;

				default:
					throw new Error("Role không hợp lệ");
				}
		} catch (error) {
			console.error(error)
			setErrorMessage(error instanceof Error ? error.message : 'Tài khoản hoặc mật khẩu không hợp lệ')
} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="login-page">
			<div className="login-glow login-glow-top" />
			<div className="login-glow login-glow-bottom" />
			<section className="login-shell" aria-labelledby="login-title">
				<div className="login-brand">
					<div className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 20.5 24 12l14 8.5v14L24 42 10 34.5z" /><path d="M17 24.5 24 20l7 4.5v7L24 36l-7-4.5z" /><path d="M24 12v8M10 20.5l7 4M38 20.5l-7 4M24 36v6" /></svg></div>
					<div><strong>Park<span>ing</span>System</strong><small>SMART PARKING PLATFORM</small></div>
				</div>
				<div className="login-card">
					<div className="login-heading"><p className="eyebrow">WELCOME BACK</p><h1 id="login-title">Sign in to your account</h1><p>Manage every parking space with confidence.</p></div>
					<form onSubmit={handleSubmit}>
						<label className="field-label" htmlFor="username">Username or email</label>
						<div className="input-wrap"><span className="input-icon"><UserIcon /></span><input id="username" name="username" type="text" autoComplete="username" placeholder="you@example.com" value={username} onChange={(event) => setUsername(event.target.value)} required /></div>
						<div className="password-label-row"><label className="field-label" htmlFor="password">Password</label><a href="#forgot-password">Forgot password?</a></div>
						<div className="input-wrap"><span className="input-icon"><LockIcon /></span><input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="password-toggle" type="button" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'} title={isPasswordVisible ? 'Hide password' : 'Show password'} onClick={() => setIsPasswordVisible((visible) => !visible)}><EyeIcon visible={isPasswordVisible} /></button></div>
						<div className="form-options"><label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span className="checkmark" />Remember me</label></div>
						<button className="login-button" type="submit" disabled={isSubmitting}>
							<span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
							{!isSubmitting && <ArrowIcon />}
						</button>
						{errorMessage && <p className="form-message form-error" role="alert">{errorMessage}</p>}
					</form>
					<p className="register-prompt">New to ParkingSystem? <a href="/register">Create an account</a></p>
				</div>
				<p className="login-footer">© 2026 ParkingSystem <span>•</span> Secure access for modern parking teams</p>
			</section>
		</main>
	)
}

export default Login
