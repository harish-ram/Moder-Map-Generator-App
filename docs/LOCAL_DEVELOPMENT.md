# Local Development Setup Guide

Complete guide for setting up the Map Poster Generator for local development.

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** (for frontend development)
- **Docker & Docker Compose** (optional, for containerized development)
- **Git**
- **Text editor or IDE** (VS Code recommended)

## Option 1: Quick Start with Docker (Easiest)

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/maptoposter.git
cd maptoposter

# Start all services
docker-compose up

# Wait for initialization...
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Clear old containers
docker-compose down --volumes
```

## Option 2: Manual Setup (Detailed Development)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/maptoposter.git
cd maptoposter
```

### Step 2: Set Up Backend

#### Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
# Install main project dependencies
pip install -r requirements.txt

# Install backend dependencies
pip install -r backend/requirements.txt

# Install development tools
pip install pytest pytest-cov black flake8 mypy
```

#### Create Necessary Directories

```bash
mkdir -p cache posters fonts
```

#### Run Backend

```bash
# Using uvicorn directly
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Or use the run script
python backend/main.py
```

**Backend should be running at**: http://localhost:8000

### Step 3: Set Up Frontend

#### Open New Terminal

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

#### Start Development Server

```bash
npm run dev
```

**Frontend should be running at**: http://localhost:5173

### Step 4: Verify Setup

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/api/health
   ```
   Expected response: `{"status":"ok","message":"..."}`

2. **Frontend Loading**:
   - Open http://localhost:5173
   - Should see the Map Poster Generator form

3. **Test API**:
   - Visit http://localhost:8000/docs
   - Click "Try it out" on an endpoint
   - Should see API responses

## Development Workflow

### Running Tests

#### Backend Tests

```bash
# Run all tests
pytest backend/

# Run specific test file
pytest backend/test_main.py

# Run with coverage
pytest --cov=backend backend/

# Run with verbose output
pytest -v backend/
```

#### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality

#### Backend Linting

```bash
# Check Python code
flake8 create_map_poster.py backend/main.py

# Fix formatting issues
black create_map_poster.py backend/

# Type checking
mypy backend/ --ignore-missing-imports
```

#### Frontend Linting

```bash
cd frontend

# Check JavaScript/JSX
npm run lint

# Fix issues automatically
npm run lint --fix
```

### Building for Production

#### Frontend Build

```bash
cd frontend

# Create optimized build
npm run build

# Output goes to dist/
# Preview production build
npm run preview
```

#### Backend Build

```bash
# Create Docker image
docker build -t map-poster-backend:latest .

# Run Docker image
docker run -p 8000:8000 map-poster-backend:latest
```

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend (FastAPI)",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["backend.main:app", "--reload"],
      "jinja": true,
      "justMyCode": true
    },
    {
      "name": "Frontend (Node)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/@vitejs/plugin-react/bin/vite.js",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/frontend"
    }
  ]
}
```

### Browser DevTools

1. **Frontend**: Use Chrome/Firefox DevTools
   - View network requests to backend
   - Check console for errors
   - Debug React components

2. **Backend API**: Visit http://localhost:8000/docs
   - Interactive API documentation
   - Test endpoints directly
   - See request/response bodies

### Logging

#### Backend Logging

Update `backend/main.py`:
```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

#### Frontend Logging

```javascript
// Use console methods
console.log('Debug:', data);
console.warn('Warning:', error);
console.error('Error:', error);

// Or use a logger library
npm install pino  // Fast JSON logger
```

## Database Setup (For Future Features)

### PostgreSQL Locally

```bash
# Using Docker
docker run -d \
  --name postgres-maptoposter \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Connect string
postgresql://postgres:password@localhost/maptoposter
```

### Schema Creation

```python
# backend/database.py
from sqlalchemy import create_engine

engine = create_engine("postgresql://user:password@localhost/maptoposter")
```

## Environment Variables

### Backend (.env or set manually)

```env
CACHE_DIR=./cache
DATABASE_URL=postgresql://localhost/maptoposter
DEBUG=true
LOG_LEVEL=DEBUG
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000
VITE_DEBUG=true
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Use different port
python -m uvicorn backend.main:app --port 8001
```

### Module Import Errors

```bash
# Reinstall dependencies
pip install -e ".[dev]"

# Clear cache
pip cache purge

# Verify Python path
python -c "import sys; print(sys.path)"
```

### CORS Errors Frontend → Backend

**Solution in Backend** (`backend/main.py`):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### OSM Data Download Fails

```bash
# Check internet connection
curl https://nominatim.openstreetmap.org/search?format=json&q=Paris

# Clear cache and retry
rm -rf cache/*

# Try smaller distance
# Changes distance parameter to 8000 instead of 18000
```

### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall everything
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

## Performance Optimization (Development)

### Backend

```python
# Disable debug mode in production
# Update fastapi instantiation
app = FastAPI(debug=False)
```

### Frontend

```javascript
// Use React.memo for component optimization
import React from 'react';

const Component = React.memo(function Component(props) {
  return <div>{props.children}</div>;
});
```

### Database Queries

```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

## IDE Setup

### VS Code Extensions

Recommended extensions for optimal development:

1. **Python**
   - Python (Microsoft)
   - Pylance
   - Black Formatter
   - Flake8

2. **JavaScript/React**
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint

3. **General**
   - Git Graph
   - REST Client
   - Thunder Client

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "ms-python.python",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "files.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/.pytest_cache": true
  }
}
```

## Documentation Building

### API Documentation

```bash
# Built-in Swagger UI
# Visit: http://localhost:8000/docs

# ReDoc documentation
# Visit: http://localhost:8000/redoc
```

### Generate OpenAPI Schema

```python
# In backend/main.py
with open("openapi.json", "w") as f:
    json.dump(app.openapi(), f)
```

## Git Workflow

### Initial Setup

```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
code .

# Commit changes
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Keep Branch Updated

```bash
git fetch origin
git rebase origin/main
```

## Performance Profiling

### Backend Profiling

```python
# Using cProfile
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code here

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats()
```

### Frontend Profiling

```javascript
// React Profiler API
import { Profiler } from 'react';

<Profiler id="app" onRender={onRenderCallback}>
  <App />
</Profiler>
```

## Security Checklist for Development

- [ ] Never commit secrets to git
- [ ] Use `.gitignore` for sensitive files
- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Run security scans
- [ ] Use CORS appropriately
- [ ] Implement rate limiting

## Next Steps

1. **Read the Architecture**: See `ARCHITECTURE.md`
2. **Review Deployment Guides**: Check `docs/` folder
3. **Join Community**: Contribute to GitHub Issues
4. **Setup Pre-commit Hooks**: Automate code quality
5. **Create Tests**: Increase code coverage

---

Happy developing! 🚀

For issues or questions, open a GitHub Issue: https://github.com/yourusername/maptoposter/issues
