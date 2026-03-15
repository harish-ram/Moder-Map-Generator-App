# Architecture & Technical Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (Client)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          React Frontend Application                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │  Header Comp │  │  MapForm Comp│  │ Preview Comp│  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │         │                │                  │           │   │
│  │         └────────────────┼──────────────────┘           │   │
│  │                    API Client                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                   │
│                    (HTTP/JSON Requests)                        │
│                            │                                   │
└───────────┬────────────────┬────────────────┬────────────────┘
            │                │                │
    ┌───────▼────────┐ ┌─────▼──────┐  ┌─────▼──────────┐
    │ GitHub Pages   │ │  Render    │  │  Railway / Fly │
    │  (Frontend)    │ │  (Backend) │  │  (Backend)     │
    └────────────────┘ └──────┬─────┘  └────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   FastAPI Backend    │
                    └──────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
    ┌─────────────┐      ┌──────────────┐    ┌──────────────┐
    │  OSMnx      │      │ GeoPandas    │    │  Matplotlib  │
    │ OpenStreetMap       │ GeoDataFrame │    │ Visualization│
    └─────────────┘      └──────────────┘    └──────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Geocoded Map Data  │
                    │   (PNG/SVG/PDF)     │
                    └─────────────────────┘
```

## Component Architecture

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Navigation and branding
│   │   ├── MapForm.jsx        # Main form component
│   │   └── PosterPreview.jsx  # Generated poster display
│   ├── styles/
│   │   └── App.css            # Global styles
│   ├── App.jsx                # Root app component
│   └── main.jsx               # Entry point
├── vite.config.js             # Vite configuration
├── nginx.conf                 # Production web server config
└── Dockerfile                 # Frontend container image
```

**Key Features:**
- **Responsive Design**: Mobile-first CSS with media queries
- **Form Validation**: Client-side validation with error messages
- **API Integration**: RESTful API client for backend communication
- **Image Preview**: Display and download generated posters
- **Theme Selection**: Dynamic theme picker with real-time display

### Backend (FastAPI + Python)

```
backend/
└── main.py                     # FastAPI application
    ├── API Endpoints
    │   ├── /api/health        # Health check
    │   ├── /api/themes        # List themes
    │   ├── /api/generate-poster   # Main endpoint
    │   ├── /api/geocode       # Location lookup
    │   ├── /api/validate-inputs   # Input validation
    │   ├── /api/download-poster   # File download
    │   └── /api/recent-posters    # Recent generation history
    └── Models
        └── PosterGenerationRequest  # Pydantic model
```

**Architecture Patterns:**
- **Request Models**: Pydantic BaseModel for validation
- **Response Models**: Structured JSON responses
- **Error Handling**: Comprehensive exception handling
- **Logging**: Structured logging for debugging
- **Async Support**: FastAPI's async/await support for I/O

### Data Flow

#### 1. Poster Generation Flow

```
User Form Submission
      │
      ▼
Frontend Validation
      │
      ▼
POST /api/generate-poster
      │
      ├─ Input Validation (Pydantic)
      │
      ├─ Geocoding (if coords not provided)
      │  └─ GeoPy.Nominatim.geocode()
      │
      ├─ Fetch OSM Data
      │  ├─ os/graph_from_point() - Street network
      │  ├─ ox/features_from_point() - Water features
      │  └─ ox/features_from_point() - Parks
      │
      ├─ Load Theme
      │  └─ Load JSON theme file
      │
      ├─ Create Poster
      │  ├─ Setup matplotlib figure
      │  ├─ Plot street layers
      │  ├─ Plot water/parks
      │  ├─ Apply theme colors
      │  ├─ Add typography (city name, coords)
      │  └─ Save to file (PNG/SVG/PDF)
      │
      └─ Return File URL
         └─ Frontend displays preview
```

#### 2. Geocoding Flow

