import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Phone, Mail, X } from 'lucide-react';
import { brandAssets, company } from '../siteData';

const links = [
  ['Home', '/'],
  ['Company', '/company'],
  ['Divisions', '/divisions'],
  ['Products', '/products'],
  ['Responsibility', '/responsibility'],
  ['Blog', '/blog'],
  ['Careers', '/careers'],
  ['Contact', '/contact'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar-inner">
          <span>{company.tagline}</span>
          <div className="topbar-links">
            {company.phones.map(phone => (
              <a key={phone} href={`tel:${phone.replace(/\D/g, '')}`}><Phone size={14} /> {phone}</a>
            ))}
            <a href={`mailto:${company.email}`}><Mail size={14} /> {company.email}</a>
          </div>
        </div>
      </div>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark"><img src={brandAssets.logo} alt="" /></span>
            <span><strong>{company.name}</strong><small>Airjet Loom Spares</small></span>
          </Link>
          <nav className="nav-links">
            {links.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <Link className="nav-cta" to="/contact">Enquire</Link>
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        </div>
      </header>
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <button className="mobile-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />
        <aside>
          <div className="mobile-head">
            <span>{company.name}</span>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
          </div>
          {links.map(([label, to]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Link className="nav-cta mobile-cta" to="/contact" onClick={() => setOpen(false)}>Send Enquiry</Link>
        </aside>
      </div>
    </>
  );
}
