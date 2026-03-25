import React from 'react';

const Footer = ({ onNavClick }) => {
  return (
    <footer className="mockup-footer">
      <div className="footer-brand">
        <h1 className="footer-logo-text" onClick={() => onNavClick?.('home')} style={{ cursor: 'pointer' }}>POPCORNIQ</h1>
        <p className="footer-tagline">Explore movies, TV shows, cast & crew details. Discover cinema like never before.</p>
      </div>
      <div className="footer-nav-links">
        <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onNavClick?.('home', 'trending'); }}>Trending</a>
        <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onNavClick?.('home', 'movies'); }}>Movies</a>
        <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onNavClick?.('watchlist'); }}>Watchlist</a>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
