import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { ConfirmDialog, formatDate, Modal, PageHeader, Pagination } from './AdminHelpers';

export default function AdminLoomBrands() {
  const [rows, setRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', divisions: [] });
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(null);

  const load = () => api.adminLoomBrands({ page, page_size: 10 }).then((data) => {
    setRows(data.results);
    setMeta(data);
  });

  useEffect(() => {
    api.adminDivisions({ page_size: 500 })
      .then((data) => setDivisions(data.results || []))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [page]);

  const openForm = (row = null) => {
    setEditing(row || {});
    setForm({
      name: row?.name || '',
      divisions: (row?.divisions || []).map(String),
    });
    setError('');
  };

  const toggleDivision = (divisionId) => {
    const id = String(divisionId);
    setForm((current) => ({
      ...current,
      divisions: current.divisions.includes(id)
        ? current.divisions.filter((item) => item !== id)
        : [...current.divisions, id],
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      divisions: form.divisions.map((id) => Number(id)),
    };
    try {
      if (editing.id) await api.updateLoomBrand(editing.id, payload);
      else await api.createLoomBrand(payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (row) => {
    try {
      await api.deleteLoomBrand(row.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div>
      <PageHeader title="Brands" subtitle="Create brand filters and link each brand to one or more Products." onAdd={() => openForm()} addLabel="Add Brand" />
      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Products</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4 font-bold text-slate-900">{row.name}</td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {row.division_names?.length ? row.division_names.join(', ') : 'No Products linked'}
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{formatDate(row.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openForm(row)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Edit size={16} /></button>
                    <button onClick={() => setConfirming(row)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPage={setPage} />

      {editing && (
        <Modal title={editing.id ? 'Edit Brand' : 'Add Brand'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-5">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Brand name"
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
            <div>
              <p className="mb-3 text-sm font-bold text-slate-700">Linked Products</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {divisions.map((division) => (
                  <label key={division.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.divisions.includes(String(division.id))}
                      onChange={() => toggleDivision(division.id)}
                      className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
                    />
                    <span className="text-sm font-bold text-slate-700">{division.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Select one or more Products so the frontend brand filter can update correctly.</p>
            </div>
            <button className="rounded-lg bg-teal px-5 py-3 text-sm font-black text-white">Save Brand</button>
          </form>
        </Modal>
      )}
      {confirming && (
        <ConfirmDialog
          message={`Delete brand "${confirming.name}"? This action cannot be undone.`}
          onCancel={() => setConfirming(null)}
          onConfirm={() => remove(confirming)}
        />
      )}
    </div>
  );
}
