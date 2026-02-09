const API_KEY = '61db8a0327aff8a8e4b9fe5b53623000';

const TMDB_DISCOVER_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`;
const TMDB_TOP_RATED_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_NOW_PLAYING_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_TVSHOWS_URL = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;
const TMDB_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=`;

async function loadRandomCarousel() {
  try {
    const response = await fetch(TMDB_DISCOVER_URL);
    const data = await response.json();
    const movies = shuffleArray(data.results).slice(0, 16);
    const carousel = document.getElementById("carouselContent");
    carousel.innerHTML = '';
    movies.forEach((movie, index) => {
      const imagePath = movie.backdrop_path || movie.poster_path;
      if (!imagePath) return;
      const item = document.createElement("div");
      item.className = `carousel-item${index === 0 ? ' active' : ''}`;
      item.innerHTML = `
        <img src="https://image.tmdb.org/t/p/original${imagePath}" class="d-block w-100" alt="${movie.title}">
        <div class="carousel-caption d-none d-md-block">
          <h3 style="font-family: 'Boldonse', system-ui;">${movie.title}</h3>
          <p style="color: yellow;">${movie.overview ? movie.overview.slice(0, 100) + '...' : 'No description available.'}</p>
        </div>`;
      carousel.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading carousel:", error);
  }
}

async function loadTopRatedMovies() {
  try {
    const res = await fetch(TMDB_TOP_RATED_URL);
    const data = await res.json();
    const movies = data.results.slice(0, 8);
    const container = document.querySelector('#toprated .featured');
    container.innerHTML = '';
    movies.forEach((movie, index) => {
      if (!movie.poster_path) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${index + 1}. ${movie.title}</h3>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
        <p>${movie.overview.slice(0, 80)}...</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading top-rated movies:', err);
  }
}

async function loadNowPlayingMovies() {
  try {
    const res = await fetch(TMDB_NOW_PLAYING_URL);
    const data = await res.json();
    const movies = data.results.slice(0, 12);
    const container = document.getElementById('nowPlayingContainer');
    container.innerHTML = '';
    movies.forEach((movie, index) => {
      if (!movie.poster_path) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${index + 1}. ${movie.title}</h3>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
        <p>${movie.overview.slice(0, 80)}...</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading now playing movies:', err);
  }
}

async function loadTVShows() {
  try {
    const res = await fetch(TMDB_TVSHOWS_URL);
    const data = await res.json();
    const shows = data.results.slice(0, 20);
    const section = document.getElementById('tvshows');
    section.innerHTML = `
      <div class="top-panel">
        <h1>TV SHOWS</h1>
        <p>Popular on POPCORNIQ</p>
      </div>
      <div class="bottom-panel" id="tvCards"></div>`;
    const container = document.getElementById('tvCards');
    shows.forEach(show => {
      if (!show.poster_path) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}">
        <h3>${show.name}</h3>
        <p>${show.overview.slice(0, 70)}...</p>
        <div class="ratings">
          <span>⭐ ${show.vote_average.toFixed(1)}</span>
          <span class="emoji">📺</span>
        </div>`;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading TV shows:', err);
  }
}

async function searchMovies() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';
  if (!query) {
    resultsDiv.innerHTML = '<p>Please enter a movie name.</p>';
    return;
  }
  try {
    const res = await fetch(TMDB_SEARCH_URL + encodeURIComponent(query));
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = '<p>No movies found.</p>';
      return;
    }
    data.results.slice(0, 12).forEach(movie => {
      if (!movie.poster_path) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
        <p>${movie.overview ? movie.overview.slice(0, 80) + '...' : 'No description available.'}</p>
      `;
      resultsDiv.appendChild(card);
    });
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error searching for movies.</p>';
    console.error('Search error:', err);
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

window.addEventListener('DOMContentLoaded', () => {
  loadRandomCarousel();
  loadTopRatedMovies();
  loadNowPlayingMovies();
  loadTVShows();

  // 🎯 Enable Enter key to trigger search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchMovies();
      }
    });
  }
});
