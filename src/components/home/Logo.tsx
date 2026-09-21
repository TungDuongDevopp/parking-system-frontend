type LogoProps = {
  light?: boolean;
}

function Logo({ light = false }: LogoProps) {
  return (
    <a className={`site-logo${light ? ' site-logo-light' : ''}`} href="/" aria-label="ParkingSystem - Trang chu">
      <span className="logo-mark" aria-hidden="true">P</span>
      <span className="logo-name">Parking<span>System</span></span>
    </a>
  )
}

export default Logo