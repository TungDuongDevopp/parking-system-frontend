import { Link } from 'react-router-dom'
import logo from '../../assets/logo-purple.png'

const Footer = () => (
    <footer className="homepage-footer">
        <div className="footer-content">
            <div className="footer-brand">
                <Link className="footer-logo" to="/" aria-label="Carkparking home">
                    <img src={logo} alt="Carkparking" />
                </Link>
                <p>
                    © {new Date().getFullYear()}{' '}
                    <a href="https://carkparking.com">Carkparking.com</a> - All rights reserved.
                </p>
            </div>

            <nav className="footer-links" aria-label="Footer">
                <div className="footer-link-group">
                    <h2>Product</h2>
                    <Link to="/pricing">Pricing &amp; Plans</Link>
                    <Link to="/login">Find Parking</Link>
                    <Link to="/register">Get started</Link>
                </div>
                <div className="footer-link-group">
                    <h2>Company</h2>
                    <Link to="/about">About us</Link>
                    <a href="https://carkparking.com">Carkparking.com</a>
                </div>
                <div className="footer-link-group">
                    <h2>Account</h2>
                    <Link to="/login">Sign in</Link>
                    <Link to="/register">Sign up</Link>
                </div>
            </nav>
        </div>
    </footer>
)

export default Footer
