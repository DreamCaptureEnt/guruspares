import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Company from './pages/Company';
import Divisions from './pages/Divisions';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Responsibility from './pages/Responsibility';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Preloader from './components/Preloader';
import { ToastProvider } from './components/Toast';
import './index.css';
import './pages/admin/admin.css';

const AdminGuard = lazy(() => import('./pages/admin/AdminGuard'));
const AdminShell = lazy(() => import('./pages/admin/AdminShell'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDivisions = lazy(() => import('./pages/admin/AdminDivisions'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminLoomBrands = lazy(() => import('./pages/admin/AdminLoomBrands'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductsReport = lazy(() => import('./pages/admin/AdminProductsReport'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [pathname]);
  return null;
}

function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canRevealOnScroll = 'IntersectionObserver' in window;
    const observer = canRevealOnScroll ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }) : null;

    let revealIndex = 0;
    const observe = (element) => {
      if (element.dataset.revealObserved) return;
      element.dataset.revealObserved = 'true';
      element.style.setProperty('--reveal-delay', `${Math.min(revealIndex * 45, 240)}ms`);
      revealIndex += 1;
      const rect = element.getBoundingClientRect();
      if (!canRevealOnScroll || rect.top < window.innerHeight * 0.9) {
        element.classList.add('is-visible');
      } else {
        observer.observe(element);
      }
    };
    const scan = (root = document) => {
      if (root.matches?.('.reveal')) observe(root);
      root.querySelectorAll?.('.reveal').forEach(observe);
    };
    scan();
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="section"><div className="wrap card">Loading admin...</div></div>}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminGuard />}>
            <Route element={<AdminShell />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/divisions" element={<AdminDivisions />} />
              <Route path="/admin/product-categories" element={<AdminCategories />} />
              <Route path="/admin/loom-brands" element={<AdminLoomBrands />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products-report" element={<AdminProductsReport />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="page-animate" key={location.pathname} style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/responsibility" element={<Responsibility />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [preloading, setPreloading] = useState(true);
  return (
    <ToastProvider>
      {preloading && <Preloader onComplete={() => setPreloading(false)} />}
      <Router>
        <ScrollToTop />
        <ScrollReveal />
        <AppRoutes />
      </Router>
    </ToastProvider>
  );
}
