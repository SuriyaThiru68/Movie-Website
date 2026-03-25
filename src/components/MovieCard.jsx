import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TMDB_IMAGE_URLS } from '../constants/tmdb';

const HeartIcon = ({ filled, color }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill={filled ? "#ff3f33" : "none"} 
    stroke={filled ? "#ff3f33" : "#ccc"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ width: '22px', height: '22px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const MovieCard = ({ movie, type = 'movie', isFavorite, onToggleFavorite }) => {
  if (!movie || !movie.poster_path) return null;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movie/${type}/${movie.id}`);
  };

  return (
    <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={`${TMDB_IMAGE_URLS.W342}${movie.poster_path}`} 
          alt={movie.title || movie.name} 
          loading="lazy"
        />
        {isFavorite && (
          <span className="watchlist-badge" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '5px', display: 'flex' }}>
            <HeartIcon filled />
          </span>
        )}
      </div>
      <h3>{movie.title || movie.name}</h3>
      <p><strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)}</p>
      <div className="ratings">
        <button
          onClick={(e) => onToggleFavorite?.(e, movie)}
          className="wishlist-btn-transparent"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
