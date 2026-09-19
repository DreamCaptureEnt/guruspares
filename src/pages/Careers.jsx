import React from 'react';
import { ArrowRight, BadgeCheck, Factory, Mail, Phone, Wrench } from 'lucide-react';
import PageHero from '../components/PageHero';
import { company, pageHeroImages } from '../siteData';

const roles = [
  [Factory, 'Workshop and machining'],
  [BadgeCheck, 'Quality inspection'],
  [Wrench, 'Sales and service support'],
];

export default function Careers() {
  const submitApplication = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `Career application from ${form.get('name')}`;
    const body = [
      `Name: ${form.get('name')}`,
      `Email: ${form.get('email')}`,
      `Phone: ${form.get('phone')}`,
      `Area of interest: ${form.get('interest')}`,
      '',
      'Experience and message:',
      form.get('message'),
    ].join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <PageHero eyebrow="Careers" title="Work with Guru Tex Spares" image={pageHeroImages.careers} imageAlt="Guru Tex Spares careers and workshop">
        <p>For workshop, machining, quality, sales or service opportunities, contact the team with your profile.</p>
      </PageHero>

      <section className="section white">
        <div className="wrap cta-band careers-band reveal">
          <div>
            <p className="eyebrow">Open Applications</p>
            <h2>Share your textile machinery or spare manufacturing experience.</h2>
            <p className="muted">Tell us about CNC/toolroom work, quality inspection, customer support or field service experience.</p>
          </div>
          <div className="career-list">
            {roles.map(([Icon, label]) => (
              <span className="pill" key={label}><Icon size={15} /> {label}</span>
            ))}
          </div>
          <form className="card career-form" onSubmit={submitApplication}>
            <p className="eyebrow">Apply by Email</p>
            <h2>Send your application</h2>
            <p className="muted">Share your details and the email app will open addressed to {company.email}.</p>
            <input className="input" name="name" required placeholder="Full name" />
            <input className="input" name="email" type="email" required placeholder="Email address" />
            <input className="input" name="phone" type="tel" required placeholder="Mobile number" />
            <input className="input" name="interest" required placeholder="Area of interest" />
            <textarea name="message" rows={5} required placeholder="Experience, skills and message" />
            <button className="btn-primary" type="submit">Send Application <ArrowRight size={16} /></button>
            <div className="career-contact">
              {company.phones.map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\D/g, '')}`}>
                  <Phone size={15} aria-hidden="true" /> {phone}
                </a>
              ))}
              <a href={`mailto:${company.email}`}>
                <Mail size={15} aria-hidden="true" /> {company.email}
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
