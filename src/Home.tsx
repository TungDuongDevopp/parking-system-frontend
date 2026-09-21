import './resources/css/home.css'
import Header from './components/home/Header'
import Hero from './components/home/Hero'
import FeatureGrid from './components/home/FeatureGrid'
import StatsSection from './components/home/StatsSection'
import Footer from './components/home/Footer'

const Home = () => (<div className="home-page">
    <Header />
        <main>
            <Hero />
                <FeatureGrid />
                    <StatsSection />
        </main>
    <Footer />
    </div>)

export default Home;