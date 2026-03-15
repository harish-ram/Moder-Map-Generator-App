#!/usr/bin/env python3
"""
FastAPI backend for Map Poster Generator web application.
Enhanced with caching, background processing, and performance optimizations.
"""

import asyncio
import hashlib
import io
import json
import os
import sys
import tempfile
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from PIL import Image

# Add parent directory to path to import poster generation module
sys.path.insert(0, str(Path(__file__).parent.parent))

from create_map_poster import (
    create_poster,
    get_coordinates,
    load_theme,
    get_available_themes,
    load_fonts,
)
import create_map_poster

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app setup
app = FastAPI(
    title="Map Poster Generator API",
    description="Generate beautiful city map posters with caching and background processing",
    version="2.0.0",
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
POSTERS_DIR = Path("posters")
POSTERS_DIR.mkdir(exist_ok=True)
CACHE_DIR = Path("cache/posters")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Job tracking
job_status: Dict[str, Dict[str, Any]] = {}
executor = ThreadPoolExecutor(max_workers=3)


class PosterGenerationRequest(BaseModel):
    """Request model for poster generation."""
    city: str
    country: str
    display_city: Optional[str] = None
    display_country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    theme: str = "terracotta"
    distance: int = 18000
    width: float = 12.0
    height: float = 16.0
    font_family: Optional[str] = None
    format: str = "png"
    network_type: Optional[str] = None
    preview_mode: bool = False  # Fast preview with low quality


class PosterGenerationResponse(BaseModel):
    """Response model for poster generation."""
    status: str
    message: str
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_path: Optional[str] = None
    error: Optional[str] = None
    job_id: Optional[str] = None


class JobStatusResponse(BaseModel):
    """Response model for job status."""
    job_id: str
    status: str  # "pending", "processing", "completed", "error"
    progress: int  # 0-100
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None


# ============================================================================
# Cache Helper Functions
# ============================================================================

def generate_cache_key(request: PosterGenerationRequest) -> str:
    """
    Generate a deterministic cache key for a poster generation request.
    
    Args:
        request: PosterGenerationRequest
        
    Returns:
        Hexadecimal cache key
    """
    key_data = f"{request.city}_{request.country}_{request.latitude}_{request.longitude}_{request.theme}_{request.distance}_{request.width}_{request.height}_{request.font_family}_{request.format}_{request.preview_mode}"
    return hashlib.sha256(key_data.encode()).hexdigest()


def get_cached_poster(cache_key: str) -> Optional[Path]:
    """
    Retrieve a cached poster file if it exists.
    
    Args:
        cache_key: Cache key hash
        
    Returns:
        Path to cached file, or None if not found
    """
    cache_file = CACHE_DIR / f"{cache_key}.png"
    if cache_file.exists():
        logger.info(f"Found cached poster: {cache_file}")
        return cache_file
    return None


def cache_poster(cache_key: str, source_path: Path) -> bool:
    """
    Cache a generated poster.
    
    Args:
        cache_key: Cache key hash
        source_path: Path to generated poster
        
    Returns:
        True if caching succeeded, False otherwise
    """
    try:
        cache_file = CACHE_DIR / f"{cache_key}.png"
        if source_path.exists():
            import shutil
            shutil.copy2(source_path, cache_file)
            logger.info(f"Cached poster: {cache_file}")
            return True
    except Exception as e:
        logger.warning(f"Failed to cache poster: {e}")
    return False


def generate_thumbnail(image_path: Path) -> Optional[Path]:
    """
    Generate a blurry low-quality thumbnail for progressive image loading.
    Creates a very small, heavily compressed, blurred image for fast loading.
    
    Args:
        image_path: Path to the original image
        
    Returns:
        Path to thumbnail file, or None if generation failed
    """
    try:
        if not image_path.exists():
            return None
            
        # Create thumbnail filename
        thumbnail_path = image_path.parent / f"{image_path.stem}_thumb{image_path.suffix}"
        
        # Open and process image
        with Image.open(image_path) as img:
            # Create a very small version (20px wide, maintains aspect ratio)
            img.thumbnail((20, 20), Image.Resampling.LANCZOS)
            
            # Apply strong blur for the LQIP effect
            from PIL import ImageFilter
            img = img.filter(ImageFilter.GaussianBlur(radius=3))
            
            # Save with high compression for minimal size
            img.save(thumbnail_path, quality=5, optimize=True)
            
            logger.info(f"Generated thumbnail: {thumbnail_path}")
            return thumbnail_path
            
    except Exception as e:
        logger.warning(f"Failed to generate thumbnail: {e}")
        return None


# ============================================================================
# Background Job Processing
# ============================================================================

def generate_poster_job(job_id: str, request: PosterGenerationRequest):
    """
    Background job to generate a poster.
    
    Args:
        job_id: Unique job identifier
        request: PosterGenerationRequest
    """
    try:
        job_status[job_id] = {
            "status": "processing",
            "progress": 0,
            "error": None,
            "image_url": None,
            "thumbnail_url": None,
        }

        # Check cache first
        cache_key = generate_cache_key(request)
        cached_file = get_cached_poster(cache_key)
        
        if cached_file:
            job_status[job_id]["status"] = "completed"
            job_status[job_id]["progress"] = 100
            job_status[job_id]["image_url"] = f"/api/download-poster/{cached_file.name}"
            # Generate thumbnail for cached file
            thumb_path = generate_thumbnail(cached_file)
            if thumb_path:
                job_status[job_id]["thumbnail_url"] = f"/api/download-poster/{thumb_path.name}"
            logger.info(f"Job {job_id} completed (from cache)")
            return

        job_status[job_id]["progress"] = 10

        # Validate theme
        available_themes = get_available_themes()
        if request.theme not in available_themes:
            raise ValueError(f"Theme '{request.theme}' not found")

        job_status[job_id]["progress"] = 20

        # Get coordinates
        if request.latitude and request.longitude:
            coords = [request.latitude, request.longitude]
        else:
            coords = get_coordinates(request.city, request.country)

        job_status[job_id]["progress"] = 30

        # Load theme
        theme_data = load_theme(request.theme)
        create_map_poster.THEME = theme_data

        job_status[job_id]["progress"] = 40

        # Load custom fonts if requested
        custom_fonts = None
        if request.font_family:
            try:
                custom_fonts = load_fonts(request.font_family)
            except Exception as e:
                logger.warning(f"Font loading error: {e}")

        job_status[job_id]["progress"] = 50

        # Adjust parameters for preview mode
        distance = request.distance
        width = request.width
        height = request.height
        dpi_multiplier = 1.0

        if request.preview_mode:
            # Fast preview: lower resolution
            distance = max(request.distance // 2, 3000)
            dpi_multiplier = 0.5
            logger.info("Using preview rendering mode")

        job_status[job_id]["progress"] = 60

        # Generate output filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_city = request.city.replace(" ", "_").replace("/", "_")
        output_filename = f"{safe_city}_{request.theme}_{timestamp}.{request.format}"
        output_path = POSTERS_DIR / output_filename

        job_status[job_id]["progress"] = 70

        # Create poster
        create_poster(
            city=request.city,
            country=request.country,
            point=coords,
            dist=distance,
            output_file=str(output_path),
            output_format=request.format,
            width=int(width),
            height=int(height),
            country_label=None,
            name_label=None,
            display_city=request.display_city,
            display_country=request.display_country,
            fonts=custom_fonts,
        )

        job_status[job_id]["progress"] = 90

        # Cache the poster
        cache_key = generate_cache_key(request)
        cache_poster(cache_key, output_path)

        job_status[job_id]["progress"] = 95
        
        # Generate thumbnail for progressive loading
        thumb_path = generate_thumbnail(output_path)
        if thumb_path:
            job_status[job_id]["thumbnail_url"] = f"/api/download-poster/{thumb_path.name}"
        
        job_status[job_id]["progress"] = 100
        job_status[job_id]["status"] = "completed"
        job_status[job_id]["image_url"] = f"/api/download-poster/{output_filename}"

        logger.info(f"Job {job_id} completed: {output_path}")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        logger.error(traceback.format_exc())
        job_status[job_id]["status"] = "error"
        job_status[job_id]["error"] = str(e)



@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Map Poster Generator API is running",
        "version": "2.0.0",
        "features": ["caching", "background-processing", "preview-mode"]
    }


@app.get("/api/themes")
async def list_themes():
    """Get list of available themes."""
    try:
        themes = get_available_themes()
        return {
            "status": "success",
            "themes": sorted(themes),
            "count": len(themes)
        }
    except Exception as e:
        logger.error(f"Error listing themes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-poster", response_model=PosterGenerationResponse)
async def generate_poster_endpoint(request: PosterGenerationRequest):
    """
    Generate a map poster (foreground or background mode).
    
    If preview_mode=true, generates quickly with lower quality.
    Otherwise, can run in background if requested.
    
    Args:
        request: PosterGenerationRequest with poster parameters
        
    Returns:
        PosterGenerationResponse with status and image URL
    """
    try:
        logger.info(f"Generating poster for {request.city}, {request.country} (preview: {request.preview_mode})")

        # Check cache first
        cache_key = generate_cache_key(request)
        cached_file = get_cached_poster(cache_key)
        
        if cached_file:
            thumb_path = generate_thumbnail(cached_file)
            return PosterGenerationResponse(
                status="success",
                message="Poster retrieved from cache",
                image_url=f"/api/download-poster/{cached_file.name}",
                thumbnail_url=f"/api/download-poster/{thumb_path.name}" if thumb_path else None,
                file_path=str(cached_file)
            )

        # Validate inputs
        available_themes = get_available_themes()
        if request.theme not in available_themes:
            raise ValueError(f"Theme '{request.theme}' not found")

        # Get coordinates
        if request.latitude and request.longitude:
            coords = [request.latitude, request.longitude]
        else:
            coords = get_coordinates(request.city, request.country)

        # Load theme
        theme_data = load_theme(request.theme)
        create_map_poster.THEME = theme_data

        # Load custom fonts if requested
        custom_fonts = None
        if request.font_family:
            try:
                custom_fonts = load_fonts(request.font_family)
            except Exception as e:
                logger.warning(f"Font loading error: {e}")

        # Adjust for preview mode
        distance = request.distance
        if request.preview_mode:
            distance = max(request.distance // 2, 3000)
            logger.info("Using preview rendering mode")

        # Generate output filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_city = request.city.replace(" ", "_").replace("/", "_")
        output_filename = f"{safe_city}_{request.theme}_{timestamp}.{request.format}"
        output_path = POSTERS_DIR / output_filename

        logger.info(f"Creating poster at {output_path}")

        # Create poster
        create_poster(
            city=request.city,
            country=request.country,
            point=coords,
            dist=distance,
            output_file=str(output_path),
            output_format=request.format,
            width=int(request.width),  # type: ignore
            height=int(request.height),  # type: ignore
            country_label=None,
            name_label=None,
            display_city=request.display_city,
            display_country=request.display_country,
            fonts=custom_fonts,
        )

        logger.info(f"Poster created successfully: {output_path}")

        # Cache the result
        cache_poster(cache_key, output_path)
        
        # Generate thumbnail for progressive loading
        thumb_path = generate_thumbnail(output_path)

        return PosterGenerationResponse(
            status="success",
            message="Poster generated successfully",
            image_url=f"/api/download-poster/{output_filename}",
            thumbnail_url=f"/api/download-poster/{thumb_path.name}" if thumb_path else None,
            file_path=str(output_path)
        )

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return PosterGenerationResponse(
            status="error",
            message="Validation error",
            error=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating poster: {e}")
        logger.error(traceback.format_exc())
        return PosterGenerationResponse(
            status="error",
            message="Failed to generate poster",
            error=str(e)
        )


@app.post("/api/generate-poster-async", response_model=Dict[str, Any])
async def generate_poster_async(request: PosterGenerationRequest):
    """
    Generate a map poster in the background.
    
    Returns a job_id that can be used to check status.
    
    Args:
        request: PosterGenerationRequest
        
    Returns:
        Dict with job_id and status
    """
    import uuid
    
    job_id = str(uuid.uuid4())[:8]
    logger.info(f"Started async job {job_id}")
    
    # Execute in background
    executor.submit(generate_poster_job, job_id, request)
    
    return {
        "status": "accepted",
        "job_id": job_id,
        "message": "Poster generation started in background",
        "status_url": f"/api/job-status/{job_id}"
    }


@app.get("/api/job-status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Check the status of a background poster generation job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        JobStatusResponse with current status and progress
    """
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    status_data = job_status[job_id]
    
    return JobStatusResponse(
        job_id=job_id,
        status=status_data["status"],
        progress=status_data.get("progress", 0),
        image_url=status_data.get("image_url"),
        error=status_data.get("error")
    )


@app.get("/api/download-poster/{filename}")
async def download_poster(filename: str):
    """
    Download a generated poster image.
    
    Args:
        filename: Name of the poster file to download
        
    Returns:
        File response with the poster image
    """
    try:
        # Security: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        file_path = POSTERS_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Poster not found")
        
        media_type = "image/png"
        if filename.endswith(".svg"):
            media_type = "image/svg+xml"
        elif filename.endswith(".pdf"):
            media_type = "application/pdf"
        
        return FileResponse(
            file_path,
            media_type=media_type,
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading poster: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/geocode")
async def geocode_location(city: str, country: str):
    """
    Geocode a city and country to get coordinates.
    
    Args:
        city: City name
        country: Country name
        
    Returns:
        Dict with latitude and longitude
    """
    try:
        coords = get_coordinates(city, country)
        return {
            "status": "success",
            "city": city,
            "country": country,
            "latitude": coords[0],
            "longitude": coords[1]
        }
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to geocode: {str(e)}")


@app.get("/api/recent-posters")
async def get_recent_posters(limit: int = 10):
    """
    Get list of recently generated posters.
    
    Args:
        limit: Maximum number of posters to return
        
    Returns:
        List of recent poster files
    """
    try:
        poster_files = sorted(
            POSTERS_DIR.glob("*"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )[:limit]
        
        return {
            "status": "success",
            "posters": [
                {
                    "filename": f.name,
                    "url": f"/api/download-poster/{f.name}",
                    "created": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                    "size": f.stat().st_size
                }
                for f in poster_files
            ]
        }
    except Exception as e:
        logger.error(f"Error listing posters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validate-inputs")
async def validate_inputs(request: PosterGenerationRequest):
    """
    Validate poster generation inputs without generating.
    
    Args:
        request: PosterGenerationRequest to validate
        
    Returns:
        Validation result
    """
    errors = []
    
    if not request.city:
        errors.append("City name is required")
    if not request.country:
        errors.append("Country name is required")
    
    available_themes = get_available_themes()
    if request.theme not in available_themes:
        errors.append(f"Theme '{request.theme}' not found")
    
    if request.distance < 1000 or request.distance > 50000:
        errors.append("Distance must be between 1000 and 50000 meters")
    
    if request.width < 1 or request.width > 20:
        errors.append("Width must be between 1 and 20 inches")
    
    if request.height < 1 or request.height > 20:
        errors.append("Height must be between 1 and 20 inches")
    
    if request.latitude and (request.latitude < -90 or request.latitude > 90):
        errors.append("Latitude must be between -90 and 90")
    
    if request.longitude and (request.longitude < -180 or request.longitude > 180):
        errors.append("Longitude must be between -180 and 180")
    
    return {
        "status": "valid" if not errors else "invalid",
        "errors": errors,
        "valid": len(errors) == 0
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
