# Map Poster Generator - Web Application

A modern web application that generates beautiful, minimalist city map posters using OpenStreetMap data. Built with FastAPI backend and React frontend.

## Features

✨ **Beautiful Map Posters** - Generate minimalist city map posters in 17+ unique themes
🎨 **Customization** - Choose dimensions, colors, fonts, and detail levels
🌍 **Global Support** - Works with any city worldwide, supports international text
📥 **Multiple Formats** - Export as PNG (raster), SVG (vector), or PDF (print)
⚡ **Fast Generation** - Intelligent caching for rapid poster generation
🚀 **Easy Deployment** - Docker, GitHub Pages, and cloud-ready

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Mapping**: OSMnx, GeoPandas, Matplotlib
- **Geocoding**: GeoPy
- **Deployment**: Docker, Render, Railway, Fly.io

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: CSS3 with responsive design
- **Package Manager**: npm

### Infrastructure
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: GitHub Pages / Vercel / Netlify
- **Backend Hosting**: Render / Railway / Fly.io / Cloud Run

## Cloud Run Quick Link

- Backend deployment guide: `docs/CLOUD_RUN_DEPLOYMENT.md`
- GitHub Actions workflow: `.github/workflows/cloud-run-backend.yml`

## Project Structure

```
maptoposter/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS stylesheets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── index.html
├── create_map_poster.py    # Original poster generation script
├── font_management.py      # Font handling
├── themes/                 # Theme JSON definitions
├── fonts/                  # Custom fonts
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Local development setup
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── requirements.txt        # Main project dependencies
└── README.md              # This file
```

## Quick Start (Local Development)

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/maptoposter.git
cd maptoposter

# Start both frontend and backend
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
pip install -r requirements.txt

# Create cache and posters directories
mkdir -p cache posters

# Run backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variable
export VITE_API_URL=http://localhost:8000
# On Windows:
set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev

# Access at http://localhost:5173
```

## API Documentation

### Health Check
```
GET /api/health
```

### List Available Themes
```
GET /api/themes
```

Response:
```json
{
  "status": "success",
  "themes": ["terracotta", "noir", "blueprint", ...],
  "count": 17
}
```

### Generate Poster
```
POST /api/generate-poster
Content-Type: application/json
```

Request body:
```json
{
  "city": "Paris",
  "country": "France",
  "display_city": "Paris",
  "display_country": "France",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "theme": "terracotta",
  "distance": 18000,
  "width": 12.0,
  "height": 16.0,
  "font_family": "Noto Sans",
  "format": "png"
}
```

Response:
```json
{
  "status": "success",
  "message": "Poster generated successfully",
  "image_url": "/api/download-poster/Paris_terracotta_20240115_143022.png",
  "file_path": "/app/posters/Paris_terracotta_20240115_143022.png"
}
```

### Geocode Location
```
POST /api/geocode?city=Paris&country=France
```

### Download Poster
```
GET /api/download-poster/{filename}
```

### Validate Inputs
```
POST /api/validate-inputs
Content-Type: application/json
```

### Recent Posters
```
GET /api/recent-posters?limit=10
```

## Available Themes

The application includes 17+ unique themes:

1. **terracotta** - Warm, earthy tones
2. **noir** - Classic black and white
3. **blueprint** - Blueprint paper style
4. **midnight_blue** - Deep blue tones
5. **neon_cyberpunk** - Vibrant neon colors
6. **ocean** - Water-inspired blues and greens
7. **forest** - Natural green palette
8. **sunset** - Warm orange and purple
9. **pastel_dream** - Soft pastel colors
10. **warm_beige** - Light, creamy tones
11. **contrast_zones** - Bold contrasts
12. **gradient_roads** - Gradient effects
13. **japanese_ink** - Ink wash style
14. **emerald** - Rich green tones
15. **copper_patina** - Copper and verdigris
16. **monochrome_blue** - Blue monochrome
17. **autumn** - Fall color palette

## Configuration

### Environment Variables

#### Backend
```bash
CACHE_DIR=./cache                    # Cache directory path
```

#### Frontend
```bash
VITE_API_URL=http://localhost:8000   # Backend API URL
```

## Deployment Guide

### Deploy to Render

1. **Sign up** at [render.com](https://render.com)

2. **Create Web Service**
   - Connect your GitHub repository
   - Select "Docker" as environment
   - Set environment variables:
     ```
     CACHE_DIR=/app/cache
     ```

3. **Deploy**
   - Push to main branch to trigger automatic deployment
   - Or use GitHub Actions workflow trigger

### Deploy to Railway

1. **Sign up** at [railway.app](https://railway.app)

2. **Create Project** and add services
   - Backend service from Docker
   - Frontend service from static build

3. **Configure** with environment variables
   - Point frontend to backend domain

### Deploy Frontend to GitHub Pages

1. **Update vite.config.js** for base path:
```javascript
export default defineConfig({
  base: '/repo-name/',  // Your repository name
  // ...
})
```

2. **Create deployment workflow** in `.github/workflows/deploy-pages.yml`

3. **Configure GitHub Pages** to use GitHub Actions

### Deploy to Fly.io

```bash
# Install flyctl
curl https://fly.io/install.sh | sh

