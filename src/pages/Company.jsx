import React from 'react';
import { Award, Factory, Lightbulb, Settings, ShieldCheck, Target } from 'lucide-react';
import PageHero from '../components/PageHero';
import { company, pageHeroImages, strengths } from '../siteData';

const companyCards = [
  [Factory, 'Facility', 'Equipped for precision spare manufacturing.'],
  [Settings, 'Operations', 'Process-led handling from production to supply.'],
  [ShieldCheck, 'Reliability', 'Customer-tested custom-made products.'],
  [Award, 'Experience', 'Serving textile customers since 2000.'],
];

const whyChoose = [
  ['Technical Expertise', 'Our team brings strong technical knowledge and practical industry experience to manufacture precision-focused textile machinery spares.'],
  ['Organized Work Process', 'We follow a structured and efficient operational process to ensure smooth production, consistency, and dependable service.'],
  ['Specialized Manufacturing', 'We manufacture rubber and engineering plastic spares designed to meet textile machinery requirements with accuracy and reliability.'],
  ['Custom Solution Expertise', 'We provide customized solutions for specific machinery requirements, including temple-related applications and Airjet poppet valve needs.'],
  ['Customer-Focused Support', 'We work closely with customers to understand their requirements and provide suitable products and timely assistance.'],
  ['Cost-Effective Products', 'Our products are developed with a focus on durability, performance, and cost-effectiveness, making them a reliable choice for our customers.'],
];

export default function Company() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Reliable loom spare manufacturing from Madurai."
        image={pageHeroImages.company}
        imageAlt="Guru Tex Spares manufacturing facility"
      >
        <p>{company.name} is a trusted manufacturer and supplier of textile machinery spares for shuttle and shuttle-less looms, with practical support for machinery requirements across Southern India.</p>
      </PageHero>

      <section className="section white">
        <div className="wrap grid-2">
          <div className="reveal">
            <p className="eyebrow">Who We Are</p>
            <h2>More than two decades of focused textile spare expertise.</h2>
            <p className="muted">
              Established in 2000, Guru Tex Spares has built strong experience in supplying reliable spare parts, rubber
              components, engineering plastic parts, and customized solutions for different loom requirements. We started
              by supplying spares for Ruti &lsquo;C&rsquo; looms and gradually expanded our product range to support
              different textile machinery requirements.
            </p>
            <p className="muted">
              Today, we manufacture and supply rubber spares, engineering plastic components, temple-related parts, gears,
              bobbin components, poppet valve parts, and other customized loom spares. With more than two decades of
              industry experience, our focus remains on delivering reliable, durable, and cost-effective products while
              understanding each customer&rsquo;s specific machinery requirement.
            </p>
            <p className="muted">
              Our focus is on quality, durability, practical solutions, and dependable customer support.
            </p>
            <div className="pill-list">
              {strengths.map((item) => <span className="pill" key={item}>{item}</span>)}
            </div>
          </div>

          <div className="grid-2 reveal">
            {companyCards.map(([Icon, title, copy]) => (
              <div className="card feature-card" key={title}>
                <Icon color="#0f766e" />
                <h3>{title}</h3>
                <p className="muted">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap company-statement-grid">
          <article className="card company-statement reveal">
            <span className="statement-icon"><Target size={22} aria-hidden="true" /></span>
            <p className="eyebrow">Vision</p>
            <h2>To become the most preferable and reliable weaving machinery spare supplier in the world.</h2>
          </article>
          <article className="card company-statement reveal">
            <span className="statement-icon"><Lightbulb size={22} aria-hidden="true" /></span>
            <p className="eyebrow">Mission</p>
            <h2>Future-ready weaving machinery spare solutions through innovative technology and continuous updates.</h2>
            <p className="muted">
              Through innovative technology and a high-tech process with continuous updates, we aim to meet customer
              requirements. Guru Tex Spares is committed to providing exceptional service, focused on delivering superior
              quality through world-class technology.
            </p>
          </article>
        </div>
      </section>

      <section className="section white">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Why Choose Guru Tex Spares</p>
              <h2>Built for fitment, durability and dependable support.</h2>
            </div>
          </div>
          <div className="grid-3">
            {whyChoose.map(([title, copy]) => (
              <article className="card feature-card reveal" key={title}>
                <ShieldCheck color="#343a94" aria-hidden="true" />
                <h3>{title}</h3>
                <p className="muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}