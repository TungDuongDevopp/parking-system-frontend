import { useState, type FormEvent } from 'react'
import {
  IconBuildingBank,
  IconCar,
  IconCheck,
  IconCreditCard,
  IconInfoCircle,
  IconQrcode,
  IconSearch,
  IconShieldCheck,
  IconTicket,
  IconWallet,
  IconX,
} from '@tabler/icons-react'
import type { CheckOutResponse, SessionDto } from '../types/Session/session'
import {
  checkoutPaymentMethodValue,
  type CheckoutPaymentMethod,
} from '../types/Payment/payment'
import { checkOut, getActiveSession } from '../services/sessionService'
import carValueIcon from '../assets/car-price-car-value-svgrepo-com.svg'
import bankQrCode from '../assets/QR.jpg'
import '../resources/css/design-system.scss'
import '../resources/css/dashboard.scss'
import '../resources/css/staffCheckout.scss'

type StaffCheckoutProps = {
  onClose: () => void
}

const formatCurrency = (amount: number | null) =>
  amount == null ? 'Chưa xác định' : `${new Intl.NumberFormat('vi-VN').format(amount)} đ`

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const StaffCheckout = ({ onClose }: StaffCheckoutProps) => {
  const [plateNumber, setPlateNumber] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [session, setSession] = useState<SessionDto | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [checkout, setCheckout] = useState<CheckOutResponse | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod>('qr')

  const findSession = async () => {
    const plate = plateNumber.trim()
    const id = sessionId.trim()

    if (!plate && !id) {
      setSession(null)
      setMessage('Vui lòng nhập biển số xe hoặc mã phiên.')
      return
    }

    setIsLoading(true)
    setSession(null)
    setMessage('')

    try {
      const result = await getActiveSession({
        plateNumber: plate ? plate.toUpperCase() : null,
        id: id ? Number(id) : null,
      })
      setSession(result)
      setMessage('Đã tìm thấy phiên đang hoạt động.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tìm phiên gửi xe.')
    } finally {
      setIsLoading(false)
    }
  }

  const paySession = async () => {
    if (!session) return

    setIsPaying(true)
    setMessage('')

    try {
      const result = await checkOut({
        id: session.id,
        paymentMethod: checkoutPaymentMethodValue[selectedPaymentMethod],
      })
      setCheckout(result)
      setSession((current) => current ? {
        ...current,
        fee: result.fee,
        exitTime: result.exitTime,
        status: result.status,
        parkingSessionStatusName: result.parkingSessionStatusName,
      } : current)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể thanh toán phiên gửi xe.')
    } finally {
      setIsPaying(false)
    }
  }

  const handlePlateSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void findSession()
  }

  return (
    <div
      className="checkout-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="checkout-modal checkout-modal-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <button className="checkout-modal-close" type="button" onClick={onClose} aria-label="Đóng">
          <IconX size={24} />
        </button>

        <div className="checkout-heading">
          <img className="checkout-heading-icon" src={carValueIcon} alt="" />
          <div className="checkout-heading-copy">
            <h2 id="checkout-title">Tìm phiên cần thanh toán</h2>
            <p>Nhập biển số hoặc mã phiên để tra cứu thông tin xe.</p>
          </div>
        </div>

        {!checkout ? (
          <>
            <form className="checkout-form" onSubmit={handlePlateSearch}>
          <label className="checkout-field" htmlFor="checkout-plate">
            <span>Biển số xe</span>
            <span className="checkout-input-wrap">
              <IconCar className="checkout-input-icon" size={28} stroke={1.7} aria-hidden="true" />
              <input
                id="checkout-plate"
                value={plateNumber}
                onChange={(event) => {
                  setPlateNumber(event.target.value)
                  setSession(null)
                  setCheckout(null)
                  setMessage('')
                }}
                placeholder="Ví dụ: 29A-12345"
                autoComplete="off"
                disabled={isLoading}
              />
            </span>
          </label>

          <label className="checkout-field" htmlFor="checkout-session-id">
            <span>Mã phiên</span>
            <span className="checkout-input-wrap">
              <IconTicket className="checkout-input-icon" size={28} stroke={1.7} aria-hidden="true" />
              <input
                id="checkout-session-id"
                value={sessionId}
                onChange={(event) => {
                  setSessionId(event.target.value)
                  setSession(null)
                  setCheckout(null)
                  setMessage('')
                }}
                placeholder="Ví dụ: 1001"
                inputMode="numeric"
                autoComplete="off"
                disabled={isLoading}
              />
            </span>
          </label>

          <div className={`checkout-lookup-note${message ? ' has-message' : ''}`} role="status" aria-live="polite">
            <IconInfoCircle size={22} stroke={1.8} aria-hidden="true" />
            <span>{isLoading ? 'Đang tìm phiên gửi xe...' : message || 'Có thể tra cứu bằng biển số hoặc mã phiên.'}</span>
          </div>

          <div className="checkout-actions">
            <button className="ps-btn checkout-search" type="submit" disabled={isLoading || Boolean(session)}>
              <IconSearch size={22} /> Tìm phiên
            </button>
            <button
              className="ps-btn ps-btn-primary checkout-payment"
              type="button"
              onClick={() => void paySession()}
              disabled={!session || isLoading || isPaying}
            >
              <IconWallet size={22} /> {isPaying ? 'Đang thanh toán...' : 'Thanh toán'}
            </button>
          </div>
        </form>

        {session && (
          <section className="checkout-session-result" aria-label="Thông tin phiên gửi xe">
            <div className="checkout-session-result-heading">
              <span className="checkout-session-result-icon"><IconCheck size={20} /></span>
              <div>
                <h3>Phiên đang hoạt động</h3>
                <p>{session.plateNumber || 'Chưa có biển số'}</p>
              </div>
            </div>
            <dl className="checkout-session-details">
              <div><dt>Mã phiên</dt><dd>{session.ticketCode || `#${session.id}`}</dd></div>
              <div><dt>Khu vực</dt><dd>{session.parkingAreaCode || '—'}</dd></div>
              <div><dt>Chỗ đỗ</dt><dd>{session.parkingSpotCode || '—'}</dd></div>
              <div><dt>Giờ vào</dt><dd>{formatDateTime(session.entryTime)}</dd></div>
              <div className="checkout-session-fee"><dt>Phí hiện tại</dt><dd>{formatCurrency(session.fee)}</dd></div>
            </dl>
          </section>
        )}
          </>
        ) : (
          <div className="checkout-payment-panel">
            <div className="checkout-payment-heading">
              <div>
                <span>Đơn thanh toán phiên</span>
                <h3>Hoàn tất thanh toán</h3>
              </div>
              <span className="checkout-payment-status">
                <IconShieldCheck size={18} /> Chờ thanh toán
              </span>
            </div>

            <div className="checkout-payment-summary">
              <div>
                <span>Biển số xe</span>
                <strong>{checkout.plateNumber || session?.plateNumber || '—'}</strong>
              </div>
              <div className="checkout-payment-total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(checkout.fee)}</strong>
              </div>
            </div>

            <h3 className="checkout-payment-method-title">Phương thức thanh toán</h3>
            <div className="checkout-payment-methods" role="radiogroup" aria-label="Phương thức thanh toán">
              {([
                { id: 'card', title: 'Thẻ', icon: IconCreditCard },
                { id: 'bank', title: 'Ngân hàng', icon: IconBuildingBank },
                { id: 'qr', title: 'Ví QR', icon: IconQrcode },
              ] as const).map(({ id, title, icon: MethodIcon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selectedPaymentMethod === id}
                  className={selectedPaymentMethod === id ? 'is-selected' : ''}
                  onClick={() => setSelectedPaymentMethod(id)}
                >
                  <MethodIcon size={19} />
                  {title}
                </button>
              ))}
            </div>

            {selectedPaymentMethod === 'qr' && (
              <div className="checkout-payment-qr">
                <img src={bankQrCode} alt="Mã QR thanh toán" />
                <div>
                  <span>Số tiền</span>
                  <strong>{formatCurrency(checkout.fee)}</strong>
                  <span>Mã tham chiếu</span>
                  <b>{checkout.transactionCode || `PARKING-${checkout.ticketCode}`}</b>
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'bank' && (
              <div className="checkout-payment-transfer">
                <span>Chuyển khoản</span>
                <strong>BIDV · 2154857009</strong>
                <b>{formatCurrency(checkout.fee)}</b>
              </div>
            )}

            {selectedPaymentMethod === 'card' && (
              <div className="checkout-payment-card-note">
                <IconCreditCard size={20} /> Thông tin thẻ sẽ được xử lý tại cổng thanh toán.
              </div>
            )}

            <button className="ps-btn ps-btn-primary checkout-payment-confirm" type="button" onClick={onClose}>
              <IconCheck size={19} /> Hoàn tất
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default StaffCheckout
