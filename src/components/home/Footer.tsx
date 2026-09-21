import Logo from './Logo'

function Footer() {
  return <footer className="site-footer" id="lien-he"><div className="container footer-grid"><div className="footer-brand"><Logo /><p>Hệ thống quản lý bãi đỗ xe thông minh</p><div className="social-links"><a href="#facebook" aria-label="Facebook">f</a><a href="#youtube" aria-label="Youtube">▶</a><a href="#instagram" aria-label="Instagram">◎</a></div></div><div><h2>Liên kết nhanh</h2><a href="#trang-chu">Trang chủ</a><a href="#bang-gia">Bảng giá</a><a href="#huong-dan">Hướng dẫn</a><a href="#lien-he">Liên hệ</a></div><div><h2>Hỗ trợ</h2><a href="#faq">Câu hỏi thường gặp</a><a href="#policy">Chính sách bảo mật</a><a href="#terms">Điều khoản sử dụng</a></div><div><h2>Liên hệ</h2><p>⌖ 123, Đường ABC, Quận 1, TP.HCM</p><p>◔ 0123 456 789</p><p>✉ support@parkingsystem.vn</p></div></div><div className="container copyright">© 2026 ParkingSystem. All rights reserved.</div></footer>
}

export default Footer