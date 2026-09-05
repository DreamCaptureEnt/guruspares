import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { pageHeroImages } from '../siteData';

const posts = [
  'Choosing the right temple ring',
  'Reducing poppet valve choking',
  'When to service selvedge rollers',
];

export default function Blog() {
  return (
    <>
      <PageHero eyebrow="Updates" title="Textile spare notes and product updates" image={pageHeroImages.blog} imageAlt="Textile machinery update banner">
        <p>Use this section for maintenance tips, product announcements and loom spare guidance.</p>
      </PageHero>

      <section className="section white">
        <div className="wrap grid-3">
          {posts.map((title) => (
            <article className="card post-card reveal" key={title}>
              <p className="eyebrow">Guide</p>
              <h2>{title}</h2>
              <p className="muted">A practical note for customers and maintenance teams.</p>
              <Link className="btn-secondary" to="/contact">Ask About This</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
