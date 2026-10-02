import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { api } from '../api';
import PageHero from '../components/PageHero';
import { useToast } from '../components/Toast';
import { company, pageHeroImages } from '../siteData';

const initialForm = {
  name: '',
  contact: '',
  company_name: '',
  address: '',
  message: '',
};

function validContact(value) {
  const trimmed = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = trimmed.replace(/\D/g, '');
  return emailPattern.test(trimmed) || /^[+()\-\s\d]{7,20}$/.test(trimmed) && phoneDigits.length >= 7;
}

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      company_name: form.company_name.trim(),
      address: form.address.trim(),
      message: form.message.trim(),
    };

    if (!/[A-Za-z]/.test(payload.name)) {
      toast.error('Please enter a valid name with at least one alphabet.');
      return;
    }
    if (!validContact(payload.contact)) {
      toast.error('Please enter a valid phone number or email address.');
      return;
    }
    if (!payload.message) {
      toast.error('Please enter your enquiry details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.contactEnquiry(payload);
      setForm(initialForm);
      toast.success('Enquiry submitted. Guru Tex Spares will contact you soon.');
    } catch (error) {
      toast.error(error.message || 'Could not submit the enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="For enquiries" image={pageHeroImages.contact} imageKey="contact" imageAlt="Guru Tex Spares contact banner">
      </PageHero>

      <section className="section white">
        <div className="wrap grid-2">
          <div className="card contact-card reveal">
            <p className="eyebrow">Reach Us</p>
            <h2>{company.name}</h2>
            <div className="info-list">
              <div className="info-row">
                <strong><MapPin size={16} /> Address</strong>
                <span className="muted">{company.address.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</span>
              </div>
              <div className="info-row">
                <strong><MessageCircle size={16} /> Call / Whatsapp</strong>
                <span className="contact-phone-list">
                  {company.phones.map((phone) => (
                    <a className="muted" key={phone} href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                  ))}
                </span>
              </div>
              <div className="info-row">
                <strong><Mail size={16} /> Email</strong>
                <a className="muted break-link" href={`mailto:${company.email}`}>{company.email}</a>
              </div>
              <div className="info-row">
                <strong>Social</strong>
                <span className="social-links">
                  <a className="muted" href={company.socials.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
                  <a className="muted" href={company.socials.facebook} target="_blank" rel="noreferrer"><Facebook size={16} /> Facebook</a>
                  <a className="muted" href={company.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
                </span>
              </div>
            </div>
          </div>

          <form
            className="card contact-card reveal"
            onSubmit={submit}
          >
            <p className="eyebrow">Quick Enquiry</p>
            <h2>Tell us what you need</h2>
            <input
              className="input"
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              pattern=".*[A-Za-z].*"
              title="Enter a name with at least one alphabet"
              placeholder="Your name"
            />
            <input
              className="input"
              required
              value={form.contact}
              onChange={(event) => updateField('contact', event.target.value)}
              placeholder="Phone / email"
            />
            <input
              className="input"
              required
              value={form.company_name}
              onChange={(event) => updateField('company_name', event.target.value)}
              placeholder="Company name"
            />
            <textarea
              rows={3}
              required
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              placeholder="Company address"
            />
            <textarea
              rows={6}
              required
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              placeholder="Loom brand, spare name, item code, quantity and issue details"
            />
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Enquiry'} <Send size={16} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
