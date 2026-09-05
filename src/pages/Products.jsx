import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUpDown, ChevronLeft, ChevronRight, Cog,
  PackageCheck, Search, SlidersHorizontal, Star, Tags, X,
} from 'lucide-react';
import { api } from '../api';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

const PAGE_SIZE = 12;

// Requires the backend to support DRF-style `ordering`. Remove this block and the
// sort control below if your API doesn't expose it — everything else still works.
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: '-name', label: 'Name (Z–A)' },
  { value: '-featured', label: 'Featured first' },
  { value: '-created_at', label: 'Newest first' },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the single source of truth for every filter — so views are
  // shareable and the browser back/forward buttons behave as users expect.
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('loom_brand') || '';
  const division = searchParams.get('division') || '';
  const ordering = searchParams.get('ordering') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [meta, setMeta] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const topRef = useRef(null);

  // Load the filter option lists once.
  useEffect(() => {
    let active = true;
    Promise.all([api.categories({ page_size: 100 }), api.loomBrands({ page_size: 100 })])
      .then(([cat, brandData]) => {
        if (!active) return;
        setCategories(cat.results || []);
        setBrands(brandData.results || []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Merge changes into the URL. Any filter change resets pagination to page 1.
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

  // Keep the search box aligned when the URL changes externally (chips, back button).
  useEffect(() => { setSearchInput(search); }, [search]);

  // Debounce typing into the URL so we don't fire a request on every keystroke.
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return undefined;
    const timer = setTimeout(() => patchParams({ search: trimmed }), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products whenever any query input changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.products({ page, page_size: PAGE_SIZE, search, category, loom_brand: brand, division, ordering })
      .then((data) => {
        if (!active) return;
        setProducts(data.results || []);
        setMeta(data);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setMeta({});
        setError('We couldn’t load the catalogue just now. Check your connection and try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, category, brand, division, ordering, reloadKey]);

  const categoryName = useMemo(
    () => categories.find((c) => String(c.id) === String(category))?.name,
    [categories, category],
  );
  const brandName = useMemo(
    () => brands.find((b) => String(b.id) === String(brand))?.name,
    [brands, brand],
  );

  const activeFilters = [
    search && { key: 'search', label: `“${search}”`, clear: () => { setSearchInput(''); patchParams({ search: '' }); } },
    category && { key: 'category', label: categoryName || 'Category', clear: () => patchParams({ category: '' }) },
    brand && { key: 'loom_brand', label: brandName || 'Loom brand', clear: () => patchParams({ loom_brand: '' }) },
  ].filter(Boolean);
  const hasFilters = activeFilters.length > 0;

  // Clear the filters the user can toggle, but stay inside the current division context.
  const clearAll = () => {
    setSearchInput('');
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const div = prev.get('division');
      if (div) next.set('division', div);
      return next;
    });
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

  // Compact, windowed page list: 1 … 4 5 6 … 20
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
    ? 'Loading products…'
    : totalCount === 0
      ? 'No products found'
      : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;

  return (
    <>
      <PageHero eyebrow="Products" title="Airjet loom spares catalogue" image={pageHeroImages.products} imageAlt="Airjet loom spare products">
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
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by spare, material or loom brand…"
              aria-label="Search products"
            />
          </label>
          <select
            className="select"
            value={category}
            onChange={(e) => patchParams({ category: e.target.value })}
            aria-label="Filter by spare category"
          >
            <option value="">All spare categories</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select
            className="select"
            value={brand}
            onChange={(e) => patchParams({ loom_brand: e.target.value })}
            aria-label="Filter by loom brand"
          >
            <option value="">All loom brands</option>
            {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <section className="section white">
        <div className="wrap">
          <div className="section-head catalogue-head reveal" ref={topRef}>
            <div>
              <p className="eyebrow"><SlidersHorizontal size={14} /> {brandName || 'Complete range'}</p>
              <h2>{headline}</h2>
            </div>
            <label className="catalogue-sort">
              <ArrowUpDown size={15} aria-hidden="true" />
              <span className="sr-only">Sort products</span>
              <select
                className="select"
                value={ordering}
                onChange={(e) => patchParams({ ordering: e.target.value })}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
          </div>

          {hasFilters && (
            <div className="filter-chips" role="group" aria-label="Active filters">
              {activeFilters.map((f) => (
                <button type="button" key={f.key} className="filter-chip" onClick={f.clear}>
                  {f.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="filter-chip filter-chip--clear" onClick={clearAll}>Clear all</button>
            </div>
          )}

          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <div className="catalogue-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="product-card catalogue-card skeleton-card" key={i}>
                    <div className="catalogue-card__media"><div className="skeleton-visual" /></div>
                    <div className="product-body"><span /><strong /><p /></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card catalogue-empty reveal">
                <h3>Catalogue unavailable</h3>
                <p className="muted">{error}</p>
                <button type="button" className="btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
              </div>
            ) : products.length ? (
              <div className="catalogue-grid">
                {products.map((product) => (
                  <article
                    className="product-card catalogue-card reveal"
                    key={product.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`${product.name} — view details`}
                    onClick={() => navigate(`/products/${product.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/products/${product.id}`);
                      }
                    }}
                  >
                    <div className="catalogue-card__media">
                      <span className={`catalogue-card__code${product.featured ? ' is-featured' : ''}`}>
                        {product.featured
                          ? <><Star size={13} aria-hidden="true" /> Featured</>
                          : <><PackageCheck size={14} aria-hidden="true" /> Spare</>}
                      </span>
                      <div className="product-visual">
                        {product.images?.[0]?.url
                          ? <img src={product.images[0].url} alt={product.name} loading="lazy" />
                          : <Cog aria-hidden="true" />}
                      </div>
                    </div>
                    <div className="product-body">
                      <p className="meta"><Tags size={13} aria-hidden="true" /> {product.product_category_name || 'Spare'}</p>
                      <h3>{product.name}</h3>
                      <p className="muted">{product.loom_brand_name || product.compatible_looms || 'Multiple loom brands'}</p>
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
                <p className="muted">Nothing matched these filters. Try a different loom brand, category or product name.</p>
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
                {pageList.map((p) => (typeof p === 'string' ? (
                  <span className="pagination__gap" key={p} aria-hidden="true">…</span>
                ) : (
                  <button
                    type="button"
                    key={p}
                    className={`pagination__page${p === currentPage ? ' is-active' : ''}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                    aria-label={`Page ${p}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
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
