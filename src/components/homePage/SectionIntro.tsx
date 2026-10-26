import { useEffect, useRef } from 'react'
import effect from '../../assets/effect.svg'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const SectionIntro = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { user } = useAuth()
    const isCustomer = user?.roles.includes('Customer') ?? false

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        let animationFrame = 0
        let particles: Array<{ x: number; y: number; radius: number; speedX: number; speedY: number; phase: number }> = []
        let width = 0
        let height = 0
        let previousTime = 0

        const draw = (time: number) => {
            if (!context) return
            const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0
            previousTime = time
            context.clearRect(0, 0, width, height)

            particles.forEach((particle) => {
                if (!motionPreference.matches) {
                    particle.x += particle.speedX * delta
                    particle.y += particle.speedY * delta
                    if (particle.x < 0) particle.x = width
                    if (particle.x > width) particle.x = 0
                    if (particle.y < 0) particle.y = height
                    if (particle.y > height) particle.y = 0
                }

                const twinkle = motionPreference.matches
                    ? 0.7
                    : 0.45 + (Math.sin(time / 900 + particle.phase) + 1) * 0.25
                context.beginPath()
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
                context.fillStyle = `rgba(237, 220, 255, ${twinkle})`
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

            const count = Math.min(90, Math.max(24, Math.round((width * height) / 12000)))
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.3 + 0.5,
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 8,
                phase: Math.random() * Math.PI * 2,
            }))
            previousTime = 0
            window.cancelAnimationFrame(animationFrame)
            draw(performance.now())
        }

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)
        resize()

        return () => {
            observer.disconnect()
            window.cancelAnimationFrame(animationFrame)
        }
    }, [])

    return (
        <div className="main-intro-container">
            <img className="intro-effect" src={effect} alt="" aria-hidden="true" />
            <div className="intro-particles" aria-hidden="true">
                <canvas ref={canvasRef} />
            </div>
            <div className="intro-content">
                <div className="text-intro">
                    <span className="intro-badge">
                        Parking System is now in beta <span className="intro-badge-arrow" aria-hidden="true">→</span>
                    </span>
                </div>
                <h1>Parking Made Simple</h1>
                <p>
                    Find and reserve a parking spot with ease. A smarter way to park,
                    whether you are planning ahead or arriving now.
                </p>
                <div className="intro-actions">
                    {isCustomer ? (
                        <>
                            <Link className="intro-action-primary" to="/customer/find-parking">
                                Find Parking <span aria-hidden="true">→</span>
                            </Link>
                            <Link className="intro-action-secondary" to="/customer/reservations">
                                My Reservations
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link className="intro-action-primary" to="/register">
                                Get Started <span aria-hidden="true">→</span>
                            </Link>
                            <Link className="intro-action-secondary" to="/login">
                                Sign in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SectionIntro;