```
User Input: "Paris, France"
      │
      ▼
GeoPy Nominatim Geocoder
      │
      ├─ Query: "Paris, France"
      │
      ▼
OpenStreetMap Nominatim Service
      │
      ├─ Returns: lat, lon, bounding box
      │
      ▼
Cached Result
      │
      └─ Return coordinates to frontend
```

#### 3. Caching Strategy

```
Cache Lookup (by key hash)
      │
      ├─ FOUND ──────────────────────► Return cached data
      │
      └─ NOT FOUND
         │
         └─ Fetch from OSM ──────────► Cache Result ──────► Return data
```

## Database/Storage

### File-Based Caching (Current)

```
cache/
├── graph_lat_lon_dist.pkl         # Street network graph
├── water_lat_lon_dist.pkl         # Water features
├── parks_lat_lon_dist.pkl         # Park features
└── [hash-based filenames].pkl     # Other cached data
```

**Current**: Pickle files for fast serialization
**Future**: PostgreSQL for user data/history

### Generated Posters

```
posters/
├── Paris_terracotta_20240115_143022.png
├── Tokyo_noir_20240115_143045.png
└── [city_theme_timestamp].[format]
```

## Deployment Architectures

### Option 1: Docker Compose (Local)

```
┌─────────────────────────────────┐
│     Docker Compose Orchestration │
├─────────────────────────────────┤
│                                 │
│ ┌──────────────┐  ┌───────────┐ │
│ │ Backend      │  │ Frontend  │ │
│ │ Container    │  │ Container │ │
│ │ Port: 8000   │  │ Port: 3000│ │
│ └──────────────┘  └───────────┘ │
│      │                   │       │
│      └───────────────────┘       │
│        Network Bridge            │
│                                 │
└─────────────────────────────────┘
```

### Option 2: Cloud Deployment (Render/Railway)

```
┌──────────────────────────┐
│    GitHub Repository     │
│  (Source Code + Config)  │
└────────────┬─────────────┘
             │
             ▼ (Git Push)
┌──────────────────────────────────────────┐
│         GitHub Actions                   │
│  (Build, Test, Deploy)                   │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────┐  ┌────────────────┐ │
│ │ Backend Service │  │Frontend Service│ │
│ │(Render/Railway) │  │(Pages/Vercel)  │ │
│ └─────────────────┘  └────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

### Option 3: GitHub Pages + External Backend

```
┌──────────────────────────┐
│   GitHub Pages           │
│   (Frontend Static)      │
│   domain.github.io       │
└────────┬─────────────────┘
         │
         │ API Calls
         │
         ▼
┌──────────────────────────┐
│  External Backend Service│
│  (Render/Railway/Fly.io) │
│  api.domain.com          │
└──────────────────────────┘
```

## API Contract

### Request Flow

```javascript
Frontend → Backend
{
  method: 'POST',
  url: '/api/generate-poster',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    city: string,
    country: string,
    latitude?: number,
    longitude?: number,
    theme: string,
    distance: number,
    width: number,
    height: number,
    format: 'png' | 'svg' | 'pdf',
    font_family?: string
  }
}
```

### Response Flow

```javascript
Backend → Frontend
{
  status: 'success' | 'error',
  message: string,
  image_url?: string,    // URL to download
  file_path?: string,    // Server-side path
  error?: string         // Error details
}
```

## Theme Architecture

### Theme Structure (JSON)

```json
{
  "name": "Terracotta",
  "description": "Warm, earthy tones",
  "bg": "#faf3ed",
  "text": "#2d1810",
  "roads": "#c97c58",
  "water": "#b3d9ff",
  "parks": "#c8d68f",
  "gradient_color": "#faf3ed"
}
```

### Theme Application Flow

```
Theme Selection (Dropdown)
      │
      ▼
Load Theme JSON
      │
      ├─ Background color
      ├─ Text color
      ├─ Road colors
      ├─ Water colors
      └─ Parks colors
      │
      ▼
Apply to Matplotlib
      │
      └─ Create poster with colors
