import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export function PageHeader({ title, subtitle, onAdd, addLabel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500">{subtitle}</p>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-3 text-sm font-black text-white">
          <Plus size={18} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function Pagination({ meta, onPage }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={!meta.has_previous}
        onClick={() => onPage(Math.max((meta.page || 1) - 1, 1))}
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-semibold text-slate-500">Page {meta.page || 1} of {meta.total_pages || 1}</span>
      <button
        type="button"
        disabled={!meta.has_next}
        onClick={() => onPage((meta.page || 1) + 1)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="admin-modal fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="admin-modal__panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title = 'Confirm deletion', message, onConfirm, onCancel }) {
  const dialog = (
    <div className="admin-confirm fixed inset-0 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <button type="button" className="admin-confirm__backdrop absolute inset-0" onClick={onCancel} aria-label="Cancel confirmation" />
      <div className="admin-confirm__panel relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 id="admin-confirm-title" className="text-xl font-black text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(dialog, document.body) : dialog;
}

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
