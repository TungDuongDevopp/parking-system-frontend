import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { createSubscription, getAvailableQuotation } from '../../services/subscriptionService'
import type { QuotationDto } from '../../types/Quotation/quotation'

const vehicleTypes = [
    { id: 1, label: 'Bicycle' },
    { id: 2, label: 'Electric Bicycle' },
    { id: 3, label: 'Motorcycle' },
    { id: 4, label: 'Electric Motorcycle' },
    { id: 5, label: 'Car' },
] as const

type SectionPricingProps = {
    detailed?: boolean
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
})

const getDurationLabel = (quotation: QuotationDto) =>
    `${quotation.duration} ${quotation.durationUnitType}`

const toLocalDateTimeInput = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return localDate.toISOString().slice(0, 16)
}

const SectionPricing = ({ detailed = false }: SectionPricingProps) => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { status, user } = useAuth()
    const [quotations, setQuotations] = useState<QuotationDto[]>([])
    const [selectedVehicleType, setSelectedVehicleType] = useState<number>(1)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectedQuotation, setSelectedQuotation] = useState<QuotationDto | null>(null)
    const [startTime, setStartTime] = useState(() => toLocalDateTimeInput(new Date()))
    const [plateNumbers, setPlateNumbers] = useState([''])
    const [purchaseError, setPurchaseError] = useState('')
    const [isPurchasing, setIsPurchasing] = useState(false)
    const isCustomer = status === 'authenticated' && user?.roles.includes('Customer')

    const loadQuotations = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage('')
        try {
            setQuotations(await getAvailableQuotation())
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to load parking prices. Please try again later.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadQuotations()
    }, [loadQuotations])

    useEffect(() => {
        const quotationId = Number(searchParams.get('quotationId'))
        if (!detailed || !isCustomer || searchParams.get('buyNow') !== '1' ||
            !Number.isSafeInteger(quotationId) || quotationId <= 0) {
            return
        }

        const quotation = quotations.find((item) => item.id === quotationId)
        if (!quotation) return

        setSelectedVehicleType(quotation.vehicleType)
        setSelectedQuotation(quotation)
        setStartTime(toLocalDateTimeInput(new Date()))
        setPlateNumbers([''])
        setPurchaseError('')
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('buyNow')
        setSearchParams(nextParams, { replace: true })
    }, [detailed, isCustomer, quotations, searchParams, setSearchParams])

    const openPurchaseForm = (quotation: QuotationDto) => {
        setSelectedQuotation(quotation)
        setStartTime(toLocalDateTimeInput(new Date()))
        setPlateNumbers([''])
        setPurchaseError('')
    }

    const submitPurchase = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedQuotation) return
        const plates = plateNumbers.map((plate) => plate.trim()).filter(Boolean)
        if (!plates.length) {
            setPurchaseError('Enter at least one license plate.')
            return
        }
        const parsedStartTime = new Date(startTime)
        if (!startTime || Number.isNaN(parsedStartTime.getTime())) {
            setPurchaseError('Choose a valid subscription start time.')
            return
        }

        setIsPurchasing(true)
        setPurchaseError('')
        try {
            await createSubscription({
                quotationId: selectedQuotation.id,
                startTime: parsedStartTime.toISOString(),
                plateNumbers: plates,
            })
            navigate('/customer/subscriptions')
        } catch (error) {
            setPurchaseError(error instanceof Error ? error.message : 'Unable to create subscription.')
        } finally {
            setIsPurchasing(false)
        }
    }

    const selectedVehicle = vehicleTypes.find(({ id }) => id === selectedVehicleType)
    const monthlyQuotations = quotations.filter(
        (quotation) => quotation.duration === 1 && quotation.durationUnit === 4,
    )
    const pricingCards = detailed
        ? quotations
            .filter((quotation) => quotation.vehicleType === selectedVehicleType)
            .map((quotation) => ({
                key: quotation.id.toString(),
                vehicleName: quotation.vehicleTypeName,
                quotation,
            }))
        : [1, 3, 5].map((vehicleType) => {
            const type = vehicleTypes.find((item) => item.id === vehicleType)
            const quotation = monthlyQuotations.find((item) => item.vehicleType === vehicleType) ?? null
            return {
                key: vehicleType.toString(),
                vehicleName: type?.label ?? 'Vehicle',
                quotation,
            }
        })

    return (
        <section id="pricing" className="pricing-section" aria-labelledby="pricing-heading">
            <header className="pricing-header">
                <h2 id="pricing-heading">Simple, flexible pricing</h2>
                <p>Choose the parking plan that fits your needs.</p>
                {detailed && (
                    <div className="pricing-vehicle-tabs" role="tablist" aria-label="Vehicle type">
                        {vehicleTypes.map((vehicleType) => (
                            <button
                                aria-selected={selectedVehicleType === vehicleType.id}
                                className={selectedVehicleType === vehicleType.id ? 'is-active' : ''}
                                id={`pricing-tab-${vehicleType.id}`}
                                key={vehicleType.id}
                                onClick={() => {
                                    setSelectedVehicleType(vehicleType.id)
                                    setSelectedQuotation(null)
                                    setPurchaseError('')
                                }}
                                role="tab"
                                type="button"
                            >
                                {vehicleType.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {isLoading ? (
                <p className="pricing-status" role="status">Loading parking prices...</p>
            ) : errorMessage ? (
                <div className="pricing-status pricing-error" role="alert">
                    <p>{errorMessage}</p>
                    <button type="button" onClick={() => void loadQuotations()}>Try again</button>
                </div>
            ) : detailed && pricingCards.length === 0 ? (
                <p className="pricing-status">
                    No parking prices are currently available for {selectedVehicle?.label}.
                </p>
            ) : (
                <div
                    aria-labelledby={detailed ? `pricing-tab-${selectedVehicleType}` : undefined}
                    className="pricing-cards"
                    role={detailed ? 'tabpanel' : undefined}
                >
                    {pricingCards.map(({ key, quotation, vehicleName }, index) => (
                        <article
                            className={`pricing-card${index === 1 ? ' is-featured' : ''}`}
                            key={key}
                        >
                            <h3>{detailed && quotation ? getDurationLabel(quotation) : vehicleName}</h3>
                            <p className="pricing-description">
                                {detailed ? `${vehicleName} parking` : 'Monthly parking'}
                            </p>
                            {detailed && quotation && (
                                <p className="pricing-plan-name">{getDurationLabel(quotation)}</p>
                            )}
                            <p className="pricing-amount">
                                <strong>
                                    {quotation
                                        ? currencyFormatter.format(quotation.price)
                                        : 'Currently unavailable'}
                                </strong>
                            </p>
                            {quotation && (detailed ? (
                                isCustomer ? (
                                    <button
                                        className="pricing-cta"
                                        type="button"
                                        onClick={() => openPurchaseForm(quotation)}
                                    >
                                        Buy Now
                                    </button>
                                ) : (
                                    <Link
                                        className="pricing-cta"
                                        to={`/login?quotationId=${quotation.id}`}
                                    >
                                        Buy Now
                                    </Link>
                                )
                            ) : (
                                <Link className="pricing-cta" to="/pricing">View plans</Link>
                            ))}
                            {detailed && quotation && selectedQuotation?.id === quotation.id && (
                                <form className="pricing-purchase-form" onSubmit={(event) => void submitPurchase(event)}>
                                    <label>
                                        Subscription start time
                                        <input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(event) => setStartTime(event.target.value)}
                                            required
                                        />
                                    </label>
                                    <fieldset>
                                        <legend>License plates</legend>
                                        {plateNumbers.map((plate, plateIndex) => (
                                            <div className="pricing-plate-input" key={plateIndex}>
                                                <label htmlFor={`pricing-plate-${quotation.id}-${plateIndex}`}>
                                                    Plate {plateIndex + 1}
                                                </label>
                                                <div>
                                                    <input
                                                        id={`pricing-plate-${quotation.id}-${plateIndex}`}
                                                        type="text"
                                                        value={plate}
                                                        onChange={(event) => setPlateNumbers((current) =>
                                                            current.map((value, index) => index === plateIndex ? event.target.value : value),
                                                        )}
                                                        placeholder="e.g. 30A-12345"
                                                        autoComplete="off"
                                                        required={plateIndex === 0}
                                                    />
                                                    {plateNumbers.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPlateNumbers((current) =>
                                                                current.filter((_, index) => index !== plateIndex),
                                                            )}
                                                            aria-label={`Remove plate ${plateIndex + 1}`}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            className="pricing-add-plate"
                                            type="button"
                                            onClick={() => setPlateNumbers((current) => [...current, ''])}
                                        >
                                            Add another plate
                                        </button>
                                    </fieldset>
                                    {purchaseError && <p className="pricing-purchase-error" role="alert">{purchaseError}</p>}
                                    <div className="pricing-purchase-actions">
                                        <button type="submit" disabled={isPurchasing}>
                                            {isPurchasing ? 'Submitting...' : 'Create subscription'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedQuotation(null)
                                                setPurchaseError('')
                                            }}
                                            disabled={isPurchasing}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default SectionPricing
