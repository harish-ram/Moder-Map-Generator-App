# 🗺️ Map Poster Generator - Web Application

[![Build Status](https://github.com/yourusername/maptoposter/actions/workflows/build-test.yml/badge.svg)](https://github.com/yourusername/maptoposter/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![Node.js 18+](https://img.shields.io/badge/node-18%2B-green)](https://nodejs.org/)

A modern, full-stack web application that generates beautiful, minimalist city map posters using OpenStreetMap data. Create stunning visual maps of your favorite cities with customizable themes, fonts, and dimensions.

## 🌟 Features

- ✨ **Beautiful Poster Generation** - 17+ professionally-designed themes
- 🎨 **Full Customization** - Colors, fonts, dimensions, detail levels  
- 🌍 **Global Support** - Works with any city, supports 30+ languages/scripts
- 📥 **Multiple Formats** - Export as PNG (raster), SVG (vector), or PDF (print-ready)
- ⚡ **Fast & Efficient** - Intelligent caching system for quick generation
- 🚀 **Cloud Ready** - Easy deployment to Render, Railway, Fly.io, GitHub Pages
- 📱 **Responsive Design** - Beautiful UI that works on desktop, tablet, mobile
- 🔄 **Live Preview** - Instant visual feedback as you adjust settings

## 🎯 Quick Start (2 minutes)

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/maptoposter.git
cd maptoposter

# Start everything with Docker Compose
docker-compose up

# Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

**Backend**:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Visit **http://localhost:5173** to start creating posters!

## 📚 Documentation

### Getting Started
- **[Local Development Guide](docs/LOCAL_DEVELOPMENT.md)** - Set up development environment
- **[Project Architecture](docs/ARCHITECTURE.md)** - System design & technical details
- **[API Documentation](DEPLOYMENT.md#api-documentation)** - REST API endpoints

### Deployment Guides
- **[Render Deployment](docs/RENDER_DEPLOYMENT.md)** - Deploy to Render hosting
- **[Railway Deployment](docs/RAILWAY_DEPLOYMENT.md)** - Deploy to Railway  
- **[Fly.io Deployment](docs/FLY_DEPLOYMENT.md)** - Deploy to Fly.io
- **[GitHub Pages Deployment](docs/GITHUB_PAGES_DEPLOYMENT.md)** - Host frontend on Pages
- **[Main Deployment Guide](DEPLOYMENT.md)** - Overview of all options

## 🏗️ Project Structure

```
maptoposter/
├── backend/
│   ├── main.py               # FastAPI application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── styles/          # CSS files
│   │   └── App.jsx          # Main app component
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   └── Dockerfile           # Frontend container
├── create_map_poster.py     # Original poster generation script
├── font_management.py       # Font handling
├── Dockerfile               # Backend container
├── docker-compose.yml       # Local development setup
├── .github/workflows/       # CI/CD pipelines
└── docs/                    # Comprehensive documentation
```

## 🎨 Available Themes

| Classic | Modern | Colorful |
|---------|--------|----------|
| Noir | Blueprint | Neon Cyberpunk |
| Monochrome Blue | Contrast Zones | Gradient Roads |
| Warm Beige | Pastel Dream | Ocean |
| Terracotta | Japanese Ink | Sunset |
| Emerald | Forest | Copper Patina |
| Midnight Blue | Autumn | - |

## 💻 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Lightning-fast build tool
- **Vanilla CSS3** - Responsive styling
- **Fetch API** - Backend communication

### Backend  
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **OSMnx** - OpenStreetMap data fetching
- **Geopandas** - Geographic data processing
- **Matplotlib** - Visualization & rendering

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipelines
- **Nginx** - Web server
- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend build tool

## 🚀 Deployment Options

| Platform | Difficulty | Cost | Free Tier |
|----------|-----------|------|-----------|
| **Render** | Easy | $7/month | Limited |
| **Railway** | Easy | Pay-as-you-go | 500 hrs/month |
| **Fly.io** | Medium | $0 | Generous |
| **GitHub Pages** | Very Easy | Free | Frontend only |

### Quick Deploy Buttons (Coming Soon)

```
Deploy to Render    Deploy to Railway    Deploy to Fly.io
```

## 📖 API Overview

### Generate Poster
```bash
curl -X POST http://localhost:8000/api/generate-poster \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "country": "France",
    "theme": "terracotta",
    "distance": 18000,
    "width": 12,
    "height": 16,
    "format": "png"
  }'
```

### List Themes
```bash
curl http://localhost:8000/api/themes
```

### API Documentation
Visit **http://localhost:8000/docs** for interactive API explorer (Swagger UI)

See [DEPLOYMENT.md](DEPLOYMENT.md#api-documentation) for complete API reference.

## 🎯 Use Cases

- **Travel Planning** - Create posters of cities you want to visit
- **Home Decor** - Display beautiful maps of cities you love
- **Gifts** - Personalized maps as unique presents
- **Office Design** - Professional city maps for workspace
- **Educational** - Geography and urban planning visualization
- **Printing** - High-quality prints for framing

## 🛠️ Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)
- Git

### Setup

1. **Clone & Enter Directory**
   ```bash
   git clone https://github.com/yourusername/maptoposter.git
   cd maptoposter
   ```

2. **Using Docker** (Easiest)
   ```bash
   docker-compose up
   ```

3. **Manual Setup**
   - See [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)

### Running Tests

```bash
# Backend tests
pytest backend/

# Frontend tests  
cd frontend && npm test

# Code quality
flake8 create_map_poster.py backend/
cd frontend && npm run lint
```

### Building for Production

```bash
# Backend
docker build -t maptoposter-backend .

# Frontend
cd frontend && npm run build

# Both with Docker Compose
docker-compose build
```

## 🌐 Environment Variables

### Backend
```env
CACHE_DIR=./cache          # Cache directory path
PYTHONUNBUFFERED=1         # Real-time logging
```

### Frontend
```env
VITE_API_URL=http://localhost:8000  # Backend API URL
VITE_DEBUG=false                     # Debug mode
```

## 📋 Supported Languages & Fonts

Extensive language support including:

- **European**: English, French, Spanish, German, Italian, Portuguese
- **Asian**: Japanese, Chinese (Simplified & Traditional), Korean, Thai
- **South Asian**: Hindi, Tamil, Telugu, Bengali, Gujarati, Marathi
- **Middle Eastern**: Arabic, Persian, Hebrew
- **Cyrillic**: Russian, Ukrainian, Bulgarian, Serbian
- **Others**: Turkish, Polish, Vietnamese, Greek

Uses Google Fonts & system fonts for optimal rendering.

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Clear cache
rm -rf cache/ __pycache__/
```

### Frontend can't connect to API
```bash
# Verify backend is running at 8000
curl http://localhost:8000/api/health

# Check VITE_API_URL environment variable
echo $VITE_API_URL

# Clear frontend cache and rebuild
cd frontend && rm -rf node_modules && npm install
```

### Docker issues
```bash
# Remove old containers/volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up
```

See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) for more solutions.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure quality
5. Commit with clear message (`git commit -m 'Add amazing feature'`)
6. Push branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Creator**: Ankur Gupta
- **OpenStreetMap**: Community map data
- **OSMnx**: OpenStreetMap data fetching
- **FastAPI**: Modern web framework
- **React**: UI framework
- **Vite**: Build tool

## 🚀 Roadmap

### Current (v1.0)
- ✅ Basic poster generation
- ✅ 17+ themes
- ✅ Multiple export formats
- ✅ Web interface
- ✅ Docker deployment

### Phase 2 (v1.1) - Coming Soon
- [ ] User accounts & authentication
- [ ] Save favorite locations
- [ ] Generation history
- [ ] Batch processing
- [ ] Custom theme creator
- [ ] Advanced styling options

### Phase 3 (v2.0)
- [ ] Mobile app (React Native)
- [ ] Real-time map preview
- [ ] Share functionality
- [ ] Analytics
- [ ] Premium features

### Phase 4 (v2.5)
- [ ] AI-powered theme generation
- [ ] Animated posters
- [ ] Map comparison tool
- [ ] Historical maps

## 💬 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/maptoposter/issues)
- **Discussions**: [Join community discussions](https://github.com/yourusername/maptoposter/discussions)
- **Email**: helloYourEmail@example.com
- **Twitter**: [@YourHandle](https://twitter.com)

## 📊 Project Stats

- **Languages**: Python, JavaScript/React, HTML/CSS
- **Lines of Code**: 3000+
- **API Endpoints**: 8
- **Supported Themes**: 17
- **Supported Languages**: 30+

## 🔐 Security

- Input validation on all endpoints
- CORS protection
- File path traversal prevention
- Rate limiting ready
- No sensitive data in logs
- Regular dependency updates

## 💡 Tips & Tricks

### Generate Poster Batch
```bash
# Coming in v1.1
for city in "Paris" "Tokyo" "NYC" "Dubai"; do
  curl -X POST http://localhost:8000/api/generate-poster \
    -H "Content-Type: application/json" \
    -d "{\"city\": \"$city\", \"country\": \"...\", ...}"
done
```

### Custom Domain
See [Render](docs/RENDER_DEPLOYMENT.md) or [Railway](docs/RAILWAY_DEPLOYMENT.md) guides

### Performance Tips
- Use smaller distance values for faster generation (4000-8000m)
- PNG is faster than SVG or PDF
- Cache is shared across users

## 📞 Contact

**Maintainer**: Your Name  
**Email**: your.email@example.com  
**Website**: [yourwebsite.com](https://yourwebsite.com)

---

## ⭐ If You Like This Project

Please consider:
- ⭐ Starring this repository
- 🍴 Forking to contribute
- 💬 Sharing feedback
- 📢 Telling others about it

## 🎉 Getting Started

Ready to create beautiful map posters?

**[Read the Getting Started Guide →](docs/LOCAL_DEVELOPMENT.md)**

**[Deploy to Production →](DEPLOYMENT.md)**

---

<div align="center">

Made with ❤️ for map lovers everywhere

[⬆ Back to Top](#-map-poster-generator---web-application)

</div>
