function Hero() {
  return (
    <section className="hero" id="trang-chu">
      <div className="container hero-content">
        <div className="hero-copy">
          <p className="section-kicker">Nền tảng đỗ xe thông minh</p>
          <h1>Đỗ xe dễ dàng<br /><span>Cuộc sống thuận tiện hơn</span></h1>
          <p className="hero-description">Giải pháp quản lý bãi đỗ xe thông minh, an toàn và hiện đại.<br />Đặt chỗ, theo dõi tình trạng bãi, thanh toán nhanh chóng - tất cả trong một.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/login">Bắt đầu ngay <span aria-hidden="true">→</span></a>
            <a className="button button-light" href="#huong-dan">Tìm hiểu thêm <span aria-hidden="true">›</span></a>
          </div>
          <div className="hero-benefits">
            <div><span className="benefit-icon benefit-green">ϟ</span><strong>Nhanh chóng</strong><small>Chỉ vài thao tác</small></div>
            <div><span className="benefit-icon benefit-teal">✓</span><strong>An toàn</strong><small>Giám sát 24/7</small></div>
            <div><span className="benefit-icon benefit-blue">▣</span><strong>Tiện lợi</strong><small>Mọi lúc, mọi nơi</small></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="Bãi đỗ xe ParkingSystem">
          <div className="hero-image" />
          <div className="occupancy-card"><span className="car-icon">▰</span><div><b>Còn trống</b><strong>27 / 40 chỗ</strong><span className="occupancy-bar"><i /></span></div></div>
          <div className="location-card"><span className="pin">●</span><div><strong>Bãi xe Trung tâm</strong><small>Số 123, Đường ABC, Quận 1</small><div className="location-stats"><span>◉ <b>27/40</b></span><span>⌁ <b>56/60</b></span><span>◷ <b>24/7</b></span></div></div></div>
          <span className="garage-label">B1</span>
        </div>
      </div>
    </section>
  )
}

export default Hero