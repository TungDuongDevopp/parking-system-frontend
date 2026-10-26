import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import loginImage from '../assets/image_login.png';
import logoImage from '../assets/logo-purple.png';
import { register } from '../services/authService';
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation';
import { getAbpErrorFromException } from '../services/serviceResponse';
import type { RegisterRequest } from '../types/Account/register';
import '../resources/css/login2.scss';

type RegisterField = 'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'confirmPassword' | 'terms';

const registerFieldAliases = {
    firstName: ['name', 'firstName'],
    lastName: ['surname', 'lastName'],
    email: ['email', 'emailAddress'],
    username: ['userName', 'username'],
    password: ['password'],
    confirmPassword: ['confirmPassword'],
    terms: ['terms'],
} as const;

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
    const [formError, setFormError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: FieldErrors<RegisterField> = {};
        if (!firstName.trim()) nextErrors.firstName = 'First name is required.';
        if (!lastName.trim()) nextErrors.lastName = 'Last name is required.';
        if (!email.trim()) nextErrors.email = 'Email is required.';
        if (!username.trim()) nextErrors.username = 'Username is required.';
        if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';

        if (password !== confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!acceptedTerms) nextErrors.terms = 'You must accept the terms and privacy policy.';
        setFieldErrors(nextErrors);
        setFormError('');
        if (Object.keys(nextErrors).length) {
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
            await register(account);
            const quotationId = Number(searchParams.get('quotationId'));
            navigate(Number.isSafeInteger(quotationId) && quotationId > 0
                ? `/login?quotationId=${quotationId}`
                : '/login');
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Registration failed.';
            const abpError = getAbpErrorFromException(error);
            const serverErrors = abpError
                ? mapAbpFieldErrors(abpError, registerFieldAliases)
                : mapMessageToFieldErrors(message, registerFieldAliases);
            if (Object.keys(serverErrors).length) setFieldErrors(serverErrors);
            else setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="main-container register-page public-auth-page register-auth-page">
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

                    <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
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
                                    onChange={(event) => {
                                        setFirstName(event.target.value);
                                        setFieldErrors((errors) => ({ ...errors, firstName: undefined }));
                                    }}
                                    aria-invalid={Boolean(fieldErrors.firstName)}
                                    aria-describedby={fieldErrors.firstName ? 'register-first-name-error' : undefined}
                                    className={fieldErrors.firstName ? 'has-error' : undefined}
                                />
                                {fieldErrors.firstName && <span id="register-first-name-error" className="field-error" role="alert">{fieldErrors.firstName}</span>}
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
                                    onChange={(event) => {
                                        setLastName(event.target.value);
                                        setFieldErrors((errors) => ({ ...errors, lastName: undefined }));
                                    }}
                                    aria-invalid={Boolean(fieldErrors.lastName)}
                                    aria-describedby={fieldErrors.lastName ? 'register-last-name-error' : undefined}
                                    className={fieldErrors.lastName ? 'has-error' : undefined}
                                />
                                {fieldErrors.lastName && <span id="register-last-name-error" className="field-error" role="alert">{fieldErrors.lastName}</span>}
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
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setFieldErrors((errors) => ({ ...errors, email: undefined }));
                                    }}
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                                    className={fieldErrors.email ? 'has-error' : undefined}
                                />
                                {fieldErrors.email && <span id="register-email-error" className="field-error" role="alert">{fieldErrors.email}</span>}
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
                                    onChange={(event) => {
                                        setUsername(event.target.value);
                                        setFieldErrors((errors) => ({ ...errors, username: undefined }));
                                    }}
                                    aria-invalid={Boolean(fieldErrors.username)}
                                    aria-describedby={fieldErrors.username ? 'register-username-error' : undefined}
                                    className={fieldErrors.username ? 'has-error' : undefined}
                                />
                                {fieldErrors.username && <span id="register-username-error" className="field-error" role="alert">{fieldErrors.username}</span>}
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
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setFieldErrors((errors) => ({ ...errors, password: undefined, confirmPassword: undefined }));
                                        }}
                                        minLength={8}
                                        aria-invalid={Boolean(fieldErrors.password)}
                                        aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                                        className={fieldErrors.password ? 'has-error' : undefined}
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
                                {fieldErrors.password && <span id="register-password-error" className="field-error" role="alert">{fieldErrors.password}</span>}
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
                                        onChange={(event) => {
                                            setConfirmPassword(event.target.value);
                                            setFieldErrors((errors) => ({ ...errors, confirmPassword: undefined }));
                                        }}
                                        minLength={8}
                                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                        aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
                                        className={fieldErrors.confirmPassword ? 'has-error' : undefined}
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
                                {fieldErrors.confirmPassword && <span id="register-confirm-password-error" className="field-error" role="alert">{fieldErrors.confirmPassword}</span>}
                            </div>
                        </div>

                        <label className={`register-terms${fieldErrors.terms ? ' has-error' : ''}`}>
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(event) => {
                                    setAcceptedTerms(event.target.checked);
                                    setFieldErrors((errors) => ({ ...errors, terms: undefined }));
                                }}
                                aria-invalid={Boolean(fieldErrors.terms)}
                                aria-describedby={fieldErrors.terms ? 'register-terms-error' : undefined}
                            />
                            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span>
                        </label>
                        {fieldErrors.terms && <span id="register-terms-error" className="field-error" role="alert">{fieldErrors.terms}</span>}

                        <button className="login-button" type="submit" disabled={isSubmitting}>
                            <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
                            {!isSubmitting && (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 12h13M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </button>
                        {formError && <p className="form-error" role="alert">{formError}</p>}
                    </form>

                    <p className="register-prompt">
                        Already have an account? <Link to={`/login${searchParams.has('quotationId')
                            ? `?quotationId=${encodeURIComponent(searchParams.get('quotationId') ?? '')}`
                            : ''}`}>Sign in</Link>
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
