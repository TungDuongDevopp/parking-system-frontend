import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/image_login.png';
import logoImage from '../assets/logo.png';
import { register } from '../services/authService';
import { getAbpErrorMessage } from '../services/abpError';
import type { RegisterRequest } from '../types/Account/register';
import '../resources/css/login2.scss';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        const account: RegisterRequest = {
            userName: username,
            emailAddress: email,
            name: firstName,
            surname: lastName,
            password,
        };

        try {
            const response = await register(account);
            if (!response.success) {
                setErrorMessage(getAbpErrorMessage(response.error, 'Registration failed.'));
                return;
            }

            navigate('/login');
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="main-container register-page">
            <section className="image-content" aria-label="ParkingSystem introduction">
                <img src={loginImage} alt="Modern parking facility on a sunny day" />
                <div className="register-image-content">
                    <a className="register-brand" href="/" aria-label="ParkingSystem home">
                        <img src={logoImage} alt="" />
                        <span>Parking<span>System</span></span>
                    </a>
                    <h2>Join a smarter parking experience.</h2>
                    <p>Create your account and get started in just a few minutes.</p>
                </div>
            </section>

            <section className="login-panel register-panel" aria-labelledby="register-title">
                <div className="login-panel-inner">
                    <div className="login-brand">
                        <img src={logoImage} alt="" />
                        <span>Parking<span className="brand-accent">System</span></span>
                    </div>

                    <div className="title">
                        <span className="title-eyebrow">GET STARTED</span>
                        <h1 id="register-title">Create your account</h1>
                        <p>Join us and manage your parking easily.</p>
                    </div>

                    <form className="login-form register-form" onSubmit={handleSubmit}>
                        <div className="register-fields-grid">
                            <div className="register-field">
                                <label htmlFor="first-name">First name</label>
                                <input
                                    id="first-name"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="register-field">
                                <label htmlFor="last-name">Last name</label>
                                <input
                                    id="last-name"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(event) => setLastName(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="register-field">
                                <label htmlFor="register-email">Email address</label>
                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="register-field">
                                <label htmlFor="register-username">Username</label>
                                <input
                                    id="register-username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="register-field">
                                <label htmlFor="register-password">Password</label>
                                <div className="password-field">
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Create password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        className="password-toggle"
                                        type="button"
                                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                        aria-pressed={isPasswordVisible}
                                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                                    >
                                        <PasswordEye visible={isPasswordVisible} />
                                    </button>
                                </div>
                            </div>
                            <div className="register-field">
                                <label htmlFor="confirm-password">Confirm password</label>
                                <div className="password-field">
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        className="password-toggle"
                                        type="button"
                                        aria-label={isConfirmPasswordVisible ? 'Hide confirmation password' : 'Show confirmation password'}
                                        aria-pressed={isConfirmPasswordVisible}
                                        onClick={() => setIsConfirmPasswordVisible((visible) => !visible)}
                                    >
                                        <PasswordEye visible={isConfirmPasswordVisible} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <label className="register-terms">
                            <input type="checkbox" required />
                            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span>
                        </label>

                        <button className="login-button" type="submit" disabled={isSubmitting}>
                            <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
                            {!isSubmitting && (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 12h13M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </button>
                        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
                    </form>

                    <p className="register-prompt">
                        Already have an account? <a href="/login">Log in</a>
                    </p>
                </div>
            </section>
        </main>
    );
};

function PasswordEye({ visible }: { visible: boolean }) {
    return visible ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.3 17.3 0 0 1-3.1 3.8M6.3 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.6-.3 3.7-.8" />
        </svg>
    );
}

export default Register;
