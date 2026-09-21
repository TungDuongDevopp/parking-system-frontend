function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container stats-layout">
        <div className="stats-copy"><h2>Không chỉ là <span>chỗ đỗ xe</span></h2><p>Chúng tôi mang đến trải nghiệm đỗ xe thông minh, giúp bạn tiết kiệm thời gian và tập trung vào những điều quan trọng hơn.</p><div className="stat-list"><div><strong>5+</strong><small>Bãi xe đang hoạt động</small></div><div><strong>2,000+</strong><small>Lượt xe mỗi ngày</small></div><div><strong>99%</strong><small>Khách hàng hài lòng</small></div></div></div>
        <div className="phone-preview"><div className="phone"><div className="phone-top" /><div className="map-grid"><span className="map-pin">P</span><span className="map-road road-one" /><span className="map-road road-two" /></div><div className="phone-bottom">▣</div></div><div className="preview-car">▰</div><span className="map-tooltip">Tìm chỗ trống gần bạn</span></div>
      </div>
    </section>
  )
}

export default StatsSection