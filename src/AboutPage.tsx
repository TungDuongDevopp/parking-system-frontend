import './resources/css/homepage.scss'
import './resources/css/customer-portal.scss'
import Footer from './components/homePage/Footer'
import Header from './components/homePage/Header'
import SectionAbout from './components/homePage/SectionAbout'

const AboutPage = () => (
    <div className="homepage about-page customer-portal-shell">
        <Header />
        <main className="homepage-main about-page-main">
            <SectionAbout />
        </main>
        <Footer />
    </div>
)

export default AboutPage
