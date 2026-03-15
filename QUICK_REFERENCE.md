# Quick Reference Guide

## 🚀 Start Here

### What Is This?
A complete web application for the Map Poster Generator with:
- React frontend (with form UI)
- FastAPI backend (REST API)
- Docker support (local & cloud)
- Comprehensive documentation

### What Can I Do?

1. **Run Locally**
   ```bash
   docker-compose up
   # Frontend: http://localhost:3000
   # API: http://localhost:8000
   ```

2. **Develop Locally**
   ```bash
   # Backend: python -m uvicorn backend.main:app --reload
   # Frontend: cd frontend && npm run dev
   ```

3. **Deploy to Cloud**
   - Render, Railway, Fly.io, or GitHub Pages
   - See DEPLOYMENT.md for instructions

## 📁 Key Files

| File | Purpose | Edit? |
|------|---------|-------|
| `backend/main.py` | FastAPI REST API | ✏️ Yes |
| `frontend/src/App.jsx` | React main app | ✏️ Yes |
| `frontend/src/components/*` | React components | ✏️ Yes |
| `frontend/src/styles/App.css` | Styling | ✏️ Yes |
| `docker-compose.yml` | Local setup | ⚙️ Maybe |
| `Dockerfile` | Backend container | ⚙️ Maybe |
| `.github/workflows/*.yml` | CI/CD | ⚙️ Maybe |
| `docs/*.md` | Documentation | 📖 Read |

## 🌐 API Quick Reference

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Generate Poster
```bash
curl -X POST http://localhost:8000/api/generate-poster \
  -H "Content-Type: application/json" \
  -d '{"city":"Paris","country":"France"}'
```

### List Themes
```bash
curl http://localhost:8000/api/themes
```

**Full API Docs**: http://localhost:8000/docs

## 🛠️ Common Commands

### Docker
```bash
# Start everything
docker-compose up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache
```

### Backend
```bash
# Install dependencies
pip install -r requirements.txt -r backend/requirements.txt

# Run dev server
python -m uvicorn backend.main:app --reload

# Run tests
pytest backend/

# Lint
flake8 backend/
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Dev server
npm run dev

# Build for production
npm run build

# Test
npm test

# Lint
npm run lint
```

## 📚 Documentation Map

```
Quick Start
    ↓
WEB_APP_README.md (What & How)
    ↓
    ├─→ DEPLOYMENT.md (Choose platform)
    │   ├─→ docs/RENDER_DEPLOYMENT.md
    │   ├─→ docs/RAILWAY_DEPLOYMENT.md
    │   ├─→ docs/FLY_DEPLOYMENT.md  
    │   └─→ docs/GITHUB_PAGES_DEPLOYMENT.md
    │
    ├─→ docs/LOCAL_DEVELOPMENT.md (Setup locally)
    │
    └─→ docs/ARCHITECTURE.md (How it works)
```

## ⚡ Frontend Features

| Feature | File | Status |
|---------|------|--------|
| Form with validation | `MapForm.jsx` | ✅ |
| Theme selector | `MapForm.jsx` | ✅ |
| Auto-geocoding | `MapForm.jsx` | ✅ |
| Poster preview | `PosterPreview.jsx` | ✅ |
| Responsive design | `App.css` | ✅ |
| Error display | `MapForm.jsx` | ✅ |

## 🔧 Backend Features

| Feature | Endpoint | Status |
|---------|----------|--------|
| Health check | `GET /api/health` | ✅ |
| List themes | `GET /api/themes` | ✅ |
| Generate poster | `POST /api/generate-poster` | ✅ |
| Geocoding | `POST /api/geocode` | ✅ |
| Validate inputs | `POST /api/validate-inputs` | ✅ |
| Download poster | `GET /api/download-poster/{filename}` | ✅ |
| Recent posters | `GET /api/recent-posters` | ✅ |

## 🌍 Deployment Comparison

