import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUpDown, ChevronLeft, ChevronRight, Cog,
  Search, SlidersHorizontal, Star, Tags, X,
} from 'lucide-react';
import { api } from '../api';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: '-featured', label: 'Featured first' },
  { value: '-created_at', label: 'Newest first' },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const brand = searchParams.get('loom_brand') || '';
  const division = searchParams.get('division') || '';
  const ordering = searchParams.get('ordering') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [meta, setMeta] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const topRef = useRef(null);

  const patchParams = (updates, { resetPage = true } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value == null) next.delete(key);
        else next.set(key, value);
      });
      if (resetPage) next.delete('page');
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      api.divisions({ page_size: 500 }),
      api.loomBrands({ page_size: 500, division }),
    ])
      .then(([divisionData, brandData]) => {
        if (!active) return;
        const nextBrands = brandData.results || [];
        setDivisions(divisionData.results || []);
        setBrands(nextBrands);
        if (brand && !nextBrands.some((item) => String(item.id) === String(brand))) {
          patchParams({ loom_brand: '' });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [division, brand]);

  useEffect(() => { setSearchInput(search); }, [search]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return undefined;
    const timer = setTimeout(() => patchParams({ search: trimmed }), 300);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.products({ page, page_size: PAGE_SIZE, search, loom_brand: brand, division, ordering })
      .then((data) => {
        if (!active) return;
        setProducts(data.results || []);
        setMeta(data);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setMeta({});
        setError('We could not load the catalogue just now. Check your connection and try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, brand, division, ordering, reloadKey]);

  const divisionName = useMemo(
    () => divisions.find((item) => String(item.id) === String(division))?.name,
    [divisions, division],
  );
  const brandName = useMemo(
    () => brands.find((item) => String(item.id) === String(brand))?.name,
    [brands, brand],
  );

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => { setSearchInput(''); patchParams({ search: '' }); } },
    division && { key: 'division', label: divisionName || 'Products', clear: () => patchParams({ division: '', loom_brand: '' }) },
    brand && { key: 'loom_brand', label: brandName || 'Brand', clear: () => patchParams({ loom_brand: '' }) },
  ].filter(Boolean);
  const hasFilters = activeFilters.length > 0;

  const clearAll = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const totalCount = meta.count || 0;
  const currentPage = meta.page || page;
  const totalPages = meta.total_pages || 1;
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  const goToPage = (target) => {
    patchParams({ page: String(target) }, { resetPage: false });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageList = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('gap-start');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('gap-end');
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const headline = loading
    ? 'Loading products...'
    : totalCount === 0
      ? 'No products found'
      : `Showing ${rangeStart}-${rangeEnd} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;

  return (
    <>
      <PageHero eyebrow="Products" title="Airjet loom spares catalogue" image={pageHeroImages.products} imageKey="products" imageAlt="Airjet loom spare products">
        <p>Temple rings, loom accessories, plastic and rubber products, air cutter spares, poppet valve parts and selected maintenance items - filter to the exact fitment for your loom.</p>
      </PageHero>

      <div className="filters">
        <div className="wrap filter-row">
          <label className="filter-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              className="input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by spare, material or brand..."
              aria-label="Search products"
            />
          </label>
          <select
            className="select"
            value={division}
            onChange={(event) => patchParams({ division: event.target.value, loom_brand: '' })}
            aria-label="Filter by products"
          >
            <option value="">All Products</option>
            {divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select
            className="select"
            value={brand}
            onChange={(event) => patchParams({ loom_brand: event.target.value })}
            aria-label="Filter by brand"
          >
            <option value="">All Brands</option>
            {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <section className="section white">
        <div className="wrap">
          <div className="section-head catalogue-head reveal" ref={topRef}>
            <div>
              <p className="eyebrow"><SlidersHorizontal size={14} /> {brandName || divisionName || 'Complete range'}</p>
              <h2>Our Product Catalogue</h2>
              <p className="muted catalogue-count">{headline}</p>
            </div>
            <label className="catalogue-sort">
              <ArrowUpDown size={15} aria-hidden="true" />
              <span className="sr-only">Sort products</span>
              <select
                className="select"
                value={ordering}
                onChange={(event) => patchParams({ ordering: event.target.value })}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
          </div>

          {hasFilters && (
            <div className="filter-chips" role="group" aria-label="Active filters">
              {activeFilters.map((filter) => (
                <button type="button" key={filter.key} className="filter-chip" onClick={filter.clear}>
                  {filter.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="filter-chip filter-chip--clear" onClick={clearAll}>Clear all</button>
            </div>
          )}

          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <div className="catalogue-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="product-card catalogue-card skeleton-card" key={index}>
                    <div className="catalogue-card__media"><div className="skeleton-visual" /></div>
                    <div className="product-body"><span /><strong /><p /></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card catalogue-empty reveal">
                <h3>Catalogue unavailable</h3>
                <p className="muted">{error}</p>
                <button type="button" className="btn-primary" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
              </div>
            ) : products.length ? (
              <div className="catalogue-grid">
                {products.map((product) => (
                  <article
                    className="product-card catalogue-card reveal"
                    key={product.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`${product.name} - view details`}
                    onClick={() => navigate(`/products/${product.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/products/${product.id}`);
                      }
                    }}
                  >
                    <div className="catalogue-card__media">
                      {product.featured && (
                        <span className="catalogue-card__code is-featured">
                          <Star size={13} aria-hidden="true" /> Featured
                        </span>
                      )}
                      <div className="product-visual">
                        {product.images?.[0]?.url
                          ? <img src={product.images[0].url} alt={product.name} loading="lazy" />
                          : <Cog aria-hidden="true" />}
                      </div>
                    </div>
                    <div className="product-body">
                      <p className="meta"><Tags size={13} aria-hidden="true" /> {product.division_name || 'Product'}</p>
                      <h3>{product.name}</h3>
                      <p className="muted">{product.loom_brand_name || product.compatible_looms || 'Multiple brands'}</p>
                      {(product.application || product.part_type || product.material) && (
                        <p className="catalogue-card__desc">{product.application || product.part_type || product.material}</p>
                      )}
                      <span className="catalogue-card__link">View details <ArrowRight size={16} aria-hidden="true" /></span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="card catalogue-empty reveal">
                <h3>No matching spares</h3>
                <p className="muted">Nothing matched these filters. Try a different product group, brand or product name.</p>
                {hasFilters && <button type="button" className="btn-secondary" onClick={clearAll}>Clear filters</button>}
              </div>
            )}
          </div>

          {!loading && !error && totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="btn-secondary pagination__nav"
                disabled={!meta.has_previous}
                onClick={() => goToPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="pagination__pages">
                {pageList.map((item) => (typeof item === 'string' ? (
                  <span className="pagination__gap" key={item} aria-hidden="true">...</span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    className={`pagination__page${item === currentPage ? ' is-active' : ''}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    aria-label={`Page ${item}`}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                )))}
              </div>
              <button
                type="button"
                className="btn-secondary pagination__nav"
                disabled={!meta.has_next}
                onClick={() => goToPage(currentPage + 1)}
                aria-label="Next page"
              >
                Next <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