```

## Font Management

### Font Resolution

```
Requested Font
      │
      ├─ Check Google Fonts Cache
      │  └─ If available, use cached font
      │
      └─ Check System Fonts
         └─ Load from /fonts directory
```

### Supported Scripts

- **Latin**: Default, spacing applied
- **CJK**: Chinese, Japanese, Korean - no spacing
- **South Asian**: Tamil, Hindi, etc. - proper Unicode handling
- **Arabic**: Right-to-left support
- **Thai**: Complex script handling

## Error Handling Strategy

```
User Input
    │
    ├─ Frontend Validation
    │  └─ Show error immediately
    │
    ├─ Backend Validation (Pydantic)
    │  └─ Return 422 Unprocessable Entity
    │
    ├─ Geocoding Failure
    │  └─ Return 500 with error message
    │
    ├─ OSM Data Fetch Failure
    │  └─ Retry with fallback options
    │
    └─ File Generation Failure
       └─ Log error, return 500
```

## Performance Considerations

### Caching Layers

1. **Browser Cache**: Static assets (CSS, JS)
2. **OSM Data Cache**: Pickle files for street/water/parks
3. **Theme Cache**: In-memory JSON theme loading
4. **Font Cache**: Font file caching

### Optimization Techniques

1. **Image Compression**:
   - PNG: 300 DPI for print quality
   - SVG: Vector format (no compression)
   - PDF: Native print format

2. **Lazy Loading**:
   - Load themes on demand
   - Load fonts only when needed

3. **Rate Limiting**:
   - Limit requests per IP
   - Queue long-running jobs

4. **Timeouts**:
   - OSM data fetch: 30s timeout
   - Poster generation: 60s timeout
   - API response: 90s timeout

## Security Architecture

### Input Validation

```python
# Pydantic models ensure:
- Type safety
- Required fields
- Range validation
- Pattern matching (regex)
```

### API Security

- **CORS**: Configure allowed origins
- **Rate Limiting**: Prevent abuse
- **Input Sanitization**: Safe file paths
- **Error Messages**: Don't expose internals

### File Security

- **Path Traversal Prevention**: Validate filenames
- **File Permissions**: Restrict access
- **Storage Location**: Separate uploads folder
- **Cleanup**: Remove old files periodically

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**: Distribute requests
2. **Multiple Instances**: Run 2-10 backend instances
3. **Shared Cache**: Use Redis/Memcached for distributed cache
4. **Database**: Use managed PostgreSQL

### Vertical Scaling

1. **Increase CPU/Memory**: Upgrade instance type
2. **Optimize Code**: Profile and optimize bottlenecks
3. **Caching**: More aggressive caching strategies
4. **Database Indexes**: Optimize queries

### Asynchronous Processing

```python
# For future: Use task queue for long-running jobs
from celery import Celery

app = Celery('maptoposter')

@app.task
def generate_poster_async(params):
    # Long-running task
    return result
```

## Monitoring & Logging

### Key Metrics

- **API Response Time**: Track latency
- **Error Rate**: Monitor failures
- **Cache Hit Rate**: Measure cache effectiveness
- **Resource Usage**: CPU, memory, disk
- **User Activity**: Requests per hour

### Logging Strategy

```python
# Backend logging levels
DEBUG - Development details
INFO - Important events (poster generated)
WARNING - Potential issues (cache miss)
ERROR - Failures (OSM fetch failed)
CRITICAL - System failures
```

## Future Enhancements

### Phase 2: Users & Authentication

```
User Registration → Store in PostgreSQL
      │
      ▼
API Key Management
      │
      ▼
Rate Limiting per User
```

### Phase 3: Advanced Features

- Batch generation
- Scheduled jobs
- Custom themes creator
- Share/export functionality

### Phase 4: Mobile App

- React Native application
- Offline capability
- Share to social media

---

**This architecture supports:**
- ✅ High availability
- ✅ Horizontal scaling
- ✅ Easy deployment
- ✅ Performance optimization
- ✅ Future growth
