import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Cog, Factory, LifeBuoy, Package, Wrench } from 'lucide-react';
import { api } from '../api';
import { company, homeSlides, productGroups, strengths } from '../siteData';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [active, setActive] = useState(0);
  const slideCount = homeSlides.length;

  useEffect(() => {
    api.products({ featured: true, page_size: 6 }).then(data => setFeatured(data.results || [])).catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    if (slideCount < 2) return undefined;
    const timer = setInterval(() => setActive(i => (i + 1) % slideCount), 5500);
    return () => clearInterval(timer);
  }, [slideCount]);

  const go = (delta) => setActive(i => (i + delta + slideCount) % slideCount);

  return (
    <>
      <section className="hero">
        <div className="hero-slideshow" aria-hidden="true">
          {homeSlides.map((slide, index) => (
            <img
              key={slide}
              src={slide}
              alt=""
              className={`hero-slide${index === active ? ' is-active' : ''}`}
            />
          ))}
        </div>

        {slideCount > 1 && (
          <>
            <button type="button" className="hero-nav hero-nav--prev" onClick={() => go(-1)} aria-label="Previous slide">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className="hero-nav hero-nav--next" onClick={() => go(1)} aria-label="Next slide">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <div className="hero-dots" role="tablist" aria-label="Slides">
              {homeSlides.map((slide, index) => (
                <button
                  key={slide}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`hero-dot${index === active ? ' is-active' : ''}`}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </>
        )}

        <div className="wrap">
          <div className="hero-content reveal">
            <p className="eyebrow">Madurai based loom spare specialists</p>
            <h1>{company.name}</h1>
            <p>{company.tagline}. We manufacture temple rings, heald frame guides, spacers, lino-bobbin spares, poppet tops, selvedge rollers and custom-made loom components.</p>
            <div className="actions">
              <Link className="btn-primary" to="/products">Browse Products <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/contact">Request Enquiry</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="wrap stat-grid reveal">
          {[
            ['2000', 'Founded and serving textile customers'],
            ['10+', 'Loom brands supported'],
            ['3', 'Product and service divisions'],
            ['South India', 'Customer base focus'],
          ].map(([value, label]) => <div className="stat" key={value}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2">
          <div className="reveal">
            <p className="eyebrow">Who We Are</p>
            <h2>Precision spares for shuttle and shuttle-less airjet looms.</h2>
            <p className="muted">Guru Tex Spares is a manufacturer and supplier of airjet loom spares across Southern India. The facility is equipped for reliable production, custom fitting and maintenance-oriented support.</p>
            <div className="pill-list">{strengths.map(item => <span className="pill" key={item}>{item}</span>)}</div>
          </div>
          <div className="grid-2 reveal">
            {[
              [Factory, 'Manufacturing', 'Well-equipped facility with high-end machinery.'],
              [BadgeCheck, 'Quality', 'Stringent process handling across manufacturing and operations.'],
              [Wrench, 'Custom Work', 'Solutions for temple marks and poppet valve choking.'],
              [LifeBuoy, 'Maintenance', 'Selected spare maintenance, including selvedge rollers.'],
            ].map(([Icon, title, copy]) => (
              <div className="card feature-card" key={title}><Icon color="#0f766e" /><h3>{title}</h3><p className="muted">{copy}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Product Range</p>
              <h2>Built around loom brands, spare types and custom requirements.</h2>
            </div>
            <Link className="btn-secondary" to="/products">View Catalogue <ArrowRight size={16} /></Link>
          </div>
          <div className="product-grid" style={{ marginTop: 28 }}>
            {(featured.length ? featured : productGroups.slice(1, 7).map((name, index) => ({ id: `fallback-${index}`, name, product_category_name: 'Catalogue', part_type: 'Airjet loom spare' }))).map((product) => (
              <Link to={product.id.toString().startsWith('fallback') ? '/products' : `/products/${product.id}`} className="product-card reveal" key={product.id}>
                <div className="product-visual">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} loading="lazy" />
                  ) : (
                    <Cog />
                  )}
                </div>
                <div className="product-body">
                  <p className="meta">{product.product_category_name || product.part_type}</p>
                  <h3>{product.name}</h3>
                  <p className="muted">{product.application || product.part_type || 'Available on enquiry'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap cta-band grid-2 reveal">
          <div>
            <p className="eyebrow">For Enquiries</p>
            <h2>Need a spare, sample, or custom solution?</h2>
            <p className="muted">Share the loom brand, part requirement and issue details. The team can guide availability, compatibility and maintenance options.</p>
          </div>
          <div className="actions">
            <a className="btn-primary" href={`tel:${company.phones[0].replace(/\D/g, '')}`}>{company.phones[0]}</a>
            <a className="btn-secondary" href={`mailto:${company.email}`}>{company.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}