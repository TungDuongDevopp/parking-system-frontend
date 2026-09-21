const features = [
  { icon: '⌖', title: 'Tìm bãi xe', text: 'Xem vị trí, tình trạng bãi xe trong thời gian thực', tone: 'blue' },
  { icon: '▤', title: 'Thanh toán linh hoạt', text: 'Hỗ trợ nhiều phương thức thanh toán', tone: 'cyan' },
  { icon: '▥', title: 'Quản lý minh bạch', text: 'Lịch sử ra vào, hóa đơn rõ ràng', tone: 'indigo' },
  { icon: '♧', title: 'Phù hợp mọi đối tượng', text: 'Cá nhân, doanh nghiệp, tổ chức', tone: 'sky' },
]

function FeatureGrid() {
  return (
    <section className="feature-section" id="huong-dan">
      <div className="container feature-grid">
        {features.map((feature) => <article className="feature-card" key={feature.title}><span className={`feature-icon ${feature.tone}`}>{feature.icon}</span><h2>{feature.title}</h2><p>{feature.text}</p></article>)}
      </div>
    </section>
  )
}

export default FeatureGrid