import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const TMDB_API_KEY = process.env.VITE_TMDB_KEY || process.env.TMDB_API_KEY;
  const { url } = req;

  // Extract the TMDB path (e.g., /movie/popular)
  // req.url is the full path including /api/tmdb/
  const urlParts = url.split('?');
  const cleanPath = urlParts[0].replace('/api/tmdb/', '');
  const queryString = urlParts[1] || '';

  if (!cleanPath || cleanPath === '/api/index.js') {
    return res.status(200).json({ status: 'API Proxy is running' });
  }

  if (!TMDB_API_KEY) {
    console.error('[Error] TMDB_API_KEY is missing in Vercel environment');
    return res.status(500).json({ error: 'TMDB API Key missing' });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/${cleanPath}?api_key=${TMDB_API_KEY}&${queryString}`;
    
    console.log(`[TMDB Fetch] ${cleanPath}`);
    const response = await axios.get(tmdbUrl);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`[TMDB Error] ${error.message}`);
    const status = error.response?.status || 500;
    const message = error.response?.data?.status_message || error.message;
    res.status(status).json({ error: message });
  }
}
