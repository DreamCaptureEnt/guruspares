import React from 'react';

export default function PageHero({
  eyebrow,
  title,
  children,
  image,
  imageAlt = '',
  actions,
  className = '',
}) {
  return (
    <section className={`detail-hero page-hero ${className}`.trim()}>
      {image && <img className="page-hero__image" src={image} alt={imageAlt} aria-hidden={!imageAlt} />}
      <div className="wrap reveal">
        {actions}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
