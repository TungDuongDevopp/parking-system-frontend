import { useEffect, useRef } from 'react'
import {
    IconBell,
    IconChartBar,
    IconDownload,
    IconMessageCircle,
    IconPlug,
    IconRefresh,
    IconSearch,
    IconShieldCheck,
    IconUsers,
} from '@tabler/icons-react'
import effectDown from '../../assets/effectdown.svg'

const trustGroups = [
    {
        title: 'Easy Parking',
        features: [
            { icon: <IconMessageCircle />, title: 'Simple reservations', description: 'Find and reserve a parking spot in just a few steps.' },
            { icon: <IconUsers />, title: 'Flexible for everyone', description: 'Parking options for both visitors and registered customers.' },
            { icon: <IconSearch />, title: 'Find the right spot', description: 'Search parking areas and available spots with ease.' },
        ],
    },
    {
        title: 'Smart Management',
        features: [
            { icon: <IconChartBar />, title: 'Clear overview', description: 'View parking activity and keep operations organized.' },
            { icon: <IconBell />, title: 'Stay up to date', description: 'Keep track of reservations and parking session changes.' },
            { icon: <IconPlug />, title: 'Connected services', description: 'Manage parking areas, spots, and subscriptions together.' },
        ],
    },
    {
        title: 'Reliable by Design',
        features: [
            { icon: <IconShieldCheck />, title: 'Secure access', description: 'Role-based access helps protect account and parking data.' },
            { icon: <IconDownload />, title: 'Accessible records', description: 'Keep reservation and session information easy to review.' },
            { icon: <IconRefresh />, title: 'Always in sync', description: 'See updated parking information across your workspace.' },
        ],
    },
]

const SesctionTrust = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        let animationFrame = 0
        let width = 0
        let height = 0
        let previousTime = 0
        let stars: Array<{ x: number; y: number; radius: number; phase: number; speed: number }> = []

        const draw = (time: number) => {
            const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0
            previousTime = time
            context.clearRect(0, 0, width, height)

            stars.forEach((star) => {
                if (!motionPreference.matches) {
                    star.phase += delta * star.speed
                }
                const opacity = motionPreference.matches
                    ? 0.55
                    : 0.25 + (Math.sin(star.phase) + 1) * 0.3
                context.beginPath()
                context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
                context.fillStyle = `rgba(230, 210, 255, ${opacity})`
                context.fill()
            })

            if (!motionPreference.matches) {
                animationFrame = window.requestAnimationFrame(draw)
            }
        }

        const resize = () => {
            const bounds = canvas.getBoundingClientRect()
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
            width = bounds.width
            height = bounds.height
            canvas.width = Math.round(width * pixelRatio)
            canvas.height = Math.round(height * pixelRatio)
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
            const starCount = Math.min(72, Math.max(28, Math.round((width * height) / 14000)))
            stars = Array.from({ length: starCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 1.2 + 0.5,
            }))
            previousTime = 0
            window.cancelAnimationFrame(animationFrame)
            draw(performance.now())
        }

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)
        motionPreference.addEventListener('change', resize)
        resize()

        return () => {
            observer.disconnect()
            motionPreference.removeEventListener('change', resize)
            window.cancelAnimationFrame(animationFrame)
        }
    }, [])

    return (
        <section id="trust" className="trust-section" aria-labelledby="trust-heading">
            <img className="trust-effect" src={effectDown} alt="" aria-hidden="true" />
            <canvas className="trust-stars" ref={canvasRef} aria-hidden="true" />
            <div className="trust-content">
                <header className="trust-header">
                    <h2 id="trust-heading">Why trust us?</h2>
                    <p>
                        A reliable parking experience starts with simple tools, clear information,
                        and secure access for everyone.
                    </p>
                </header>

                <div className="trust-groups">
                    {trustGroups.map((group) => (
                        <section className="trust-group" key={group.title} aria-label={group.title}>
                            <h3>{group.title}</h3>
                            <div className="trust-features">
                                {group.features.map((feature) => (
                                    <article className="trust-feature" key={feature.title}>
                                        <h4>
                                            <span className="trust-feature-icon" aria-hidden="true">{feature.icon}</span>
                                            {feature.title}
                                        </h4>
                                        <p>{feature.description}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SesctionTrust