import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';

function normalizeImage(image) {
  return typeof image === 'string' ? { url: image, mobile_url: '' } : image;
}

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
  const [siteImages, setSiteImages] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!imageKey) return undefined;
    let active = true;
    api.siteImages()
      .then((data) => {
        if (!active) return;
        const slides = data.hero_slides?.[imageKey] || (data.heroes?.[imageKey] ? [data.heroes[imageKey]] : []);
        setSiteImages(slides.filter((slide) => slide.url || slide.mobile_url));
        setActive(0);
      })
      .catch(() => {
        if (active) setSiteImages([]);
      });
    return () => { active = false; };
  }, [imageKey]);

  useEffect(() => {
    if (imageOverride || siteImages.length < 2) return undefined;
    const timer = setInterval(() => setActive((current) => (current + 1) % siteImages.length), 5500);
    return () => clearInterval(timer);
  }, [imageOverride, siteImages.length]);

  const fallbackImage = normalizeImage(image);
  const slides = imageOverride
    ? [normalizeImage(imageOverride)]
    : siteImages.length
      ? siteImages.map(normalizeImage)
      : [fallbackImage].filter(Boolean);
  const hasMany = !imageOverride && slides.length > 1;
  const go = (delta) => setActive((current) => (current + delta + slides.length) % slides.length);

  return (
    <section className={`detail-hero page-hero ${className}`.trim()}>
      {slides.map((slide, index) => {
        const desktopUrl = slide?.url || slide?.mobile_url;
        if (!desktopUrl) return null;
        return (
          <picture key={`${desktopUrl}-${slide.mobile_url || ''}-${index}`}>
            {slide.mobile_url && <source media="(max-width: 560px)" srcSet={slide.mobile_url} />}
            <img
              className={`page-hero__image${index === active ? ' is-active' : ''}`}
              src={desktopUrl}
              alt={imageAlt}
              aria-hidden={!imageAlt || index !== active}
            />
          </picture>
        );
      })}
      {hasMany && (
        <>
          <button type="button" className="page-hero-nav page-hero-nav--prev" onClick={() => go(-1)} aria-label="Previous hero image">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" className="page-hero-nav page-hero-nav--next" onClick={() => go(1)} aria-label="Next hero image">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className="page-hero-dots" role="tablist" aria-label="Hero images">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={`${slide.url || slide.mobile_url}-${index}`}
                role="tab"
                aria-selected={index === active}
                aria-label={`Show hero image ${index + 1}`}
                className={`page-hero-dot${index === active ? ' is-active' : ''}`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </>
      )}
      <div className="wrap reveal">
        {actions}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
