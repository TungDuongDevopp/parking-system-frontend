import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import loginImage from '../assets/image_login.png';
import logoImage from '../assets/logo.png';
import { login } from '../services/authService';
import { getAbpErrorMessage } from '../services/abpError';
import type { LoginRequest } from '../types/Account/login';
import type { JwtPayload } from '../types/Account/auth';
import '../resources/css/login2.scss';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        const credentials: LoginRequest = {
            userNameOrEmailAddress: username,
            password,
            rememberClient: rememberMe,
        };

        try {
            const response = await login(credentials);

            if (!response.success || !response.result?.accessToken) {
                setErrorMessage(getAbpErrorMessage(response.error, 'Username or password is incorrect.'));
                return;
            }

            const accessToken = response.result.accessToken;
            if (rememberMe) {
                localStorage.setItem('accessToken', accessToken);
                sessionStorage.removeItem('accessToken');
            } else {
                localStorage.removeItem('accessToken');
                sessionStorage.setItem('accessToken', accessToken);
            }

            const payload = jwtDecode<JwtPayload>(accessToken);
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            switch (role) {
                case 'Admin':
                    navigate('/admin');
                    break;
                case 'Staff':
                    navigate('/staff');
                    break;
                case 'Customer':
                    navigate('/customer');
                    break;
                default:
                    throw new Error('Role không hợp lệ');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : 'Tài khoản hoặc mật khẩu không hợp lệ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="main-container">
            <section className="image-content" aria-label="Parking facility">
                <img src={loginImage} alt="Modern parking facility on a sunny day" />
                <div className="image-caption">
                    <span className="image-caption-tag">PARKING, MADE SIMPLE</span>
                    <h2>Your space is waiting.</h2>
                    <p>Find a spot, park with confidence, and get on with your day.</p>
                </div>
            </section>

            <section className="login-panel" aria-labelledby="login-title">
                <div className="login-panel-inner">
                    <div className="login-brand">
                        <img src={logoImage} alt="" />
                        <span>Parking<span className="brand-accent">System</span></span>
                    </div>

                    <div className="title">
                        <span className="title-eyebrow">WELCOME BACK</span>
                        <h1 id="login-title">Login to get started</h1>
                        <p>Welcome back! Your parking is just a moment away.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <label htmlFor="login-username">Email or username</label>
                        <input
                            id="login-username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="you@example.com"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />

                        <label htmlFor="login-password">Password</label>
                        <div className="password-field">
                            <input
                                id="login-password"
                                name="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <button
                                className="password-toggle"
                                type="button"
                                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                aria-pressed={isPasswordVisible}
                                onClick={() => setIsPasswordVisible((visible) => !visible)}
                            >
                                {isPasswordVisible ? (
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.1 3.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.7-.3 3.8-.9" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                                        <circle cx="12" cy="12" r="2.5" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="form-options">
                            <label className="remember-option">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="#forgot-password">Forgot password?</a>
                        </div>

                        <button className="login-button" type="submit" disabled={isSubmitting}>
                            <span>{isSubmitting ? 'Signing in...' : 'Log in'}</span>
                            {!isSubmitting && (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 12h13M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </button>
                        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

                        <p className="register-prompt">
                            Don't have an account? <a href="/register">Sign up</a>
                        </p>
                    </form>

                    <p className="login-footer">
                        By signing in, you agree to our <a href="#terms">Terms of Service</a> and{' '}
                        <a href="#privacy">Privacy Policy</a>.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
