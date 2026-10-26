import './resources/css/homepage.scss'
import Footer from './components/homePage/Footer'
import Header from './components/homePage/Header'
import SectionPricing from './components/homePage/SectionPricing'

const PricingPage = () => (
    <div className="homepage">
        <Header />
        <main className="homepage-main pricing-page-main">
            <SectionPricing detailed />
        </main>
        <Footer />
    </div>
)

export default PricingPage
