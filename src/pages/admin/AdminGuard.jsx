import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../../api';

export default function AdminGuard() {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    api.currentUser()
      .then((data) => setState({ loading: false, allowed: Boolean(data.authenticated && data.is_superuser) }))
      .catch(() => setState({ loading: false, allowed: false }));
  }, []);

  if (state.loading) {
    return <div className="min-h-screen bg-slate-100 px-4 py-24 text-center text-slate-500">Checking admin access...</div>;
  }

  if (!state.allowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