# Login
flyctl auth login

# Create app
flyctl launch

# Deploy
flyctl deploy
```

## Font Support

The application supports Google Fonts and system fonts for international text:

- **Default**: Roboto
- **Tamil**: Noto Sans Tamil UI
- **Hindi**: Noto Sans Devanagari  
- **Japanese**: Noto Sans JP
- **Arabic**: Noto Sans Arabic
- **CJK**: Noto Sans CJK JP

Additional fonts can be added by downloading and placing in the `fonts/` directory.

## Development

### Running Tests

```bash
# Backend tests
pytest backend/

# Frontend tests
cd frontend && npm test
```

### Formatting and Linting

```bash
# Backend
flake8 create_map_poster.py backend/
black create_map_poster.py backend/

# Frontend
cd frontend && npm run lint
```

### Building for Production

```bash
# Backend with Docker
docker build -t map-poster-backend:latest .

# Frontend
cd frontend && npm run build

# Docker Compose
docker-compose build
docker-compose up -d
```

## Performance Tips

1. **Cache Optimization**: The application caches OSM data. Clear old cache files:
   ```bash
   rm -rf cache/*
   ```

2. **Image Optimization**: For PNG exports, consider reducing DPI for faster generation:
   - Default: 300 DPI
   - Modify in `create_map_poster.py` save_kwargs

3. **Database for Production**: Use persistent cache/storage:
   - Mount volumes in Docker
   - Use cloud storage (S3, Google Cloud Storage)

## Troubleshooting

### Backend Issues

**Error: "Failed to retrieve street network data"**
- Ensure internet connection
- Check OSM server status
- Verify coordinates are correct
- Try smaller distance value

**Error: "Cache write failed"**
- Ensure `cache/` directory exists
- Check write permissions
- Verify disk space

### Frontend Issues

**Blank page/No API connection**
- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check browser console for CORS errors
- Ensure API endpoint is accessible

**Download not working**
- Check browser's download settings
- Verify API response headers
- Check file permissions on backend

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Original Creator**: Ankur Gupta
- **OSM Data**: OpenStreetMap contributors
- **Libraries**: OSMnx, Geopandas, Matplotlib, FastAPI, React

## Support

For issues, questions, or suggestions:

1. Check [GitHub Issues](https://github.com/yourusername/maptoposter/issues)
2. Create a new issue with detailed description
3. Include screenshots/error messages if applicable

## Roadmap

- [ ] User authentication and accounts
- [ ] Save favorite themes and presets
- [ ] Batch poster generation
- [ ] Advanced coordinate search with map picker
- [ ] Custom color themes creator
- [ ] Share posters (QR codes, sharable links)
- [ ] Mobile app version
- [ ] Real-time preview
- [ ] Integration with design tools (Figma, Adobe XD)

---

**Built with ❤️ by [Your Name] | [GitHub](https://github.com) | [Discord](https://discord.gg)**
