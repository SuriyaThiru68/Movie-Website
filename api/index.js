const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const TMDB_API_KEY = process.env.VITE_TMDB_KEY;

app.use(cors());
app.use(express.json());

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
// Note: Vercel uses /api as the root for functions
// We want this to catch /api/tmdb/*
app.get('/api/tmdb/*', async (req, res) => {
  const endpointPath = req.params[0];
  const queryParams = new URLSearchParams(req.query).toString();
  const cacheKey = `${endpointPath}?${queryParams}`;

  console.log(`[Vercel Function] Endpoint: ${endpointPath}, Params: ${queryParams}`);

  // Check Cache
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/${endpointPath}?api_key=${TMDB_API_KEY}&${queryParams}`;
    const response = await axios.get(tmdbUrl);
    
    // Set Cache
    setCacheData(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error(`[Error] ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

module.exports = app;
