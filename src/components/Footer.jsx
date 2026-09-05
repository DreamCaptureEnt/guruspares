import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { brandAssets, company, productGroups } from '../siteData';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark"><img src={brandAssets.logo} alt="" /></span>
            <span>
              <strong>{company.name}</strong>
              <small>Airjet Loom Spares</small>
            </span>
          </div>
          <p>{company.tagline}. Precision parts, practical custom solutions, and maintenance support from Madurai.</p>
        </div>
        <div>
          <h3>Products</h3>
          {productGroups.slice(1, 6).map((item) => <Link key={item} to="/products">{item}</Link>)}
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/company">Who We Are</Link>
          <Link to="/divisions">Divisions</Link>
          <Link to="/responsibility">Responsibility</Link>
          <Link to="/careers">Careers</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${company.phones[0].replace(/\D/g, '')}`}><Phone size={15} /> {company.phones[0]}</a>
          <a href={`tel:${company.phones[1].replace(/\D/g, '')}`}><Phone size={15} /> {company.phones[1]}</a>
          <a href={`mailto:${company.email}`}><Mail size={15} /> {company.email}</a>
          <span><MapPin size={15} /> {company.address.join(', ')}</span>
        </div>
      </div>
      <div className="wrap footer-bottom">Copyright 2026 Guru Tex Spares. All rights reserved.</div>
    </footer>
  );
}
