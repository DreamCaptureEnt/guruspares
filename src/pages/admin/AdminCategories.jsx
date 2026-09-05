import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { formatDate, Modal, PageHeader, Pagination } from './AdminHelpers';

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = () => api.adminCategories({ page, page_size: 10 }).then((data) => {
    setRows(data.results);
    setMeta(data);
  });

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [page]);

  const openForm = (row = null) => {
    setEditing(row || {});
    setName(row?.name || '');
    setError('');
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing.id) await api.updateCategory(editing.id, { name });
      else await api.createCategory({ name });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete product category "${row.name}"?`)) return;
    try {
      await api.deleteCategory(row.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Product Categories" subtitle="Create categories used by product records." onAdd={() => openForm()} addLabel="Add Category" />
      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4 font-bold text-slate-900">{row.name}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{formatDate(row.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openForm(row)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Edit size={16} /></button>
                    <button onClick={() => remove(row)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPage={setPage} />

      {editing && (
        <Modal title={editing.id ? 'Edit Product Category' : 'Add Product Category'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-5">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Product category name" className="w-full rounded-lg border border-slate-200 px-4 py-3" />
            <button className="rounded-lg bg-teal px-5 py-3 text-sm font-black text-white">Save Category</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