| Platform | Setup | Cost | Free | Best For |
|----------|-------|------|------|----------|
| **Render** | Easy | $7/mo | Limited | Production |
| **Railway** | Easy | Pay/use | 500 hrs | Quick deploy |
| **Fly.io** | Medium | $0* | Generous | Global speed |
| **GitHub Pages** | Easy | $0 | Yes | Frontend only |

*Fly.io free tier is generous but can add costs with scaling

## 📋 Customization Guide

### Change Form Fields
Edit: `frontend/src/components/MapForm.jsx`

### Modify Styling
Edit: `frontend/src/styles/App.css`

### Add API Endpoints
Edit: `backend/main.py`

### Change Default Theme
Edit: `frontend/src/components/MapForm.jsx` (line with `theme: 'terracotta'`)

### Modify API Response
Edit: `backend/main.py` (update model or add fields)

## 🔐 Environment Variables

### Backend (or set directly)
```env
CACHE_DIR=./cache
PYTHONUNBUFFERED=1
```

### Frontend
```env
VITE_API_URL=http://localhost:8000
```

## 🐛 Debugging

### Frontend Issues
1. Open DevTools (F12)
2. Check Console tab
3. Check Network tab (API calls)
4. Verify VITE_API_URL is set

### Backend Issues
1. Check logs: `docker-compose logs backend`
2. Verify health: `curl http://localhost:8000/api/health`
3. Check API docs: http://localhost:8000/docs

### Connection Issues
```bash
# Backend responding?
curl http://localhost:8000/api/health

# Frontend built correctly?
ls -la frontend/dist/

# Containers running?
docker-compose ps
```

## 📊 Project Stats

- **Total Code**: ~6800 lines
- **Documentation**: ~5000 lines
- **Test Coverage**: Ready for unit tests
- **Build Time**: ~30 seconds (frontend), ~60 seconds (backend)
- **Deploy Time**: 2-5 minutes (depending on platform)

## 🎯 Next Steps

### For Development
1. Read `docs/LOCAL_DEVELOPMENT.md`
2. Set up local environment
3. Make changes
4. Run tests
5. Submit PR

### For Deployment
1. Choose platform (see Comparison table)
2. Follow deployment guide in `docs/`
3. Configure environment variables
4. Deploy with git push
5. Monitor in production

### For Production
1. Add authentication (see roadmap)
2. Set up monitoring
3. Configure backups
4. Implement rate limiting
5. Add analytics

## 🆘 Getting Help

1. **Check Docs**: `docs/` folder has detailed guides
2. **API Docs**: http://localhost:8000/docs
3. **Troubleshooting**: See section in DEPLOYMENT.md
4. **GitHub Issues**: Create one with details

## 📦 What's Included

✅ Working web application
✅ Backend API server
✅ Frontend UI
✅ Docker setup
✅ CI/CD pipelines
✅ 4 deployment guides
✅ Architecture documentation
✅ Local development guide
✅ 17+ themes
✅ Multi-language support

## 🚫 What's NOT Included (Yet)

❌ User authentication
❌ Database (PostgreSQL optional)
❌ User accounts
❌ Email notifications
❌ Mobile app
❌ Advanced analytics

## 💡 Tips

1. **Speed up generation**: Use smaller distance (8000m instead of 18000m)
2. **Better quality**: Use PDF format for printing
3. **Multiple cities**: Can run batch with script
4. **Custom themes**: Edit JSON files in `themes/` folder
5. **Save API calls**: Enable caching in production

## 🎓 Learning Resources

- **FastAPI**: fastapi.tiangolo.com
- **React**: react.dev
- **Vite**: vitejs.dev
- **Docker**: docker.com/get-started
- **OSMnx**: osmnx.readthedocs.io

## 📞 Support

**Need help?**
1. Check WEB_APP_README.md
2. Read relevant docs in `docs/`
3. Check API docs at `/docs` endpoint
4. Create GitHub issue with details

**Want to contribute?**
1. Fork repository
2. Create feature branch  
3. Make changes
4. Submit pull request

---

**Ready to get started?**

→ Run `docker-compose up`
→ Visit http://localhost:3000
→ Start generating posters!

Happy mapping! 🗺️
