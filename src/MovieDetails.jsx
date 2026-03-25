import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TMDB_IMAGE_URLS, BASE_URL } from './constants/tmdb';
import Footer from './components/Footer';

function MovieDetails() {
  const { id, type } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(null);
  const [images, setImages] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('popcorniq_favorites') || '[]');
    setIsFavorite(favorites.some(f => f.id === parseInt(id)));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('popcorniq_favorites') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== parseInt(id));
    } else {
      newFavorites = [...favorites, movie];
    }
    localStorage.setItem('popcorniq_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    loadMovieDetails();
  }, [id, type]);

  const loadMovieDetails = async () => {
    try {
      const url = `${BASE_URL}/${type}/${id}?append_to_response=videos,credits,images`;
      const res = await fetch(url);
      const data = await res.json();

      setMovie(data);

      if (data.credits?.cast) {
        setCast(data.credits.cast.slice(0, 10));
      }

      if (data.credits?.crew) {
        const directorObj = data.credits.crew.find(c => c.job === 'Director');
        if (directorObj) {
          setDirector(directorObj);
        }
      }

      const allImages = [];
      if (data.images?.backdrops) {
        allImages.push(...data.images.backdrops.slice(0, 5));
      }
      if (data.images?.posters) {
        allImages.push(...data.images.posters.slice(0, 5));
      }
      setImages(allImages);

      if (data.videos?.results) {
        const trailer = data.videos.results.find(
          vid => vid.site === 'YouTube' && (vid.type === 'Trailer' || vid.type === 'Teaser')
        );
        setTrailerKey(trailer ? trailer.key : null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading movie details:', error);
      setLoading(false);
    }
  };

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 450;
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="loading-container">
        <p>Movie not found</p>
        <button onClick={() => navigate('/')} className="action-btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* NAVBAR */}
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/assets/images/PQ_Circular_Favicon.png" alt="logo" />
          <span className="logo-text">POPCORNIQ</span>
        </div>
        <nav className="sidebar">
          <ul>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>HIGHLIGHTS</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>TRENDING</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>MOVIES</a></li>
          </ul>
        </nav>
      </header>

      {/* TOP SECTION - Poster Left, Trailer Right */}
      <div className="details-top-banner">
        <div className="details-top-grid">
          {/* Left Column - Poster */}
          <div className="details-poster-box">
            <img
              src={`${TMDB_IMAGE_URLS.W500}${movie.poster_path}`}
              alt={movie.title || movie.name}
              className="details-poster-img"
              loading="eager"
            />
          </div>

          {/* Right Column - Trailer */}
          <div className="details-trailer-box">
            {trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?rel=0&modestbranding=1&iv_load_policy=3&autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&disablekb=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="no-trailer">No Trailer Available</div>
            )}
          </div>
        </div>

        {/* RED TITLE BAR */}
        <div className="movie-title-bar">
          <div className="title-bar-left">
            <h1 className="movie-name-header">{movie.title || movie.name}</h1>
            <div className="movie-meta-header">
              <span className="meta-item">{type === 'tv' ? 'Series' : 'Movies'}</span>
              <span className="meta-divider">-</span>
              <span className="meta-item">{movie.runtime ? `${movie.runtime} min` : (movie.episode_run_time && movie.episode_run_time[0] ? `${movie.episode_run_time[0]} min` : '—')}</span>
              <span className="meta-divider">-</span>
              <span className="meta-item">{(movie.release_date || movie.first_air_date || '').slice(0, 4) || '—'}</span>
            </div>
          </div>
          <div className="title-bar-right">
            <button className={`wishlist-action-btn ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>
              <span className="heart-icon">
                <svg 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? "#fff" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ width: '22px', height: '22px', marginRight: '5px' }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </span>
              {isFavorite ? 'In WatchList' : 'Add to WishList'}
            </button>
            <div className="rating-display">
              Rating : <strong>{movie.vote_average ? movie.vote_average.toFixed(1) : '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="details-container">
        {/* INFO GRID - Overview, Director, Genres, Details */}
        <div className="info-sections-grid">
          {/* Overview */}
          <div className="details-card overview-card">
            <h3 className="card-label">OVERVIEW</h3>
            <p className="card-text">{movie.overview || 'No description available.'}</p>
          </div>

          {/* Director */}
          <div className="details-card director-card">
            <h3 className="card-label">DIRECTOR</h3>
            <div className="director-name-badge">
              {director ? director.name : 'N/A'}
            </div>
          </div>

          {/* Genres */}
          <div className="details-card genres-card">
            <h3 className="card-label">GENRES</h3>
            <div className="genre-tags-container">
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.map(g => (
                  <span key={g.id} className="genre-pill">{g.name}</span>
                ))
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="details-card details-info-card">
            <h3 className="card-label">DETAILS</h3>
            <div className="nested-info-grid">
              {movie.budget > 0 && (
                <div className="info-item"><strong>Budget:</strong> ${(movie.budget / 1000000).toFixed(1)}M</div>
              )}
              {movie.revenue > 0 && (
                <div className="info-item"><strong>Revenue:</strong> ${(movie.revenue / 1000000).toFixed(1)}M</div>
              )}
              {movie.popularity && (
                <div className="info-item"><strong>Popularity:</strong> {movie.popularity.toFixed(1)}</div>
              )}
              {movie.original_language && (
                <div className="info-item"><strong>Language:</strong> {movie.original_language.toUpperCase()}</div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="details-card full-width-card cast-section-card">
            <h3 className="card-label">CAST</h3>
            <div className="cast-scroll-container">
              {cast.map(actor => (
                <div key={actor.id} className="cast-member-item">
                  <div className="actor-image-wrapper">
                    {actor.profile_path ? (
                      <img
                        src={`${TMDB_IMAGE_URLS.W185}${actor.profile_path}`}
                        alt={actor.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="actor-placeholder">?</div>
                    )}
                  </div>
                  <h4 className="actor-name">{actor.name}</h4>
                  <p className="actor-role">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery Section */}
        {images.length > 0 && (
          <div className="details-card full-width-card gallery-section-card">
            <h3 className="card-label">IMAGE GALLERY</h3>
            <div className="gallery-slider-wrapper">
              <button className="gallery-nav-btn prev" onClick={() => scrollGallery('left')}>‹</button>
              <div className="gallery-slider-content" ref={galleryRef}>
                {images.map((img, idx) => (
                  <div key={idx} className="gallery-slide-item" onClick={() => setSelectedGalleryImage(img)}>
                    <img
                      src={`${TMDB_IMAGE_URLS.W500}${img.file_path}`}
                      alt={`Gallery ${idx}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <button className="gallery-nav-btn next" onClick={() => scrollGallery('right')}>›</button>
            </div>
          </div>
        )}
      </div>

      <Footer onNavClick={(tab) => navigate(tab === 'home' ? '/' : '/watchlist')} />

      {/* Gallery Image Lightbox Modal */}
      {selectedGalleryImage && (
        <div className="gallery-modal-overlay" onClick={() => setSelectedGalleryImage(null)}>
          <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={() => setSelectedGalleryImage(null)}>&times;</button>
            <img
              src={`${TMDB_IMAGE_URLS.ORIGINAL}${selectedGalleryImage.file_path}`}
              alt="Gallery Preview"
              className="gallery-modal-image"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
