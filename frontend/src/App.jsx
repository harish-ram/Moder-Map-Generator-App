import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import Header from './components/Header';
import ConfigurationPanel from './components/ConfigurationPanel';
import MapPreview from './components/MapPreview';
import PosterPanel from './components/PosterPanel';
import Toast from './components/Toast';

function App() {
  const [formData, setFormData] = useState({
    city: 'Chennai',
    country: 'India',
    display_city: '',
    display_country: '',
    latitude: 13.0827,
    longitude: 80.2707,
    theme: 'terracotta',
    distance: 18000,
    width: 12.0,
    height: 16.0,
    font_family: '',
    format: 'png',
    preview_mode: false,
  });

  const [generatedPoster, setGeneratedPoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState([]);
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [toasts, setToasts] = useState([]);
  const [jobId, setJobId] = useState(null);

  // Load themes on mount
  useEffect(() => {
    fetchThemes();
    // Set up keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleGeneratePoster();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Poll job status if generating in background
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/job-status/${jobId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setGeneratedPoster({
            url: data.image_url,
            filename: data.image_url?.split('/').pop() || 'poster.png',
            ...formData,
          });
          setLoading(false);
          setJobId(null);
          addToast('Poster generated successfully!', 'success');
          clearInterval(pollInterval);
        } else if (data.status === 'error') {
          addToast(data.error || 'Failed to generate poster', 'error');
          setLoading(false);
          setJobId(null);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [jobId, apiUrl, formData]);

  const fetchThemes = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/themes`);
      const data = await response.json();
      if (data.themes) {
        setThemes(data.themes);
      }
    } catch (err) {
      addToast('Failed to load themes', 'error');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMapClick = (lat, lng) => {
    handleFormChange('latitude', lat);
    handleFormChange('longitude', lng);
    addToast('Coordinates updated from map', 'success');
  };

  const handleGeneratePoster = async () => {
    if (!formData.city || !formData.country) {
      addToast('Please enter city and country', 'warning');
      return;
    }

    setLoading(true);
    try {
      const requestData = { ...formData };

      // Use preview mode for quick generation
      const response = await fetch(`${apiUrl}/api/generate-poster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...requestData, preview_mode: formData.preview_mode }),
      });

      const data = await response.json();

      if (data.status === 'success' && data.image_url) {
        setGeneratedPoster({
          url: data.image_url,
          thumbnail_url: data.thumbnail_url,
          filename: data.file_path?.split('/').pop() || 'poster.png',
          ...formData,
        });
        addToast('Poster generated successfully!', 'success');
      } else {
        addToast(data.error || 'Failed to generate poster', 'error');
      }
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      city: 'Chennai',
      country: 'India',
      display_city: '',
      display_country: '',
      latitude: 13.0827,
      longitude: 80.2707,
      theme: 'terracotta',
      distance: 18000,
      width: 12.0,
      height: 16.0,
      font_family: '',
      format: 'png',
      preview_mode: false,
    });
    setGeneratedPoster(null);
    addToast('Form reset', 'info');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const downloadPoster = () => {
    if (generatedPoster) {
      const link = document.createElement('a');
      link.href = `${apiUrl}${generatedPoster.url}`;
      link.download = generatedPoster.filename;
      link.click();
      addToast('Poster downloaded', 'success');
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="app-main">
        <section className="dashboard-highlights" aria-label="Application quick status">
          <div className="highlight-card">
            <span className="highlight-label">Current Theme</span>
            <span className="highlight-value">
              {formData.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="highlight-card">
            <span className="highlight-label">Active Radius</span>
            <span className="highlight-value">{(formData.distance / 1000).toFixed(1)} km</span>
          </div>
          <div className="highlight-card">
            <span className="highlight-label">Output</span>
            <span className="highlight-value">{formData.format.toUpperCase()}</span>
          </div>
          <div className="highlight-card highlight-status">
            <span className="highlight-label">Generation Status</span>
            <span className={`status-pill ${loading ? 'busy' : 'ready'}`}>
              {loading ? 'Processing' : 'Ready'}
            </span>
          </div>
        </section>

        <div id="workspace" className="workspace">
          <ConfigurationPanel
            formData={formData}
            themes={themes}
            onFormChange={handleFormChange}
            onGeneratePoster={handleGeneratePoster}
            onReset={resetForm}
            loading={loading}
          />

          <section className="preview-layout" aria-label="Map and generated output">
            <MapPreview
              latitude={formData.latitude}
              longitude={formData.longitude}
              distance={formData.distance}
              onMapClick={handleMapClick}
              city={formData.city}
              country={formData.country}
            />
            <PosterPanel
              poster={generatedPoster}
              loading={loading}
              onDownload={downloadPoster}
              onRegenerate={handleGeneratePoster}
            />
          </section>
        </div>
      </main>
      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
