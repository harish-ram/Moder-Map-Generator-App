import React from 'react';

function PosterPreview({ poster, apiUrl }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${apiUrl}${poster.url}`;
    link.download = poster.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="preview-container">
      <div className="preview-card">
        <h2>Your Generated Poster</h2>
        <div className="preview-image-wrapper">
          <img
            src={`${apiUrl}${poster.url}`}
            alt="Generated poster"
            className="preview-image"
          />
        </div>
        <div className="preview-actions">
          <button onClick={handleDownload} className="btn btn-primary">
            ⬇️ Download Poster
          </button>
          <p className="preview-info">
            File: {poster.filename}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PosterPreview;
