import { useEffect, useState } from 'react'
import {
    IconArrowLeft,
    IconBuildingBank,
    IconCheck,
    IconCreditCard,
    IconCube,
    IconQrcode,
    IconShieldCheck,
    IconUser,
    IconWallet,
} from '@tabler/icons-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getSubscriptionById } from '../services/subscriptionService'
import type { SubscriptionDto } from '../types/Subscription/subscription'
import {
    checkoutPaymentMethodValue,
    type CheckoutPaymentMethod,
} from '../types/Payment/payment'
import bankQrCode from '../assets/QR.jpg'
import '../resources/css/subscription-checkout.scss'

type CheckoutLocationState = {
    subscription?: SubscriptionDto
}

const paymentMethods: {
    id: CheckoutPaymentMethod
    title: string
    description: string
    icon: typeof IconCreditCard
}[] = [
    {
        id: 'card',
        title: 'Thẻ Visa / Mastercard',
        description: 'Thanh toán bằng thẻ quốc tế',
        icon: IconCreditCard,
    },
    {
        id: 'bank',
        title: 'Chuyển khoản ngân hàng',
        description: 'Thanh toán qua ngân hàng hỗ trợ',
        icon: IconBuildingBank,
    },
    {
        id: 'qr',
        title: 'Ví điện tử / Quét mã QR',
        description: 'Thanh toán qua ví điện tử hoặc mã QR',
        icon: IconQrcode,
    },
]

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
})

const formatAmount = (subscription: SubscriptionDto) =>
    currencyFormatter.format(subscription.price)

const formatSubscriptionReference = (subscriptionId: number) =>
    `PARKING SUB${String(subscriptionId).padStart(6, '0')}`

