import React from 'react';
import { CheckCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

const items = [
  'Maintain practical quality checks during manufacturing',
  'Recommend compatible spares for the stated loom brand',
  'Support custom solutions for recurring operational issues',
  'Handle maintenance enquiries transparently and practically',
];

export default function Responsibility() {
  return (
    <>
      <PageHero eyebrow="Responsibility" title="Quality-led supply for production-critical loom parts." image={pageHeroImages.responsibility} imageAlt="Quality focused loom spare manufacturing">
        <p>Every spare has to fit a real machine, solve a real stoppage and earn trust on the shop floor.</p>
      </PageHero>

      <section className="section white">
        <div className="wrap grid-3">
          {items.map((item) => (
            <div className="card feature-card reveal" key={item}>
              <CheckCircle color="#0f766e" />
              <h3>{item}</h3>
              <p className="muted">A focused operating principle for reliable textile spare supply.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
