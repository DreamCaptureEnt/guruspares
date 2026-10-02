import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function PageHero({
  eyebrow,
  title,
  children,
  image,
  imageKey,
  imageOverride,
  imageAlt = '',
  actions,
  className = '',
}) {
  const [siteImage, setSiteImage] = useState('');

  useEffect(() => {
    if (!imageKey) return undefined;
    let active = true;
    api.siteImages()
      .then((data) => {
        if (active) setSiteImage(data.heroes?.[imageKey] || '');
      })
      .catch(() => {
        if (active) setSiteImage('');
      });
    return () => { active = false; };
  }, [imageKey]);

  const displayImage = imageOverride || siteImage || image;

  return (
    <section className={`detail-hero page-hero ${className}`.trim()}>
      {displayImage && <img className="page-hero__image" src={displayImage} alt={imageAlt} aria-hidden={!imageAlt} />}
      <div className="wrap reveal">
        {actions}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
