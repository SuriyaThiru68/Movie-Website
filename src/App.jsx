import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_DISCOVER_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`;
const TMDB_TOP_RATED_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_NOW_PLAYING_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_UPCOMING_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;
const TMDB_TVSHOWS_URL = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=`;
const TMDB_GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [carouselItems, setCarouselItems] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

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

  useEffect(() => {
    loadRandomCarousel();
    loadTopRatedMovies();
    loadNowPlayingMovies();
    loadUpcomingMovies();
    loadTrendingMovies();
    loadTVShows();
    loadGenres();

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
  }, []);

  const shuffleArray = (array) => {
    if (!array) return [];
    return [...array].sort(() => Math.random() - 0.5);
  };

  const loadRandomCarousel = async () => {
    try {
      if (!API_KEY) throw new Error("TMDB API Key is missing");
      const response = await fetch(TMDB_DISCOVER_URL);
      const data = await response.json();
      if (!data.results) throw new Error("No results found in API response");
      const movies = shuffleArray(data.results).slice(0, 20);
      setCarouselItems(movies);
    } catch (error) {
      console.error("Error loading carousel:", error);
    }
  };

  const loadTopRatedMovies = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_TOP_RATED_URL);
      const data = await res.json();
      if (data.results) {
        setTopRated(data.results.slice(0, 8));
      }
    } catch (err) {
      console.error('Error loading top-rated movies:', err);
    }
  };

  const loadNowPlayingMovies = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_NOW_PLAYING_URL);
      const data = await res.json();
      if (data.results) {
        setNowPlaying(data.results.slice(0, 12));
      }
    } catch (err) {
      console.error('Error loading now playing movies:', err);
    }
  };

  const loadUpcomingMovies = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_UPCOMING_URL);
      const data = await res.json();
      if (data.results) {
        setUpcoming(data.results.slice(0, 12));
      }
    } catch (err) { console.error('Error loading upcoming movies:', err); }
  };

  const loadTrendingMovies = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_TRENDING_URL);
      const data = await res.json();
      if (data.results) {
        setTrending(data.results.slice(0, 12));
      }
    } catch (err) { console.error('Error loading trending movies:', err); }
  };

  const loadTVShows = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_TVSHOWS_URL);
      const data = await res.json();
      if (data.results) {
        setTvShows(data.results.slice(0, 20));
      }
    } catch (err) {
      console.error('Error loading TV shows:', err);
    }
  };

  const loadGenres = async () => {
    try {
      if (!API_KEY) return;
      const res = await fetch(TMDB_GENRES_URL);
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (e) { console.error('Error loading genres:', e); }
  };

  const handleGenreClick = async (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      loadNowPlayingMovies();
      return;
    }
    setSelectedGenre(genreId);
    try {
      if (!API_KEY) return;
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
      const res = await fetch(url);
      const data = await res.json();
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
      if (!API_KEY) return;
      const res = await fetch(TMDB_SEARCH_URL + encodeURIComponent(searchQuery));
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setSearchResults([]);
      } else {
        setSearchResults(data.results.slice(0, 12));
      }
      // Scroll to results
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
      if (!API_KEY) return;
      const url = `https://api.themoviedb.org/3/${type}/${movie.id}?api_key=${API_KEY}&append_to_response=videos,credits`;
      const res = await fetch(url);
      const data = await res.json();

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

  const MovieCard = ({ movie, type = 'movie' }) => {
    if (!movie.poster_path) return null;
    return (
      <div className="card" onClick={() => openModal(movie, type)}>
        <div style={{ position: 'relative' }}>
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title || movie.name} />
          {isFavorite(movie.id) && <span className="watchlist-badge">❤️</span>}
        </div>
        <h3>{movie.title || movie.name}</h3>
        <p><strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)}</p>
        <div className="ratings">
          <button
            onClick={(e) => toggleFavorite(e, movie)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isFavorite(movie.id) ? '#ff3f33' : '#ccc' }}
          >
            {isFavorite(movie.id) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    );
  };

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

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => handleNavClick('home')}>
          <img src="/assets/images/PQ_Circular_Favicon.png" alt="logo" />
          <span className="logo-text">POPCORNIQ</span>
        </div>

        <div className="nav-search-container">
          <div className="nav-search-bar">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
            />
            <button onClick={searchMovies}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <nav className="sidebar">
          <ul style={{ alignItems: 'center' }}>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'MovieHighlights'); }}>HIGHLIGHTS</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'trending'); }}>TRENDING</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'movies'); }}>MOVIES</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('watchlist'); }}>WATCHLIST</a></li>
          </ul>
        </nav>
      </header>

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
                  searchResults.map(movie => <MovieCard key={movie.id} movie={movie} />)
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
                      <img src={`https://image.tmdb.org/t/p/original${imagePath}`} className="d-block w-100" alt={movie.title} />
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

          {/* Trending Section */}
          <div className="section2" id="trending">
            <h1>TRENDING NOW</h1>
            <h2>Most Popular This Week</h2><br />
            <section className="featured">
              {trending.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </section>
          </div>

          {/* Upcoming Section */}
          <div className="section2" style={{ background: '#f8f9fa' }}>
            <h1>COMING SOON</h1>
            <h2>Releases to Watch Out For</h2><br />
            <section className="featured">
              {upcoming.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </section>
          </div>

          {/* Top Rated Section */}
          <div className="section2" id="toprated">
            <h1>TOP RATED</h1>
            <h2>All Time Favorites</h2><br />
            <section className="featured">
              {topRated.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </section>
          </div>

          <div className="section2 video-background-section" id="movies">
            <video autoPlay muted loop playsInline className="bg-video">
              <source src="/assets/video/2759477-uhd_3840_2160_30fps.mp4" type="video/mp4" />
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
                {nowPlaying.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
              </section>
            </div>
          </div>

          <div className="tv-section" id="tvshows">
            <div className="top-panel">
              <h1>TV SHOWS</h1>
              <p>Popular on POPCORNIQ</p>
            </div>
            <div className="bottom-panel" id="tvCards">
              {tvShows.map(show => <MovieCard key={show.id} movie={show} type="tv" />)}
            </div>
          </div>
        </>
      )}

      {/* Watchlist Page View */}
      {activeTab === 'watchlist' && (
        <div className="watchlist-page">
          <h1>MY WATCHLIST</h1>
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
              {favorites.map((movie) => <MovieCard key={movie.id} movie={movie} type={movie.media_type || 'movie'} />)}
            </div>
          )}
        </div>
      )}

      <div className="footer">
        <div className="footer-left">
          <h2>🎬 MovieScope</h2>
          <p>Your daily dose of movie facts, ratings & reviews.</p>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'trending'); }}>Trending</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'movies'); }}>Movies</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('watchlist'); }}>Watchlist</a></li>
          </ul>
        </div>
        <div className="footer-right">
          <video src="/assets/video/intro.mp4" autoPlay muted loop playsInline></video>
        </div>
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <img
                className="modal-poster"
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                alt={selectedMovie.title || selectedMovie.name}
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
                    {isFavorite(selectedMovie.id) ? '❤️ In Watchlist' : '🤍 Add to Watchlist'}
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
  );
}

export default App;
