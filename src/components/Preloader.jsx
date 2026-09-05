import React, { useEffect, useState } from 'react';
import { company } from '../siteData';

const TEETH = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export default function Preloader({ onComplete }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(() => onComplete?.(), 300);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`preloader${hide ? ' preloader--hide' : ''}`}>
      <div className="preloader__content">
        <svg
          className="preloader__logo"
          viewBox="0 0 120 120"
          role="img"
          aria-label="Loading"
        >
          <g fill="#8DB0F0">
            {TEETH.map((angle) => (
              <rect
                key={angle}
                x="53"
                y="2"
                width="14"
                height="24"
                rx="3"
                transform={`rotate(${angle} 60 60)`}
              />
            ))}
            <circle cx="60" cy="60" r="42" />
          </g>
          <circle cx="60" cy="60" r="26" fill="#fff" />
        </svg>
        <strong>{company.name}</strong>
        <p>Airjet Loom Spares</p>
      </div>
    </div>
  );
}