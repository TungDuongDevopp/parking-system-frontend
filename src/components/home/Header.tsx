import { useState } from 'react'
import Logo from './Logo'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Dieu huong chinh">
          <a className="active" href="#trang-chu" onClick={() => setMenuOpen(false)}>Trang chủ</a>
          <a href="#bang-gia" onClick={() => setMenuOpen(false)}>Bảng giá</a>
          <a href="#huong-dan" onClick={() => setMenuOpen(false)}>Hướng dẫn</a>
          <a href="#lien-he" onClick={() => setMenuOpen(false)}>Liên hệ</a>
        </nav>
        <div className="header-actions">
          <button className="search-button" type="button" aria-label="Tìm kiếm">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4.2 4.2" /></svg>
          </button>
          <a className="button button-outline button-small" href="/login">Đăng nhập</a>
          <a className="button button-primary button-small header-register" href="/register">Đăng ký</a>
        </div>
        <button className="menu-toggle" type="button" aria-label="Mở menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

export default Header