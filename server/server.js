const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
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
app.get('/api/tmdb/*', async (req, res) => {

  const path = req.params[0];
  const queryParams = new URLSearchParams(req.query).toString();
  const cacheKey = `${path}?${queryParams}`;

  // Check Cache
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return res.json(cachedData);
  }

  try {
    console.log(`[Proxy] ${path}`);
    const tmdbUrl = `https://api.themoviedb.org/3/${path}?api_key=${TMDB_API_KEY}&${queryParams}`;
    const response = await axios.get(tmdbUrl);
    
    // Set Cache
    setCacheData(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error(`[Error] ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Serve frontend static files from 'dist' directory
app.use(express.static(path.join(__dirname, '../dist')));


// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
