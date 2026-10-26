import './resources/css/homepage.scss'
import Footer from './components/homePage/Footer'
import Main from './components/homePage/Main'
import Header from './components/homePage/Header'
import { Navigate } from 'react-router-dom'
import { AuthStatusMessage, useAuth } from './auth/AuthContext'
import { getRoleHomePath } from './auth/roles'

const Homepage = () => (
    <HomepageContent />
)

const HomepageContent = () => {
    const { status, user } = useAuth()

    if (status === 'loading' || status === 'error') {
        return <AuthStatusMessage />
    }

    if (user && !user.roles.includes('Customer')) {
        return <Navigate to={getRoleHomePath(user.roles) ?? '/login'} replace />
    }

    return (
        <div className="homepage">
            <Header />
            <Main />
            <Footer />
        </div>
    )
}

export default Homepage
