import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Download, Search, X } from 'lucide-react';
import { api } from '../../api';
import { formatDate } from './AdminHelpers';

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchAllProducts(filters = {}) {
  const PAGE_SIZE = 100;
  let page = 1;
  let allResults = [];
  while (true) {
    const data = await api.adminProducts({ ...filters, page, page_size: PAGE_SIZE });
    allResults = [...allResults, ...data.results];
    if (allResults.length >= data.count || data.results.length < PAGE_SIZE) break;
    page++;
  }
  return allResults;
}

function exportToCSV(products) {
  const headers = [
    'ID', 'Name', 'Division', 'Product Category', 'Loom Brand',
    'Part Type', 'Material', 'Application', 'Status', 'Featured', 'Description', 'Created At',
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((p) => [
    escape(p.id),
    escape(p.name),
    escape(p.division_name || ''),
    escape(p.product_category_name || ''),
    escape(p.product_chemical_category_name || ''),
    escape(p.part_type || p.formulation || ''),
    escape(p.material || p.composition || ''),
    escape(p.application || p.packing_size || ''),
    escape(p.status || ''),
    escape(p.featured ? 'Yes' : 'No'),
    escape(p.description || ''),
    escape(p.created_at ? new Date(p.created_at).toLocaleDateString() : ''),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `products-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── sort icon ───────────────────────────────────────────────────────────────

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ArrowUpDown size={14} className="ml-1 inline opacity-40" />;
  return sortDir === 'asc'
    ? <ArrowUp size={14} className="ml-1 inline text-teal" />
    : <ArrowDown size={14} className="ml-1 inline text-teal" />;
}

// ─── status badge ────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:    'bg-slate-100 text-slate-500 border-slate-200',
  discontinued:'bg-red-50 text-red-600 border-red-200',
};

function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const lower = status.toLowerCase();
  const cls = STATUS_COLORS[lower] || 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${cls}`}>
      {status}
    </span>
  );
}

// ─── FilterSelect helper ──────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options, placeholder = 'All' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function AdminProductsReport() {
  const navigate = useNavigate();
  // reference data
  const [divisions, setDivisions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chemicalCategories, setChemicalCategories] = useState([]);

  // all fetched products (unfiltered from server — client-side sort/search)
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // filters
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [chemicalFilter, setChemicalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // sorting
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // ── load reference data + all products ──────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.adminDivisions({ page_size: 100 }),
      api.adminCategories({ page_size: 100 }),
      api.adminChemicalCategories({ page_size: 100 }),
    ]).then(([d, c, cc]) => {
      setDivisions(d.results);
      setCategories(c.results);
      setChemicalCategories(cc.results);
    });

    fetchAllProducts()
      .then((results) => setAllProducts(results))
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  // ── derived: unique statuses from data ──────────────────────────────────────
  const statuses = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.status).filter(Boolean));
    return [...set].sort().map((s) => ({ id: s, name: s }));
  }, [allProducts]);

  // ── filtered + sorted products ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = allProducts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.material || p.composition || '').toLowerCase().includes(q) ||
        (p.part_type || p.formulation || '').toLowerCase().includes(q) ||
        (p.application || p.packing_size || '').toLowerCase().includes(q)
      );
    }

    if (divisionFilter) result = result.filter((p) => String(p.division) === divisionFilter);
    if (categoryFilter) result = result.filter((p) => String(p.product_category) === categoryFilter);
    if (chemicalFilter) result = result.filter((p) => String(p.product_chemical_category) === chemicalFilter);
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (featuredFilter !== '') result = result.filter((p) => (p.featured ? 'yes' : 'no') === featuredFilter);

    // sort
    result = [...result].sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allProducts, search, divisionFilter, categoryFilter, chemicalFilter, statusFilter, featuredFilter, sortKey, sortDir]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [search, divisionFilter, categoryFilter, chemicalFilter, statusFilter, featuredFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || divisionFilter || categoryFilter || chemicalFilter || statusFilter || featuredFilter !== '';

  const clearFilters = () => {
    setSearch('');
    setDivisionFilter('');
    setCategoryFilter('');
    setChemicalFilter('');
    setStatusFilter('');
    setFeaturedFilter('');
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      exportToCSV(filtered);
    } finally {
      setExporting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────
  const ColHeader = ({ label, col, className = '' }) => (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-5 py-4 hover:bg-slate-100 ${className}`}
      onClick={() => toggleSort(col)}
    >
      {label}
      <SortIcon column={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── page header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                  onClick={() => navigate(-1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft size={20} />
                </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Products Report</h1>
                <p className="text-sm text-slate-500">
                  {loading ? 'Loading…' : `${filtered.length} of ${allProducts.length} products`}
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting || loading || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? 'Exporting…' : `Export ${filtered.length} rows`}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 py-6 space-y-5">

        {/* ── error ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── filters bar ──────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* text search */}
            <div className="flex flex-col gap-1 xl:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, material, part type..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>

            <FilterSelect label="Division" value={divisionFilter} onChange={setDivisionFilter} options={divisions} />
            <FilterSelect label="Product Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
            <FilterSelect label="Loom Brand" value={chemicalFilter} onChange={setChemicalFilter} options={chemicalCategories} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                <option value="">All</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* second row: featured + clear */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Featured</span>
              {[
                { label: 'All', val: '' },
                { label: 'Yes', val: 'yes' },
                { label: 'No', val: 'no' },
              ].map(({ label, val }) => (
                <button
                  key={val}
                  onClick={() => setFeaturedFilter(val)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                    featuredFilter === val
                      ? 'bg-teal text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── table ────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Loading products…
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
              <p className="text-lg font-bold">No products found</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm font-bold text-teal hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <ColHeader label="Name" col="name" />
                  <ColHeader label="Division" col="division_name" />
                  <ColHeader label="Category" col="product_category_name" />
                  <ColHeader label="Loom Brand" col="product_chemical_category_name" />
                  <ColHeader label="Part Type" col="part_type" />
                  <ColHeader label="Application" col="application" />
                  <ColHeader label="Status" col="status" />
                  <th className="px-5 py-4">Featured</th>
                  <ColHeader label="Created" col="created_at" className="text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{row.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.division_name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.product_category_name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.product_chemical_category_name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.part_type || row.formulation || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.application || row.packing_size || '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                    <td className="px-5 py-3.5">
                      {row.featured
                        ? <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">Yes</span>
                        : <span className="text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── pagination ────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                // show pages around current page
                let p;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                      page === p ? 'bg-teal text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
