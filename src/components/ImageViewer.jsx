import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Minus, Plus, RotateCcw, X } from 'lucide-react';

export default function ImageViewer({ images = [], initialIndex = 0, title = 'Image preview', onClose }) {
  const safeImages = useMemo(() => images.filter((image) => image?.url), [images]);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const current = safeImages[index];
  const hasMany = safeImages.length > 1;

  useEffect(() => {
    setIndex(Math.min(Math.max(initialIndex, 0), Math.max(safeImages.length - 1, 0)));
    setZoom(1);
  }, [initialIndex, safeImages.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });

  const go = (direction) => {
    setZoom(1);
    setIndex((value) => (value + direction + safeImages.length) % safeImages.length);
  };

  if (!current) return null;

  const overlay = (
    <div className="image-viewer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="image-viewer__backdrop" type="button" onClick={onClose} aria-label="Close image viewer" />

      <div className="image-viewer__panel">
        <div className="image-viewer__topbar">
          <div>
            <p className="image-viewer__eyebrow">{index + 1} / {safeImages.length}</p>
            <h2>{current.file_name || title}</h2>
          </div>
          <div className="image-viewer__actions">
            <button type="button" onClick={() => setZoom((value) => Math.max(.5, Number((value - .25).toFixed(2))))} aria-label="Zoom out"><Minus size={18} /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(3, Number((value + .25).toFixed(2))))} aria-label="Zoom in"><Plus size={18} /></button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw size={18} /></button>
            <a href={current.url} download={current.file_name || true} aria-label="Download image"><Download size={18} /></a>
            <a href={current.url} target="_blank" rel="noreferrer" aria-label="Open image in new tab"><ExternalLink size={18} /></a>
            <button type="button" onClick={onClose} aria-label="Close image viewer"><X size={19} /></button>
          </div>
        </div>

        <div className="image-viewer__stage">
          {hasMany && (
            <button className="image-viewer__nav image-viewer__nav--prev" type="button" onClick={() => go(-1)} aria-label="Previous image">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="image-viewer__canvas">
            <img src={current.url} alt={current.file_name || title} style={{ transform: `scale(${zoom})` }} />
          </div>
          {hasMany && (
            <button className="image-viewer__nav image-viewer__nav--next" type="button" onClick={() => go(1)} aria-label="Next image">
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {hasMany && (
          <div className="image-viewer__thumbs">
            {safeImages.map((image, imageIndex) => (
              <button
                key={image.id || image.url}
                type="button"
                className={imageIndex === index ? 'active' : ''}
                onClick={() => {
                  setIndex(imageIndex);
                  setZoom(1);
                }}
                aria-label={`View image ${imageIndex + 1}`}
              >
                <img src={image.url} alt={image.file_name || `Thumbnail ${imageIndex + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(overlay, document.body)
    : overlay;
}