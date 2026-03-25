import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TMDB_ENDPOINTS, TMDB_IMAGE_URLS, fetchTMDB } from './constants/tmdb';

// Modular Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MovieCard from './components/MovieCard';

const MovieDetails = lazy(() => import('./MovieDetails'));

function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [carouselItems, setCarouselItems] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('popcorniq_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);

  useEffect(() => {
    localStorage.setItem('popcorniq_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const loadAllMovies = useCallback(async () => {
    setLoading(true);
    try {
      const [
        carouselData,
        topRatedData,
        nowPlayingData,
        upcomingData,
        trendingData,
        tvShowsData,
        genresData
      ] = await Promise.all([
        fetchTMDB(TMDB_ENDPOINTS.DISCOVER),
        fetchTMDB(TMDB_ENDPOINTS.TOP_RATED),
        fetchTMDB(TMDB_ENDPOINTS.NOW_PLAYING),
        fetchTMDB(TMDB_ENDPOINTS.UPCOMING),
        fetchTMDB(TMDB_ENDPOINTS.TRENDING),
        fetchTMDB(TMDB_ENDPOINTS.TV_SHOWS),
        fetchTMDB(TMDB_ENDPOINTS.GENRES)
      ]);

      if (carouselData.results) {
        setCarouselItems(carouselData.results.sort(() => Math.random() - 0.5).slice(0, 10));
      }
      if (topRatedData.results) setTopRated(topRatedData.results.slice(0, 8));
      if (nowPlayingData.results) setNowPlaying(nowPlayingData.results.slice(0, 12));
      if (upcomingData.results) setUpcoming(upcomingData.results.slice(0, 12));
      if (trendingData.results) setTrending(trendingData.results.slice(0, 12));
      if (tvShowsData.results) setTvShows(tvShowsData.results.slice(0, 20));
      if (genresData.genres) setGenres(genresData.genres);

    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMovies();

    const handleScroll = () => {
      const backToTop = document.getElementById('backToTop');
      if (window.scrollY > 300) {
        if (backToTop) backToTop.style.display = 'flex';
      } else {
        if (backToTop) backToTop.style.display = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadAllMovies]);

  const handleGenreClick = async (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      const data = await fetchTMDB(TMDB_ENDPOINTS.NOW_PLAYING);
      if (data.results) setNowPlaying(data.results.slice(0, 12));
      return;
    }
    setSelectedGenre(genreId);
    try {
      const url = `http://localhost:5000/api/tmdb/discover/movie?with_genres=${genreId}`;
      const data = await fetchTMDB(url);
      if (data.results) {
        setNowPlaying(data.results);
      }
    } catch (e) { console.error('Error filtering by genre:', e); }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const data = await fetchTMDB(TMDB_ENDPOINTS.SEARCH + encodeURIComponent(searchQuery));
      if (!data.results || data.results.length === 0) {
        setSearchResults([]);
      } else {
        setSearchResults(data.results.slice(0, 12));
      }
      setTimeout(() => {
        const section = document.getElementById('searchSection');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchMovies();
    }
  };

  const openModal = async (movie, type = 'movie') => {
    try {
      const url = `http://localhost:5000/api/tmdb/${type}/${movie.id}?append_to_response=videos,credits`;
      const data = await fetchTMDB(url);

      if (data) {
        setSelectedMovie({ ...data, media_type: type });
        const trailer = data.videos?.results?.find(
          vid => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
        );
        setTrailerKey(trailer ? trailer.key : null);
        setCast(data.credits?.cast?.slice(0, 5) || []);
      }
    } catch (e) { console.error('Error loading movie details:', e); }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setTrailerKey(null);
  };

  const toggleFavorite = (e, movie) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.some(f => f.id === movie.id)) {
      newFavorites = favorites.filter(f => f.id !== movie.id);
    } else {
      newFavorites = [...favorites, movie];
    }
    setFavorites(newFavorites);
  };

  const isFavorite = (id) => favorites.some(f => f.id === id);

  const handleNavClick = (tab, id) => {
    setActiveTab(tab);
    if (id) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [watchlistFilter, setWatchlistFilter] = useState('all');

  const filteredFavorites = favorites.filter(movie => {
    if (watchlistFilter === 'all') return true;
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    return type === watchlistFilter;
  });

  const clearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      setFavorites([]);
    }
  };

  return (
    <Suspense fallback={<div className="loading-container"><p>Loading...</p></div>}>
      <Routes>
        <Route path="/movie/:type/:id" element={<MovieDetails />} />
        <Route path="/" element={
          <>
            <Navbar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClick={searchMovies}
              onSearchKeyPress={handleSearchKeyPress}
              onNavClick={handleNavClick}
            />

            {activeTab === 'home' && (
              <>
                <div className="section1 video-background-section">
                  <video autoPlay muted loop playsInline className="bg-video">
                    <source src="/assets/video/intro.mp4" type="video/mp4" />
                  </video>
                  <div className="section1-content">
                    <h1 style={{ fontSize: '20vw' }}>POPCORNIQ</h1>
                    <p className="sectionpara">Get the latest updates on movies, trending films, and popular TV shows—all in one place.</p>
                  </div>
                </div>

                <button
                  id="backToTop"
                  className="back-to-top"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  ⬆
                </button>

                {searchResults && (
                  <section className="section2" id="searchSection">
                    <h1>Search Results</h1>
                    <div id="searchResults" className="featured">
                      {searchResults.length === 0 ? (
                        <p>No movies found matching "{searchQuery}".</p>
                      ) : (
                        searchResults.map(movie => (
                          <MovieCard 
                            key={movie.id} 
                            movie={movie} 
                            isFavorite={isFavorite(movie.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))
                      )}
                    </div>
                    <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
                  </section>
                )}

                <div className="highlights" id="MovieHighlights">
                  <div id="carouselRandom" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                    <div className="carousel-inner" id="carouselContent">
                      {carouselItems.map((movie, index) => {
                        const imagePath = movie.backdrop_path || movie.poster_path;
                        if (!imagePath) return null;
                        return (
                          <div key={movie.id} className={`carousel-item${index === 0 ? ' active' : ''}`} onClick={() => openModal(movie)}>
                            <img 
                              src={`${TMDB_IMAGE_URLS.W1280}${imagePath}`} 
                              className="d-block w-100" 
                              alt={movie.title} 
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                            <div className="carousel-caption d-none d-md-block">
                              <h3 style={{ fontFamily: '"Boldonse", system-ui' }}>{movie.title}</h3>
                              <p style={{ color: 'yellow' }}>{movie.overview ? movie.overview.slice(0, 100) + '...' : 'No description available.'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="section2" id="trending">
                  <h1>TRENDING NOW</h1>
                  <h2>Most Popular This Week</h2><br />
                  <section className="featured">
                    {trending.map((movie) => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        isFavorite={isFavorite(movie.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </section>
                </div>

                <div className="section2" style={{ background: '#f8f9fa' }}>
                  <h1>COMING SOON</h1>
                  <h2>Releases to Watch Out For</h2><br />
                  <section className="featured">
                    {upcoming.map((movie) => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        isFavorite={isFavorite(movie.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </section>
                </div>

                <div className="section2" id="toprated">
                  <h1>TOP RATED</h1>
                  <h2>All Time Favorites</h2><br />
                  <section className="featured">
                    {topRated.map((movie) => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        isFavorite={isFavorite(movie.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </section>
                </div>

                <div className="section2 video-background-section" id="movies">
                  <video autoPlay muted loop playsInline className="bg-video">
                    <source src="/assets/video/backgroundvideo.mp4" type="video/mp4" />
                  </video>

                  <div className="movie-content">
                    <h1>MOVIES</h1>
                    <h2>{selectedGenre ? 'Browsing by Genre' : 'Now Playing in Theatres'}</h2>

                    <div className="genre-container">
                      <button className={`genre-btn ${selectedGenre === null ? 'active' : ''}`} onClick={() => handleGenreClick(selectedGenre)}>
                        {selectedGenre ? 'Clear Filter' : 'Select Genre'}
                      </button>
                      {genres.map(g => (
                        <button
                          key={g.id}
                          className={`genre-btn ${selectedGenre === g.id ? 'active' : ''}`}
                          onClick={() => handleGenreClick(g.id)}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                    <br />

                    <section className="featured" id="nowPlayingContainer">
                      {nowPlaying.map((movie) => (
                        <MovieCard 
                          key={movie.id} 
                          movie={movie} 
                          isFavorite={isFavorite(movie.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </section>
                  </div>
                </div>

                <div className="tv-section" id="tvshows">
                  <div className="top-panel">
                    <h1>TV SHOWS</h1>
                    <p>Popular on POPCORNIQ</p>
                  </div>
                  <div className="bottom-panel" id="tvCards">
                    {tvShows.map(show => (
                      <MovieCard 
                        key={show.id} 
                        movie={show} 
                        type="tv" 
                        isFavorite={isFavorite(show.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'watchlist' && (
              <div className="watchlist-page">
                <div className="watchlist-header">
                  <h1>MY WATCHLIST ({favorites.length})</h1>
                  {favorites.length > 0 && (
                    <div className="watchlist-controls">
                      <div className="watchlist-filters">
                        <button className={watchlistFilter === 'all' ? 'active' : ''} onClick={() => setWatchlistFilter('all')}>All</button>
                        <button className={watchlistFilter === 'movie' ? 'active' : ''} onClick={() => setWatchlistFilter('movie')}>Movies</button>
                        <button className={watchlistFilter === 'tv' ? 'active' : ''} onClick={() => setWatchlistFilter('tv')}>TV Shows</button>
                      </div>
                      <button className="clear-btn" onClick={clearWatchlist}>Clear All</button>
                    </div>
                  )}
                </div>

                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <p>Your watchlist is empty!</p>
                    <button
                      className="action-btn btn-primary"
                      style={{ margin: '20px auto' }}
                      onClick={() => handleNavClick('home', 'movies')}
                    >
                      Browse Movies
                    </button>
                  </div>
                ) : (
                  <div className="watchlist-grid">
                    {filteredFavorites.length === 0 ? (
                      <div className="no-results">No {watchlistFilter === 'movie' ? 'movies' : 'TV shows'} in your watchlist.</div>
                    ) : (
                      filteredFavorites.map((movie) => (
                        <MovieCard 
                          key={movie.id} 
                          movie={movie} 
                          type={movie.media_type || (movie.title ? 'movie' : 'tv')} 
                          isFavorite={isFavorite(movie.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <Footer onNavClick={handleNavClick} />

            {selectedMovie && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <button className="close-button" onClick={closeModal}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <img
                      className="modal-poster"
                      src={`${TMDB_IMAGE_URLS.W500}${selectedMovie.poster_path}`}
                      alt={selectedMovie.title || selectedMovie.name}
                      loading="lazy"
                    />
                    <div className="modal-info">
                      <h2>{selectedMovie.title || selectedMovie.name}</h2>
                      <div className="modal-stats">
                        <span>📅 {selectedMovie.release_date || selectedMovie.first_air_date}</span>
                        <span>⭐ {selectedMovie.vote_average?.toFixed(1)}</span>
                        <span>⏱️ {selectedMovie.runtime ? `${selectedMovie.runtime} min` : 'N/A'}</span>
                      </div>
                      <p className="modal-overview">{selectedMovie.overview}</p>

                      {cast.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Cast:</strong> {cast.map(c => c.name).join(', ')}
                        </div>
                      )}

                      <div className="modal-actions">
                        <button
                          className={`action-btn btn-secondary ${isFavorite(selectedMovie.id) ? 'liked' : ''}`}
                          onClick={(e) => toggleFavorite(e, selectedMovie)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg 
                              viewBox="0 0 24 24" 
                              fill={isFavorite(selectedMovie.id) ? "#ff3f33" : "none"} 
                              stroke={isFavorite(selectedMovie.id) ? "#ff3f33" : "#fff"} 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              style={{ width: '18px', height: '18px' }}
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {isFavorite(selectedMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
                          </div>
                        </button>

                        {selectedMovie.imdb_id && (
                          <button className="action-btn btn-primary" onClick={() => window.open(`https://www.imdb.com/title/${selectedMovie.imdb_id}/`, '_blank')}>
                            IMDb
                          </button>
                        )}
                      </div>

                      {trailerKey && (
                        <div className="trailer-container">
                          <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}`}
                            title="Trailer"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
