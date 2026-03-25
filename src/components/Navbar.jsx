import React from 'react';

const Navbar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchClick, 
  onSearchKeyPress, 
  onNavClick 
}) => {
  return (
    <header className="header">
      <div className="logo" onClick={() => onNavClick?.('home')}>
        <img src="/assets/images/PQ_Circular_Favicon.png" alt="logo" />
        <span className="logo-text">POPCORNIQ</span>
      </div>

      <div className="nav-search-container">
        <div className="nav-search-bar">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={onSearchKeyPress}
          />
          <button onClick={onSearchClick}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>

      <nav className="sidebar">
        <ul style={{ alignItems: 'center' }}>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavClick?.('home', 'MovieHighlights'); }}>HIGHLIGHTS</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavClick?.('home', 'trending'); }}>TRENDING</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavClick?.('home', 'movies'); }}>MOVIES</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavClick?.('watchlist'); }}>WATCHLIST</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default React.memo(Navbar);
