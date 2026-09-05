import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Factory, Wrench } from 'lucide-react';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

const roles = [
  [Factory, 'Workshop and machining'],
  [BadgeCheck, 'Quality inspection'],
  [Wrench, 'Sales and service support'],
];

export default function Careers() {
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
          <Link className="btn-primary" to="/contact">Contact Team <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
