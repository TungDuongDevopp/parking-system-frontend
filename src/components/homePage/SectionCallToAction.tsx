import { Link } from 'react-router-dom'
import effectDown from '../../assets/effectdown.svg'

const SectionCallToAction = () => (
    <section className="homepage-cta" aria-labelledby="homepage-cta-heading">
        <img className="homepage-cta-effect" src={effectDown} alt="" aria-hidden="true" />
        <div className="homepage-cta-content">
            <p className="homepage-cta-eyebrow">A smarter way to park</p>
            <h2 id="homepage-cta-heading">Take control of your parking</h2>
            <p className="homepage-cta-description">
                Find the right spot, reserve with confidence, and make every trip easier.
            </p>
            <Link className="homepage-cta-button" to="/register">
                Get Started <span aria-hidden="true">→</span>
            </Link>
        </div>
    </section>
)

export default SectionCallToAction
