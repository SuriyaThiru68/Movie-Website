import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Use process.env.VITE_TMDB_KEY as the primary key source
const TMDB_API_KEY = process.env.VITE_TMDB_KEY || process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());

// Simple logging middleware for Vercel
app.use((req, res, next) => {
  console.log(`[Vercel Request] ${req.method} ${req.url}`);
  next();
});

// Basic In-Memory Cache
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
};

const setCacheData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Proxy route for TMDB
// We use a more generic match to be safer on Vercel
app.get('/api/tmdb/*', async (req, res) => {
  // Extract path after /api/tmdb/
  // req.url might be like /api/tmdb/trending/movie/week?language=en-US
  const fullPath = req.url.split('?')[0];
  const endpointPath = fullPath.replace('/api/tmdb/', '');
  
  if (!endpointPath) {
    return res.status(400).json({ error: 'No TMDB endpoint specified' });
  }

  const queryParams = new URLSearchParams(req.query);
  const cacheKey = `${endpointPath}?${queryParams.toString()}`;

  console.log(`[TMDB Proxy] Endpoint: ${endpointPath}, Key: ${cacheKey}`);

  // Check Cache
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  if (!TMDB_API_KEY) {
    console.error('[Error] TMDB_API_KEY is missing');
    return res.status(500).json({ error: 'TMDB API Key is not configured on the server.' });
  }

  try {
    // Construct URL cleanly
    queryParams.set('api_key', TMDB_API_KEY);
    const tmdbUrl = `https://api.themoviedb.org/3/${endpointPath}?${queryParams.toString()}`;
    
    console.log(`[TMDB Fetch] ${tmdbUrl.replace(TMDB_API_KEY, 'REDACTED')}`);

    const response = await axios.get(tmdbUrl);
    
    // Set Cache
    setCacheData(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[TMDB Error Details] Status: ${error.response.status}, Data:`, error.response.data);
      return res.status(error.response.status).json({ 
        error: error.message,
        tmdb_error: error.response.data 
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[TMDB Network Error] No response received`);
      return res.status(502).json({ error: 'No response received from TMDB API' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ error: error.message });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', environment: 'Vercel' }));

export default app;


