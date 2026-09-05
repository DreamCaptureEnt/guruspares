import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.login(form);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-navy to-teal px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-teal-50 text-teal">
          <Lock size={26} />
        </div>
        <h1 className="mt-6 text-3xl font-black text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Only Django superuser accounts can access this dashboard.</p>
        {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <div className="mt-6 space-y-4">
          <input
            value={form.username}
            onChange={(event) => setForm((value) => ({ ...value, username: event.target.value }))}
            placeholder="Username"
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
          <button disabled={loading} className="w-full rounded-lg bg-teal px-4 py-3 text-sm font-black text-white disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
