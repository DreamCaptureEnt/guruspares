import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Layers, Wrench } from 'lucide-react';
import { api } from '../api';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

export default function Divisions() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.divisions({ page_size: 50 })
      .then((data) => { if (active) setDivisions(data.results || []); })
      .catch(() => { if (active) setError('We couldn’t load divisions just now. Check your connection and try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  return (
    <>
      <PageHero eyebrow="Divisions" title="Product and service areas" image={pageHeroImages.divisions} imageAlt="Textile spare product divisions">
        <p>Organised around airjet loom spares, temple ring solutions and maintenance support - pick an area to see the products that belong to it.</p>
      </PageHero>

      <section className="section white division-section">
        <div className="wrap section-head reveal">
          <div>
            <p className="eyebrow"><Layers size={14} aria-hidden="true" /> Operating areas</p>
            <h2>Choose a division to see matching products</h2>
          </div>
        </div>

        <div className="wrap division-grid" aria-live="polite" aria-busy={loading}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div className="division-card skeleton-card" key={i}>
                <div className="sk" style={{ width: 46, height: 46, borderRadius: 8 }} />
                <div className="sk" style={{ width: 92, height: 26, borderRadius: 999 }} />
                <div className="sk" style={{ width: '72%', height: 26 }} />
                <div className="sk" style={{ height: 14 }} />
                <div className="sk" style={{ height: 14, width: '86%' }} />
              </div>
            ))
          ) : error ? (
            <div className="card catalogue-empty reveal">
              <h3>Divisions unavailable</h3>
              <p className="muted">{error}</p>
              <button type="button" className="btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
            </div>
          ) : divisions.length ? (
            divisions.map((item) => (
              <Link to={`/products?division=${item.id}`} className="division-card reveal" key={item.id}>
                <span className="division-card__icon"><Factory size={22} aria-hidden="true" /></span>
                {item.tag && <span className="division-card__tag">{item.tag}</span>}
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <span className="division-card__footer">
                  <span><Wrench size={15} aria-hidden="true" /> Browse products</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
              </Link>
            ))
          ) : (
            <div className="card catalogue-empty reveal">
              <h3>No divisions yet</h3>
              <p className="muted">Product areas will appear here once they’re published.</p>
              <Link className="btn-secondary" to="/products">Browse all products <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
