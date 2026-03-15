# Map to Poster

Create beautiful city map posters from OpenStreetMap data using either:
- a Python CLI for direct generation, or
- a React + FastAPI web app for interactive generation.

This repository contains a complete end-to-end implementation: map data retrieval, styling themes, multilingual typography support, and export workflows.

## What This Project Includes

- **CLI poster generator** (`create_map_poster.py`)
- **FastAPI backend** (`backend/main.py`)
- **React frontend** (`frontend/`)
- **17+ theme presets** (`themes/`)
- **Docker & Docker Compose setup** for local development
- **Deployment guides** for Render, Railway, Fly.io, and GitHub Pages (frontend)

## Key Features

- Generate posters for cities worldwide
- Customize theme, dimensions, distance, and output format
- Multilingual labels with optional Google Font integration
- PNG, SVG, and PDF export support (via web app flow)
- Caching for faster repeated requests
- Frontend + backend split architecture suitable for cloud deployment

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000` (or Vite dev port, depending on compose mode)
- Backend API docs: `http://localhost:8000/docs`

### Option 2: Manual Setup

#### Backend

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
# Windows PowerShell
$env:VITE_API_URL="http://localhost:8000"
# macOS/Linux
# VITE_API_URL=http://localhost:8000 npm run dev
npm run dev
```

## CLI Usage

Generate a poster directly from the command line:

```bash
python create_map_poster.py --city "Paris" --country "France" --theme terracotta
```

List themes:

```bash
python create_map_poster.py --list-themes
```

### Useful CLI Options

- `--city`, `--country` (required)
- `--theme` select theme
- `--distance` map radius in meters
- `--width`, `--height` output size in inches
- `--display-city`, `--display-country` custom label text
- `--font-family` custom Google Font

## Web API Overview

Important endpoints:

- `GET /api/themes` – list available themes
- `POST /api/generate-poster` – generate a poster
- `GET /api/job-status/{job_id}` – check async status
- `GET /api/health` – health check

Interactive docs are available at `http://localhost:8000/docs` when backend is running.

## Deployment

This project supports multiple deployment patterns:

- **Full-stack on cloud platform**: Render / Railway / Fly.io
- **Frontend on GitHub Pages + backend elsewhere**

> GitHub Pages is static hosting only. It can host the frontend build, but backend APIs must run on another service.

See:
- `DEPLOYMENT.md`
- `docs/GITHUB_PAGES_DEPLOYMENT.md`
- `docs/RENDER_DEPLOYMENT.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/FLY_DEPLOYMENT.md`

## Project Structure

```text
maptoposter/
├── create_map_poster.py
├── font_management.py
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── themes/
├── docs/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Contributing

Contributions are welcome. If you’d like to improve this project, please follow these guidelines:

1. **Fork and create a branch**
   - Use a clear branch name, e.g. `feature/add-theme` or `fix/api-timeout`.
2. **Keep changes focused**
   - One feature/fix per PR where possible.
3. **Run checks before submitting**
   - Backend import/test checks
   - Frontend build (`npm run build`)
4. **Update docs when behavior changes**
   - Especially deployment/setup instructions.
5. **Open a Pull Request with context**
   - Describe what changed, why it changed, and how to test it.

### Suggested Development Flow

```bash
# 1) Sync latest
 git checkout main
 git pull

# 2) Branch
 git checkout -b feature/your-change

# 3) Work + test

# 4) Commit
 git add .
 git commit -m "Describe your change"

# 5) Push + PR
 git push -u origin feature/your-change
```

## License

This project is licensed under the MIT License. See `LICENSE`.

## Acknowledgments

- OpenStreetMap contributors for open geographic data
- OSMnx and FastAPI communities for excellent tooling
