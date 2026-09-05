import React from 'react';
import { ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import PageHero from '../components/PageHero';
import { company, pageHeroImages } from '../siteData';

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="For enquiries" image={pageHeroImages.contact} imageAlt="Guru Tex Spares contact banner">
        <p>Send your loom brand, spare requirement, drawing/photo if available, and quantity.</p>
      </PageHero>

      <section className="section white">
        <div className="wrap grid-2">
          <div className="card contact-card reveal">
            <p className="eyebrow">Reach Us</p>
            <h2>{company.name}</h2>
            <div className="info-list">
              <div className="info-row">
                <strong><MapPin size={16} /> Address</strong>
                <span className="muted">{company.address.join(', ')}</span>
              </div>
              {company.phones.map((phone) => (
                <div className="info-row" key={phone}>
                  <strong><Phone size={16} /> Call</strong>
                  <a className="muted" href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                </div>
              ))}
              <div className="info-row">
                <strong><Mail size={16} /> Email</strong>
                <a className="muted break-link" href={`mailto:${company.email}`}>{company.email}</a>
              </div>
              <div className="info-row">
                <strong><ExternalLink size={16} /> IndiaMart</strong>
                <a className="muted break-link" href={company.indiamart} target="_blank" rel="noreferrer">{company.indiamart}</a>
              </div>
            </div>
          </div>

          <form
            className="card contact-card reveal"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = `mailto:${company.email}?subject=Guru Tex Spares enquiry`;
            }}
          >
            <p className="eyebrow">Quick Enquiry</p>
            <h2>Tell us what you need</h2>
            <input className="input" required placeholder="Your name" />
            <input className="input" required placeholder="Phone / email" />
            <textarea rows={6} required placeholder="Loom brand, spare name, quantity and issue details" />
            <button className="btn-primary" type="submit">Email Enquiry <Send size={16} /></button>
          </form>
        </div>
      </section>
    </>
  );
}