const CustomerSubscriptionCheckout = () => {
    const { subscriptionId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const routeState = location.state as CheckoutLocationState | null
    const [subscription, setSubscription] = useState<SubscriptionDto | null>(() =>
        routeState?.subscription?.id === Number(subscriptionId)
            ? routeState.subscription
            : null,
    )
    const [isLoading, setIsLoading] = useState(!subscription)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectedMethod, setSelectedMethod] = useState<CheckoutPaymentMethod>('card')
    const [mockupMessage, setMockupMessage] = useState('')
    const [cardDetails, setCardDetails] = useState({
        number: '1234 5678 9012 3456',
        expiry: '',
        cvv: '',
        holder: '',
        address: '',
        address2: '',
        province: 'Việt Nam',
        city: 'Hà Nội',
        postalCode: '100102',
        saveCard: true,
    })

    const updateCardDetails = (field: keyof typeof cardDetails, value: string | boolean) => {
        setCardDetails((current) => ({ ...current, [field]: value }))
    }

    useEffect(() => {
        if (subscription || !subscriptionId || !/^[1-9]\d*$/.test(subscriptionId)) {
            if (!subscription && subscriptionId) {
                setErrorMessage('Không tìm thấy thông tin gói dịch vụ.')
                setIsLoading(false)
            }
            return
        }

        let isCurrent = true
        setIsLoading(true)
        setErrorMessage('')
        void getSubscriptionById({ Id: Number(subscriptionId) })
            .then((result) => {
                if (isCurrent) setSubscription(result)
            })
            .catch((error: unknown) => {
                if (isCurrent) {
                    setErrorMessage(error instanceof Error
                        ? error.message
                        : 'Không thể tải thông tin gói dịch vụ.')
                }
            })
            .finally(() => {
                if (isCurrent) setIsLoading(false)
            })

        return () => {
            isCurrent = false
        }
    }, [subscription, subscriptionId])

    return (
        <main className="subscription-checkout-page">
            <div className="subscription-checkout-shell">
                <header className="subscription-checkout-topbar">
                    <button
                        type="button"
                        className="subscription-checkout-back"
                        onClick={() => navigate('/customer/subscriptions')}
                    >
                        <IconArrowLeft size={16} aria-hidden="true" />
                        Quay lại gói dịch vụ
                    </button>
                    <span className="subscription-checkout-secure">
                        <IconShieldCheck size={16} aria-hidden="true" />
                        Secure checkout
                    </span>
                </header>

                <section className="subscription-checkout-content" aria-labelledby="checkout-heading">
                    <h1 id="checkout-heading">Hoàn tất thanh toán</h1>
                    <p className="subscription-checkout-intro">
                        Chọn phương thức thanh toán phù hợp với bạn.
                    </p>

                    {isLoading ? (
                        <p className="subscription-checkout-state" role="status">
                            Đang tải thông tin gói dịch vụ...
                        </p>
                    ) : errorMessage ? (
                        <div className="subscription-checkout-state subscription-checkout-error" role="alert">
                            <p>{errorMessage}</p>
                            <button type="button" onClick={() => navigate('/customer/subscriptions')}>
                                Quay lại danh sách gói
                            </button>
                        </div>
                    ) : subscription ? (
                        <>
                            <div className="subscription-checkout-summary">
                                <article className="subscription-checkout-summary-card">
                                    <IconCube size={20} aria-hidden="true" />
                                    <span>GÓI DỊCH VỤ</span>
                                    <strong>{subscription.vehicleTypeName}</strong>
                                    <p>
                                        {subscription.duration} {subscription.durationUnitName}
                                    </p>
                                </article>
                                <article className="subscription-checkout-summary-card is-total">
                                    <IconWallet size={20} aria-hidden="true" />
                                    <span>TỔNG THANH TOÁN</span>
                                    <strong>{formatAmount(subscription)}</strong>
                                    <p>VND</p>
                                </article>
                            </div>

                            <section className="subscription-checkout-methods" aria-labelledby="payment-methods-heading">
                                <h2 id="payment-methods-heading">Phương thức thanh toán</h2>
                                <div className="subscription-checkout-method-list">
                                    {paymentMethods.map(({ id, title, description, icon: MethodIcon }) => (
                                        <button
                                            type="button"
                                            key={id}
                                            className={`subscription-checkout-method${selectedMethod === id ? ' is-selected' : ''}`}
                                            aria-pressed={selectedMethod === id}
                                            data-payment-method={checkoutPaymentMethodValue[id]}
                                            onClick={() => {
                                                setSelectedMethod(id)
                                                setMockupMessage('')
                                            }}
                                        >
                                            <span className="subscription-checkout-method-icon">
                                                <MethodIcon size={20} aria-hidden="true" />
                                            </span>
                                            <span className="subscription-checkout-method-copy">
                                                <strong>{title}</strong>
                                                <small>{description}</small>
                                                {id === 'card' && (
                                                    <span className="subscription-checkout-card-brands" aria-label="Visa and Mastercard">
                                                        <b>VISA</b>
                                                        <b>Mastercard</b>
                                                    </span>
                                                )}
                                            </span>
                                            <span className="subscription-checkout-radio" aria-hidden="true">
                                                {selectedMethod === id && <IconCheck size={13} />}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {selectedMethod === 'card' && (
                                <section className="subscription-checkout-card-form" aria-labelledby="card-details-heading">
                                    <div className="subscription-checkout-card-form-heading">
                                        <div>
                                            <span>Thanh toán bằng thẻ</span>
                                            <h2 id="card-details-heading">Thông tin thẻ</h2>
                                        </div>
                                        <div className="subscription-checkout-card-brand" aria-hidden="true">VISA</div>
                                    </div>

                                    <div className="subscription-checkout-card-layout">
                                        <div className="subscription-checkout-card-fields">
                                            <label>
                                                Số thẻ
                                                <span className="subscription-checkout-input-wrap">
                                                    <IconCreditCard size={18} aria-hidden="true" />
                                                    <input
                                                        inputMode="numeric"
                                                        aria-label="Số thẻ"
                                                        value={cardDetails.number}
                                                        onChange={(event) => updateCardDetails('number', event.target.value)}
                                                    />
                                                </span>
                                            </label>
                                            <div className="subscription-checkout-field-grid">
                                                <label>
                                                    Ngày hết hạn
                                                    <input
                                                        placeholder="MM / YY"
                                                        value={cardDetails.expiry}
                                                        onChange={(event) => updateCardDetails('expiry', event.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    CVV
                                                    <input
                                                        inputMode="numeric"
                                                        placeholder="123"
                                                        value={cardDetails.cvv}
                                                        onChange={(event) => updateCardDetails('cvv', event.target.value)}
                                                    />
                                                </label>
                                            </div>
                                            <label>
                                                Tên chủ thẻ
                                                <span className="subscription-checkout-input-wrap">
                                                    <IconUser size={18} aria-hidden="true" />
                                                    <input
                                                        placeholder="NGUYEN VAN A"
                                                        value={cardDetails.holder}
                                                        onChange={(event) => updateCardDetails('holder', event.target.value)}
                                                    />
                                                </span>
                                            </label>
                                        </div>

                                        <div className="subscription-checkout-card-preview" aria-label="Thẻ Visa mẫu">
                                            <div className="subscription-checkout-card-preview-top">
                                                <span>PLARK</span>
                                                <b>VISA</b>
                                            </div>
                                            <p>{cardDetails.number || '•••• •••• •••• ••••'}</p>
                                            <div>
                                                <span>
                                                    <small>CHỦ THẺ</small>
                                                    <strong>{cardDetails.holder || 'NGUYEN VAN A'}</strong>
                                                </span>
                                                <span>
                                                    <small>HẾT HẠN</small>
                                                    <strong>{cardDetails.expiry || 'MM/YY'}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="subscription-checkout-billing-heading">
                                        <h3>Địa chỉ thanh toán</h3>
                                        <p>Chỉ dùng cho giao diện minh hoạ, không lưu dữ liệu.</p>
                                    </div>
                                    <div className="subscription-checkout-address-grid">
                                        <label>
                                            Quốc gia / khu vực
                                            <input
                                                value={cardDetails.province}
                                                onChange={(event) => updateCardDetails('province', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Thành phố
                                            <input
                                                value={cardDetails.city}
                                                onChange={(event) => updateCardDetails('city', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Địa chỉ 1
                                            <input
                                                placeholder="Số nhà, tên đường"
                                                value={cardDetails.address}
                                                onChange={(event) => updateCardDetails('address', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Địa chỉ 2 (tuỳ chọn)
                                            <input
                                                placeholder="Toà nhà, căn hộ"
                                                value={cardDetails.address2}
                                                onChange={(event) => updateCardDetails('address2', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Mã bưu chính
                                            <input
                                                value={cardDetails.postalCode}
                                                onChange={(event) => updateCardDetails('postalCode', event.target.value)}
                                            />
                                        </label>
                                    </div>
                                    <label className="subscription-checkout-save-card">
                                        <input
                                            type="checkbox"
                                            checked={cardDetails.saveCard}
                                            onChange={(event) => updateCardDetails('saveCard', event.target.checked)}
                                        />
                                        Lưu thông tin thẻ cho lần thanh toán sau
                                    </label>
                                </section>
                            )}

                            {selectedMethod === 'bank' && subscription && (
                                <section className="subscription-checkout-bank-transfer" aria-labelledby="bank-transfer-heading">
                                    <div className="subscription-checkout-bank-heading">
                                        <span className="subscription-checkout-bank-heading-icon">
                                            <IconBuildingBank size={21} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 id="bank-transfer-heading">Chuyển khoản ngân hàng</h2>
                                            <p>Quét mã QR bằng ứng dụng ngân hàng</p>
                                        </div>
                                        <span className="subscription-checkout-demo-badge">Mô phỏng</span>
                                    </div>

                                    <div className="subscription-checkout-bank-content">
                                        <div className="subscription-checkout-bank-details">
                                            <div>
                                                <span>Ngân hàng</span>
                                                <strong>BIDV</strong>
                                            </div>
                                            <div>
                                                <span>Chủ tài khoản</span>
                                                <strong>ĐẶNG VĂN TÙNG DƯƠNG</strong>
                                            </div>
                                            <div>
                                                <span>Số tài khoản</span>
                                                <strong>2154857009</strong>
                                            </div>
                                            <div className="subscription-checkout-transfer-box">
                                                <span>Số tiền chuyển khoản</span>
                                                <strong>{formatAmount(subscription)}</strong>
                                                <span>Nội dung chuyển khoản</span>
                                                <b>{formatSubscriptionReference(subscription.id)}</b>
                                            </div>
                                        </div>

                                        <div className="subscription-checkout-bank-qr" aria-label="Mã QR chuyển khoản minh hoạ">
                                            <img
                                                src={bankQrCode}
                                                alt="Mã QR chuyển khoản BIDV"
                                                className="subscription-checkout-qr-image"
                                            />
                                            <strong>Mã QR chuyển khoản</strong>
                                        </div>
                                    </div>

                                    <p className="subscription-checkout-bank-note">
                                        Sau khi chuyển khoản, hệ thống sẽ xác nhận giao dịch theo quy trình thanh toán được tích hợp.
                                    </p>
                                </section>
                            )}

                            {selectedMethod === 'qr' && (
                                <div className="subscription-checkout-alternative-note">
                                    Mã QR minh hoạ sẽ hiển thị tại bước kế tiếp.
                                </div>
                            )}

                            <aside className="subscription-checkout-safety">
                                <IconShieldCheck size={17} aria-hidden="true" />
                                <strong>Thanh toán an toàn</strong>
                                <p>
                                    Đây là form minh hoạ. Dữ liệu nhập không được lưu, gửi lên máy chủ hoặc xử lý thanh toán.
                                </p>
                            </aside>

                            {mockupMessage && (
                                <p className="subscription-checkout-mockup-note" role="status">
                                    {mockupMessage}
                                </p>
                            )}
                            <button
                                type="button"
                                className="subscription-checkout-continue"
                                onClick={() => setMockupMessage(
                                    'Đây là giao diện minh hoạ. Tính năng thanh toán sẽ được tích hợp sau.',
                                )}
                            >
                                {selectedMethod === 'bank' ? 'Chờ xác nhận thanh toán' : 'Tiếp tục thanh toán'}
                            </button>
                        </>
                    ) : null}
                </section>

                <p className="subscription-checkout-footnote">
                    Giao diện minh họa · Giá và trạng thái sẽ lấy từ dữ liệu thực tế
                </p>
            </div>
        </main>
    )
}

export default CustomerSubscriptionCheckout
