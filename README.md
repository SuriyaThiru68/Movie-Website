# 🍿 POPCORNIQ

POPCORNIQ is a modern, responsive movie discovery platform built with React and Vite. It leverages the TMDB API to provide enthusiasts with real-time updates on trending movies, top-rated films, upcoming releases, and popular TV shows.

![POPCORNIQ Poster](https://raw.githubusercontent.com/SuriyaThiru68/Movie-Website/main/public/assets/images/PQ_Circular_Favicon.png)

## 🚀 Features

- **🎬 Real-time Movie Discovery:** Explore Trending, Now Playing, Top Rated, and Upcoming movies.
- **📺 TV Shows:** Dedicated section for popular television series.
- **🔍 Advanced Search:** Easily find your favorite movies with our responsive search functionality.
- **🎭 Genre Filtering:** Browse movies by your favorite genres (Action, Comedy, Horror, etc.).
- **📽️ Rich Details:** View movie trailers, cast information, ratings, and release dates in a sleek modal interface.
- **❤️ Personal Watchlist:** Save movies to your watchlist (powered by LocalStorage) and access them anytime.
- **📱 Fully Responsive:** Optimized for desktop, tablet, and mobile viewing.
- **✨ Premium UI:** Featuring video backgrounds, smooth transitions, and a modern cinematic aesthetic.

## 🛠️ Tech Stack

- **Frontend:** [React.js](https://reactjs.org/) (Hooks, State Management)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Custom CSS3 & [Bootstrap 5](https://getbootstrap.com/)
- **Icons:** [Font Awesome 6](https://fontawesome.com/)
- **API:** [TMDB API](https://www.themoviedb.org/documentation/api)
- **Deployment:** Vercel / Netlify (Recommended)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- A TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SuriyaThiru68/Movie-Website.git
   cd Movie-Website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your TMDB API key:
   ```env
   VITE_TMDB_KEY=your_tmdb_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
POPCORNIQ/
├── public/             # Static assets (images, videos)
├── src/
│   ├── App.jsx         # Main application logic & components
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles & design system
├── .env                # Environment variables (gitignored)
├── index.html          # HTML template
└── package.json        # Dependencies & scripts
```

## 📝 License

This project is open-source and available under the MIT License.

---

*Made with ❤️ by [Suriya Thiru](https://github.com/SuriyaThiru68)*
