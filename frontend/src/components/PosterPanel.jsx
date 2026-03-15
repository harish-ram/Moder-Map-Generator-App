import React, { useState } from 'react';
import { Download, RotateCw, Image, Sparkles } from 'lucide-react';

function PosterPanel({ poster, loading, onDownload, onRegenerate }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const aspectRatio = poster ? `${poster.width} / ${poster.height}` : '3 / 4';

  // Reset loaded state when poster changes
  React.useEffect(() => {
    setImageLoaded(false);
  }, [poster]);

  return (
    <div className="poster-panel">
      <div className="poster-header">
        <Image size={18} />
        <span>Poster Preview</span>
        {poster && !loading && <span className="poster-tag">Generated</span>}
      </div>

      <div className="poster-preview-container" style={{ aspectRatio }}>
        {loading ? (
          <div className="poster-loading-placeholder">
            <div className="spinner"></div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Rendering your poster...
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        ) : poster ? (
          <div className="poster-image-wrapper">
            {poster.thumbnail_url && (
              <img
                src={poster.thumbnail_url}
                alt="Poster thumbnail"
                className="poster-preview-image poster-thumbnail"
                style={{
                  opacity: imageLoaded ? 0 : 1,
                  transition: 'opacity 0.3s ease-out',
                }}
              />
            )}
            
            <img
              src={poster.url}
              alt="Generated Poster"
              className="poster-preview-image poster-image"
              onLoad={() => setImageLoaded(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            />
          </div>
        ) : (
          <div className="poster-empty-state">
            <div className="poster-empty-icon">
              <Sparkles size={28} />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Generate your first poster
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Configure your map settings and click Generate
            </div>
          </div>
        )}
      </div>

      {poster && !loading && (
        <>
          <div className="poster-metadata">
            <div className="metadata-item">
              <div className="metadata-label">Theme</div>
              <div className="metadata-value">
                {poster.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Location</div>
              <div className="metadata-value">
                {poster.city}, {poster.country}
              </div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Distance</div>
              <div className="metadata-value">
                {(poster.distance / 1000).toFixed(1)} km
              </div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Dimensions</div>
              <div className="metadata-value">
                {poster.width}" × {poster.height}"
              </div>
            </div>
          </div>

          <div className="poster-actions">
            <button
              className="btn btn-primary btn-icon"
              onClick={onDownload}
              title="Download PNG"
            >
              <Download size={16} />
              Download
            </button>
            <button
              className="btn btn-secondary btn-icon"
              onClick={onRegenerate}
              title="Regenerate with current settings"
            >
              <RotateCw size={16} />
              Regenerate
            </button>
          </div>

          <div className="poster-ready-badge">
            ✓ Ready to download!
          </div>
        </>
      )}
    </div>
  );
}

export default PosterPanel;
