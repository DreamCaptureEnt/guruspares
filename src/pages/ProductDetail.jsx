import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Cog, FileText, LifeBuoy, Maximize2, ShieldCheck, Wrench } from 'lucide-react';
import { api } from '../api';
import ImageViewer from '../components/ImageViewer';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setSelectedIndex(0);
    api.product(id)
      .then((data) => { if (active) setProduct(data); })
      .catch(() => { if (active) { setProduct(null); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reloadKey]);

  const productImages = product?.images || [];
  const primaryImage = productImages[selectedIndex] || productImages[0];

  const rows = useMemo(() => (product ? [
    ['Spare category', product.product_category_name],
    ['Loom brand', product.loom_brand_name],
    ['Part type', product.part_type],
    ['Material', product.material],
    ['Compatible looms', product.compatible_looms],
    ['Application', product.application],
    ['Status', product.status],
    ['Maintenance', product.maintenance_available ? 'Available on enquiry' : null],
    ['Custom solution', product.custom_solution ? 'Available' : 'Standard product'],
  ].filter(([, value]) => value) : []), [product]);

  const changeImage = (delta) => {
    if (productImages.length < 2) return;
    setSelectedIndex((i) => (i + delta + productImages.length) % productImages.length);
  };

  if (loading) {
    return (
      <>
        <PageHero
          eyebrow="Loom spare"
          title={<span className="sk sk--dark" style={{ display: 'inline-block', width: 'min(440px, 78%)', height: '.85em', borderRadius: 8, verticalAlign: '-2px' }}>&nbsp;</span>}
          image={pageHeroImages.products}
          actions={<span className="btn-secondary" style={{ opacity: .55, pointerEvents: 'none' }}><ArrowLeft size={16} /> Products</span>}
        />
        <section className="section white">
          <div className="wrap product-sheet">
            <div className="product-gallery">
              <div className="sk detail-skeleton__visual" />
              <div className="product-thumbs">
                {Array.from({ length: 4 }).map((_, i) => <div className="sk" key={i} style={{ aspectRatio: '1.25', borderRadius: 8 }} />)}
              </div>
            </div>
            <div className="product-spec-panel">
              <div className="sk" style={{ width: '48%', height: 22, marginBottom: 20 }} />
              {Array.from({ length: 6 }).map((_, i) => <div className="sk" key={i} style={{ height: 16, margin: '14px 0' }} />)}
            </div>
            <aside className="enquiry-panel">
              <div className="sk" style={{ width: 46, height: 46, borderRadius: 8, marginBottom: 14 }} />
              <div className="sk" style={{ width: '55%', height: 22, marginBottom: 14 }} />
              <div className="sk" style={{ height: 62, marginBottom: 18 }} />
              <div className="sk" style={{ height: 44, width: '55%' }} />
            </aside>
          </div>
        </section>
      </>
    );
  }

  if (error || !product) {
    return (
      <section className="section white">
        <div className="wrap card catalogue-empty reveal" style={{ maxWidth: 620, margin: '0 auto' }}>
          <h3>{error ? 'Couldn’t load this product' : 'Product not found'}</h3>
          <p className="muted">
            {error
              ? 'The product details didn’t load. Check your connection and try again.'
              : 'This item may have been moved or is no longer listed.'}
          </p>
          <div className="actions">
            {error && <button type="button" className="btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
            <Link className="btn-secondary" to="/products"><ArrowLeft size={16} /> Back to catalogue</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={product.product_category_name || 'Loom spare'}
        title={product.name}
        image={primaryImage?.url || pageHeroImages.products}
        imageAlt={primaryImage?.file_name || product.name}
        actions={<Link to="/products" className="btn-secondary"><ArrowLeft size={16} /> Products</Link>}
        className={primaryImage?.url ? 'page-hero--product' : ''}
      >
        {product.description && <p>{product.description}</p>}
      </PageHero>

      <section className="section white">
        <div className="wrap product-sheet">
          <div className="product-gallery">
            <button
              type="button"
              className="product-visual product-detail-visual"
              onClick={() => primaryImage && setViewerIndex(selectedIndex)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); changeImage(1); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); changeImage(-1); }
              }}
              disabled={!primaryImage}
              aria-label={primaryImage ? `View larger image of ${product.name}` : product.name}
            >
              {primaryImage?.url
                ? <img src={primaryImage.url} alt={primaryImage.file_name || product.name} />
                : <Cog aria-hidden="true" />}
              {primaryImage?.url && <span className="visual-expand"><Maximize2 size={16} aria-hidden="true" /> View larger</span>}
            </button>

            <div className="product-gallery__meta">
              <span><ShieldCheck size={16} aria-hidden="true" /> Checked catalogue item</span>
              <span><FileText size={16} aria-hidden="true" /> Details available on enquiry</span>
            </div>

            {productImages.length > 1 && (
              <div className="product-thumbs" role="tablist" aria-label={`${product.name} images`}>
                {productImages.map((image, index) => (
                  <button
                    type="button"
                    key={image.id || image.url}
                    role="tab"
                    aria-selected={index === selectedIndex}
                    aria-label={`Show image ${index + 1} of ${productImages.length}`}
                    className={index === selectedIndex ? 'active' : ''}
                    onClick={() => setSelectedIndex(index)}
                    onDoubleClick={() => setViewerIndex(index)}
                  >
                    <img src={image.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-spec-panel">
            <div className="spec-heading">
              <p className="eyebrow"><FileText size={14} aria-hidden="true" /> Product sheet</p>
              <h2>Specifications</h2>
            </div>
            {rows.length ? (
              <dl className="info-list">
                {rows.map(([label, value]) => (
                  <div className="info-row" key={label}>
                    <dt><strong>{label}</strong></dt>
                    <dd><span>{value}</span></dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="muted">Full specifications are available on enquiry.</p>
            )}
          </div>

          <aside className="enquiry-panel">
            <span className="enquiry-panel__icon"><Wrench size={22} aria-hidden="true" /></span>
            <h2>Enquiry support</h2>
            <p className="muted">Share your loom model, part reference, quantity and any wear, choking or temple-mark issue. Guru Tex Spares can advise on availability or custom fitment.</p>
            {(product.featured || product.maintenance_available || product.custom_solution) && (
              <div className="pill-list" style={{ margin: '20px 0' }}>
                {product.featured && <span className="pill"><BadgeCheck size={14} aria-hidden="true" /> Featured</span>}
                {product.maintenance_available && <span className="pill"><LifeBuoy size={14} aria-hidden="true" /> Maintenance</span>}
                {product.custom_solution && <span className="pill"><Wrench size={14} aria-hidden="true" /> Custom solution</span>}
              </div>
            )}
            <Link className="btn-primary" to="/contact">Request a quote</Link>
          </aside>
        </div>
      </section>

      {viewerIndex !== null && (
        <ImageViewer
          images={productImages}
          initialIndex={viewerIndex}
          title={product.name}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}