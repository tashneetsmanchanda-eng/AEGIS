import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🌊</span>
          <div className="logo-text">
            <h1>Disaster <span className="accent">Prediction</span> Model</h1>
            <span className="tagline">AI-Powered Risk Assessment System</span>
          </div>
        </div>
        
        <nav className="nav">
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="nav-link">
            📚 API Docs
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header
