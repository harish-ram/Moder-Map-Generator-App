import React, { useState, useEffect } from 'react';

function MapForm({ onSubmit, loading, apiUrl }) {
  const [formData, setFormData] = useState({
    city: 'Chennai',
    country: 'India',
    display_city: '',
    display_country: '',
    latitude: '',
    longitude: '',
    theme: 'terracotta',
    distance: 18000,
    width: 12.0,
    height: 16.0,
    font_family: '',
    format: 'png',
  });

  const [themes, setThemes] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/themes`);
      const data = await response.json();
      if (data.themes) {
        setThemes(data.themes);
      }
    } catch (err) {
      console.error('Failed to fetch themes:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['distance', 'width', 'height', 'latitude', 'longitude'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || '' : value,
    }));
  };

  const handleGeocode = async (e) => {
    e.preventDefault();
    if (!formData.city || !formData.country) {
      setValidationErrors(['Please enter city and country first']);
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/geocode?city=${encodeURIComponent(formData.city)}&country=${encodeURIComponent(formData.country)}`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
        setValidationErrors([]);
      } else {
        setValidationErrors(['Failed to geocode location']);
      }
    } catch (err) {
      setValidationErrors([`Geocoding error: ${err.message}`]);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const errors = [];
    if (!formData.city) errors.push('City is required');
    if (!formData.country) errors.push('Country is required');
    if (!formData.theme) errors.push('Theme is required');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onSubmit(formData);
  };

  const fontOptions = [
    { value: '', label: 'Default (Roboto)' },
    { value: 'Noto Sans', label: 'Noto Sans' },
    { value: 'Noto Sans Tamil UI', label: 'Tamil (Noto Sans Tamil UI)' },
    { value: 'Noto Sans Devanagari', label: 'Hindi (Noto Sans Devanagari)' },
    { value: 'Noto Sans JP', label: 'Japanese (Noto Sans JP)' },
    { value: 'Noto Sans Arabic', label: 'Arabic (Noto Sans Arabic)' },
    { value: 'Noto Sans CJK JP', label: 'CJK (Noto Sans CJK JP)' },
  ];

  const commonDimensions = [
    { label: 'A3 Portrait (11.7" x 16.5")', width: 11.7, height: 16.5 },
    { label: 'A4 Portrait (8.3" x 11.7")', width: 8.3, height: 11.7 },
    { label: 'A2 Portrait (16.5" x 23.4")', width: 16.5, height: 23.4 },
    { label: 'Square (12" x 12")', width: 12, height: 12 },
    { label: 'Landscape (16" x 12")', width: 16, height: 12 },
  ];

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="map-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City Name *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Paris"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., France"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Display City Name (Optional)</label>
              <input
                type="text"
                name="display_city"
                value={formData.display_city}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., París (for different script)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Country (Optional)</label>
              <input
                type="text"
                name="display_country"
                value={formData.display_country}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Fransa"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Location & Theme</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Theme *</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="form-input"
                required
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Distance (meters)</label>
              <div className="range-group">
                <input
                  type="range"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  min="1000"
                  max="50000"
                  step="1000"
                  className="form-slider"
                />
                <div className="range-display">
                  <span className="range-value">{formData.distance.toLocaleString()}</span>
                  <span className="range-unit">m</span>
                </div>
              </div>
              <small className="form-hint">
                4000-6000m (small/dense) | 8000-12000m (medium) | 15000-20000m (large)
              </small>
            </div>
          </div>

          <div className="geo-section">
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !formData.city || !formData.country}
              className="btn btn-secondary"
            >
              {geocoding ? 'Geocoding...' : 'Auto-Geocode Location'}
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 48.8566"
                step="any"
                min="-90"
                max="90"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 2.3522"
                step="any"
                min="-180"
                max="180"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Poster Dimensions & Style</h2>
            <button
              type="button"
              className="btn-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>
          </div>

          <div className="preset-dimensions">
            <p className="form-label">Quick Presets:</p>
            <div className="preset-buttons">
              {commonDimensions.map((dim, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    width: dim.width,
                    height: dim.height
                  }))}
                  className="btn btn-tertiary"
                >
                  {dim.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Width (inches)</label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                className="form-input"
                step="0.1"
                min="1"
                max="20"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (inches)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="form-input"
                step="0.1"
                min="1"
                max="20"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="form-input"
              >
                <option value="png">PNG (Raster)</option>
                <option value="svg">SVG (Vector)</option>
                <option value="pdf">PDF (Print)</option>
              </select>
            </div>
          </div>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Font Family</label>
                  <select
                    name="font_family"
                    value={formData.font_family}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">Select font for international text support</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="error-message">
            <ul>
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-large"
        >
          {loading ? 'Generating...' : 'Generate Poster'}
        </button>
      </form>
    </div>
  );
}

export default MapForm;
