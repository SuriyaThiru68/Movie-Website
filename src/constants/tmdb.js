// Use the Node.js Proxy server locally (production recommendation)
const BASE_URL = 'http://localhost:5000/api/tmdb';

export const TMDB_ENDPOINTS = {
  DISCOVER: `${BASE_URL}/discover/movie?language=en-US&sort_by=popularity.desc`,
  TOP_RATED: `${BASE_URL}/movie/top_rated?language=en-US&page=1`,
  NOW_PLAYING: `${BASE_URL}/movie/now_playing?language=en-US&page=1`,
  UPCOMING: `${BASE_URL}/movie/upcoming?language=en-US&page=1`,
  TRENDING: `${BASE_URL}/trending/movie/week`,
  TV_SHOWS: `${BASE_URL}/tv/popular?language=en-US&page=1`,
  SEARCH: `${BASE_URL}/search/movie?language=en-US&query=`,
  GENRES: `${BASE_URL}/genre/movie/list?language=en-US`,
};

export const TMDB_IMAGE_URLS = {
  ORIGINAL: 'https://image.tmdb.org/t/p/original',
  W1280: 'https://image.tmdb.org/t/p/w1280',
  W500: 'https://image.tmdb.org/t/p/w500',
  W342: 'https://image.tmdb.org/t/p/w342',
  W185: 'https://image.tmdb.org/t/p/w185',
};

export const fetchTMDB = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};
