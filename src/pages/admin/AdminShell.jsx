import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart2, Boxes, Grid3X3, LayoutDashboard, LogOut, PackagePlus } from 'lucide-react';
import { api } from '../../api';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/divisions', label: 'Divisions', Icon: Boxes },
  { to: '/admin/product-categories', label: 'Categories', Icon: Grid3X3 },
  { to: '/admin/loom-brands', label: 'Loom Brands', Icon: Grid3X3 },
  { to: '/admin/products', label: 'Products', Icon: PackagePlus },
  { to: '/admin/products-report', label: 'Products Report', Icon: BarChart2 },
];

export default function AdminShell() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 p-6">
            <Link to="/" className="text-2xl font-black text-slate-900">GuruSpares Admin</Link>
            <p className="mt-1 text-sm text-slate-500">Superuser dashboard</p>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {adminLinks.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                    isActive ? 'bg-teal text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-teal'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-100 p-4">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="text-xl font-black text-slate-900">GuruSpares Admin</Link>
            <button onClick={handleLogout} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
              Logout
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {adminLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${isActive ? 'bg-teal text-white' : 'bg-slate-50 text-slate-600'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
