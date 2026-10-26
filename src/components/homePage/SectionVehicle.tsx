import { useEffect, useRef } from 'react'
import truck from '../../assets/vehicle/truck-delivery-svgrepo-com.svg'
import taxi from '../../assets/vehicle/taxi-svgrepo-com.svg'
import scooter from '../../assets/vehicle/scooter-2-svgrepo-com.svg'
import motorcycle from '../../assets/vehicle/motorcycle-svgrepo-com.svg'
import sportsCar from '../../assets/vehicle/car-sports-svgrepo-com.svg'
import bicycle from '../../assets/vehicle/bicycle-svgrepo-com.svg'

const vehicles = [
    { name: 'Delivery truck', image: truck },
    { name: 'Taxi', image: taxi },
    { name: 'Scooter', image: scooter },
    { name: 'Motorcycle', image: motorcycle },
    { name: 'Sports car', image: sportsCar },
    { name: 'Bicycle', image: bicycle },
]

type Particle = {
    x: number
    y: number
    radius: number
    speedX: number
    speedY: number
    opacity: number
}

const SectionVehicle = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        let animationFrame = 0
        let particles: Particle[] = []
        let width = 0
        let height = 0
        let previousTime = 0

        const draw = (time: number) => {
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

                context.beginPath()
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
                context.fillStyle = `rgba(216, 180, 254, ${particle.opacity})`
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
            const particleCount = Math.min(40, Math.max(12, Math.round((width * height) / 9000)))

            particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.4,
                speedX: (Math.random() - 0.5) * 8,
                speedY: (Math.random() - 0.5) * 5,
                opacity: Math.random() * 0.45 + 0.2,
            }))

            previousTime = 0
            window.cancelAnimationFrame(animationFrame)
            draw(performance.now())
        }

        const handleMotionPreferenceChange = () => resize()
        const observer = new ResizeObserver(resize)
        observer.observe(canvas)
        motionPreference.addEventListener('change', handleMotionPreferenceChange)
        resize()

        return () => {
            observer.disconnect()
            motionPreference.removeEventListener('change', handleMotionPreferenceChange)
            window.cancelAnimationFrame(animationFrame)
        }
    }, [])

    return (
        <section className="main-vehicle-container" aria-label="Vehicles">
            <div className="vehicle-road" aria-hidden="true">
                <canvas className="vehicle-particles" ref={canvasRef} />
                {vehicles.map((vehicle, index) => (
                    <img
                        key={vehicle.name}
                        className="moving-vehicle"
                        src={vehicle.image}
                        alt=""
                        aria-hidden="true"
                        style={{ animationDelay: `${index * -4.3}s` }}
                    />
                ))}
            </div>
        </section>
    )
}

export default SectionVehicle;