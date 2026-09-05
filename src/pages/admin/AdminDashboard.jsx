import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Grid3X3, PackagePlus, Download, BarChart2 } from 'lucide-react';
import { api } from '../../api';

// Utility: fetch ALL products (pages through until exhausted)
async function fetchAllProducts() {
  const PAGE_SIZE = 100;
  let page = 1;
  let allResults = [];
  while (true) {
    const data = await api.adminProducts({ page, page_size: PAGE_SIZE });
    allResults = [...allResults, ...data.results];
    if (allResults.length >= data.count || data.results.length < PAGE_SIZE) break;
    page++;
  }
  return allResults;
}

function exportToCSV(products) {
  const headers = [
    'ID', 'Name', 'Division', 'Product Category', 'Loom Brand',
    'Part Type', 'Material', 'Application', 'Status', 'Featured', 'Created At',
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
    escape(p.created_at ? new Date(p.created_at).toLocaleDateString() : ''),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ divisions: 0, categories: 0, chemicalCategories: 0, products: 0 });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    Promise.all([
      api.adminDivisions({ page_size: 1 }),
      api.adminCategories({ page_size: 1 }),
      api.adminChemicalCategories({ page_size: 1 }),
      api.adminProducts({ page_size: 1 }),
    ]).then(([divisions, categories, chemicalCategories, products]) => {
      setStats({
        divisions: divisions.count,
        categories: categories.count,
        chemicalCategories: chemicalCategories.count,
        products: products.count,
      });
    });
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      const products = await fetchAllProducts();
      exportToCSV(products);
    } catch (err) {
      setExportError(err.message || 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const cards = [
    { label: 'Divisions', value: stats.divisions, Icon: Boxes },
    { label: 'Product Categories', value: stats.categories, Icon: Grid3X3 },
    { label: 'Loom Brands', value: stats.chemicalCategories, Icon: Grid3X3 },
    { label: 'Products', value: stats.products, Icon: PackagePlus },
  ];

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-500">Manage the dynamic Guru Tex Spares catalogue.</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Products Report */}
          <Link
            to="/admin/products-report"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <BarChart2 size={16} />
            View Report
          </Link>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60"
          >
            <Download size={16} />
            {exporting ? `Exporting ${stats.products} products…` : 'Export Products CSV'}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {exportError}
        </div>
      )}

      {/* Stats cards */}
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-3 text-4xl font-black text-slate-900">{value}</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-teal-50 text-teal">
                <Icon size={26} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
