import React, { useState, useEffect } from 'react';

function ThemeSelector({ themes, selectedTheme, onThemeChange }) {
  const themeInfo = {
    terracotta: { colors: ['#d84315', '#f4511e', '#e64a19'] },
    autumn: { colors: ['#c33827', '#d4723a', '#e8ac5e'] },
    ocean: { colors: ['#0288d1', '#0097a7', '#00838f'] },
    sunset: { colors: ['#ff6f00', '#e65100', '#ffb300'] },
    forest: { colors: ['#2e7d32', '#388e3c', '#43a047'] },
    midnight_blue: { colors: ['#1a237e', '#283593', '#3949ab'] },
    pastel_dream: { colors: ['#a78bfa', '#f5d4e6', '#d4a5ff'] },
    monochrome_blue: { colors: ['#1e3a5f', '#456a7a', '#7a9fb5'] },
    contrast_zones: { colors: ['#ffffff', '#000000', '#666666'] },
    gradient_roads: { colors: ['#ff6f00', '#ffa726', '#ffb74d'] },
    warm_beige: { colors: ['#d7ccc8', '#bcaaa4', '#a1887f'] },
    copper_patina: { colors: ['#6a4c4b', '#8d6e63', '#a1887f'] },
    neon_cyberpunk: { colors: ['#ff006e', '#00f5ff', '#b537f2'] },
    emerald: { colors: ['#008b60', '#00b894', '#00c896'] },
    japanese_ink: { colors: ['#2c3e50', '#5d6d7b', '#95a5a6'] },
    blueprint: { colors: ['#002147', '#0d47a1', '#1a73e8'] },
    noir: { colors: ['#1a1a1a', '#333333', '#555555'] },
  };

  return (
    <div className="theme-selector">
      {themes.map(theme => (
        <button
          key={theme}
          className={`theme-card ${selectedTheme === theme ? 'selected' : ''}`}
          onClick={() => onThemeChange(theme)}
          title={theme}
        >
          <div
            className="theme-card-preview"
            style={{
              background: `linear-gradient(135deg, ${
                themeInfo[theme]?.colors?.[0] || '#333'
              } 0%, ${
                themeInfo[theme]?.colors?.[1] || '#666'
              } 100%)`
            }}
          >
            {themeInfo[theme]?.colors && (
              <div style={{
                display: 'flex',
                gap: '4px',
                position: 'absolute'
              }}>
                {themeInfo[theme].colors.map((color, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '1px solid rgba(255,255,255,0.5)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="theme-card-name">
            {theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </button>
      ))}
    </div>
  );
}

export default ThemeSelector;
