import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

function ConfigurationPanel({ formData, themes, onFormChange, onGeneratePoster, onReset, loading, apiUrl }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  ];

  const handleDimensionPreset = (width, height) => {
    onFormChange('width', width);
    onFormChange('height', height);
  };

  return (
    <div className="config-panel">
      {/* City & Location */}
      <div className="config-section">
        <h3>📍 City & Location</h3>

        <div className="form-group">
          <label className="form-label">City Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.city}
            onChange={(e) => onFormChange('city', e.target.value)}
            placeholder="e.g., Paris"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Country *</label>
          <input
            type="text"
            className="form-input"
            value={formData.country}
            onChange={(e) => onFormChange('country', e.target.value)}
            placeholder="e.g., France"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Display Name (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={formData.display_city}
            onChange={(e) => onFormChange('display_city', e.target.value)}
            placeholder="Alternative city name"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="config-section">
        <h3>🧭 Coordinates</h3>

        <div className="form-group">
          <label className="form-label">Latitude</label>
          <input
            type="number"
            className="form-input"
            value={formData.latitude}
            onChange={(e) => onFormChange('latitude', parseFloat(e.target.value))}
            placeholder="-90 to 90"
            step="0.0001"
            min="-90"
            max="90"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Longitude</label>
          <input
            type="number"
            className="form-input"
            value={formData.longitude}
            onChange={(e) => onFormChange('longitude', parseFloat(e.target.value))}
            placeholder="-180 to 180"
            step="0.0001"
            min="-180"
            max="180"
          />
        </div>

        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          💡 Use the map to click and select coordinates
        </small>
      </div>

      {/* Poster Settings */}
      <div className="config-section">
        <h3>🎨 Poster Settings</h3>

        <div className="form-group">
          <label className="form-label">Theme</label>
          <ThemeSelector
            themes={themes}
            selectedTheme={formData.theme}
            onThemeChange={(theme) => onFormChange('theme', theme)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Distance Radius</label>
          <div className="range-group">
            <input
              type="range"
              className="form-range"
              value={formData.distance}
              onChange={(e) => onFormChange('distance', parseInt(e.target.value))}
              min="1000"
              max="50000"
              step="1000"
            />
            <div className="range-display">
              <span className="range-value">{formData.distance.toLocaleString()}</span>
              <span className="range-unit">m</span>
            </div>
          </div>
          <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            4-6km (small) | 8-12km (medium) | 15-20km (large)
          </small>
        </div>
      </div>

      {/* Export Settings */}
      <div className="config-section">
        <h3>⚙️ Export Settings</h3>

        <div className="form-group">
          <label className="form-label">Dimensions</label>
          <div className="preset-dimensions">
            <div className="preset-buttons">
              {commonDimensions.map((dim, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-tertiary"
                  onClick={() => handleDimensionPreset(dim.width, dim.height)}
                >
                  {dim.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Width (inches)</label>
          <input
            type="number"
            className="form-input"
            value={formData.width}
            onChange={(e) => onFormChange('width', parseFloat(e.target.value))}
            step="0.1"
            min="1"
            max="20"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Height (inches)</label>
          <input
            type="number"
            className="form-input"
            value={formData.height}
            onChange={(e) => onFormChange('height', parseFloat(e.target.value))}
            step="0.1"
            min="1"
            max="20"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Format</label>
          <select
            className="form-select"
            value={formData.format}
            onChange={(e) => onFormChange('format', e.target.value)}
          >
            <option value="png">PNG (Raster)</option>
            <option value="svg">SVG (Vector)</option>
            <option value="pdf">PDF (Print)</option>
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="config-section">
        <div className="section-header">
          <h3 style={{ marginBottom: 0 }}>🔧 Advanced</h3>
          <button
            className="btn-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'}
          </button>
        </div>

        {showAdvanced && (
          <>
            <div className="form-group">
              <label className="form-label">Font Family</label>
              <select
                className="form-select"
                value={formData.font_family}
                onChange={(e) => onFormChange('font_family', e.target.value)}
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                Select for international text support
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.preview_mode || false}
                  onChange={(e) => onFormChange('preview_mode', e.target.checked)}
                  style={{ width: 'auto', marginTop: 0 }}
                />
                Fast Preview Mode
              </label>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                Faster generation with lower quality (~2 seconds vs ~6 seconds)
              </small>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
        <button
          className="btn btn-primary btn-large"
          onClick={onGeneratePoster}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? 'Generating...' : 'Generate Poster'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={loading}
          title="Ctrl + R"
          style={{ padding: '0.65rem 0.75rem' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div style={{ 
        padding: 'var(--spacing-sm)',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
      }}>
        <strong>⌨️ Shortcuts:</strong><br />
        Ctrl+Enter = Generate | Ctrl+R = Reset
      </div>
    </div>
  );
}

export default ConfigurationPanel;
