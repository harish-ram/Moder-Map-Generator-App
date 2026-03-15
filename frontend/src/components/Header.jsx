import React, { useState } from 'react';
import { Bell, Settings, PanelLeftClose, MapPinned, UserCircle2 } from 'lucide-react';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="app-header">
      <div className="header-shell">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">
            <MapPinned size={18} />
          </div>
          <div className="header-brand-copy">
            <h1 className="header-title">Map Poster Studio</h1>
            <p className="header-subtitle">Create premium city map posters in minutes</p>
          </div>
        </div>

        <button
          className="header-menu-btn"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <PanelLeftClose size={18} />
        </button>

        <div className={`header-right ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="header-nav" aria-label="Primary navigation">
            <a href="#workspace" className="header-link" onClick={closeMobileMenu}>
              Workspace
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="header-link" onClick={closeMobileMenu}>
              Docs
            </a>
            <a href="#" className="header-link" onClick={closeMobileMenu}>
              Templates
            </a>
          </nav>

          <div className="header-actions">
            <button type="button" className="header-icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button type="button" className="header-icon-btn" aria-label="Settings">
              <Settings size={16} />
            </button>
            <button type="button" className="header-profile" aria-label="User profile">
              <UserCircle2 size={16} />
              <span>Haris</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;
