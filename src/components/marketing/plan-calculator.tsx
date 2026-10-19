'use client';

import { useId, useState } from 'react';
import { plans } from '@/lib/site-content';
import p from './pages.module.css';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const MIN = 10000;
const MAX = 200000;

export function PlanCalculator() {
  const [planIndex, setPlanIndex] = useState(0);
  const [rent, setRent] = useState(30000);
  const id = useId();
  const plan = plans[planIndex];
  const percent = parseFloat(plan.rate);
  const fee = Math.round((rent * percent) / 100);

  return (
    <section className={p.calculator} aria-labelledby={`${id}-title`}>
      <div className={p.calcIntro}>
        <span className={p.calcEyebrow}>Fee calculator</span>
        <h2 id={`${id}-title`}>Estimate Your Monthly Management Fee</h2>
        <p>Select a plan and enter the expected monthly rent to see your estimated Cypress fee and balance.</p>
      </div>
      <div className={p.calcControls}>
        <div role="group" aria-label="Select plan" className={p.planPicker}>
          {plans.map((item, index) => (
            <button key={item.name} type="button" aria-pressed={index === planIndex} onClick={() => setPlanIndex(index)}>
              <strong>{item.name}</strong>
              <span>{item.rate}</span>
            </button>
          ))}
        </div>
        <div className={p.rentRow}>
          <label htmlFor={`${id}-rent`}>Monthly Rent (₹)</label>
          <input id={`${id}-rent`} type="number" inputMode="numeric" min={0} max={10000000} step={1000} value={rent} onChange={(event) => setRent(Math.min(10000000, Math.max(0, Math.round(Number(event.target.value) || 0))))} />
        </div>
        <input type="range" aria-label="Monthly rent slider" min={MIN} max={MAX} step={1000} value={Math.min(MAX, Math.max(MIN, rent))} onChange={(event) => setRent(Number(event.target.value))} className={p.slider} />
        <div className={p.sliderScale} aria-hidden="true"><span>₹10,000</span><span>₹50,000</span><span>₹1,00,000</span><span>₹2,00,000</span></div>
      </div>
      <div className={p.estimate} aria-live="polite">
        <span>Your Estimate ({plan.name} Plan)</span>
        <em>Monthly Management Fee</em>
        <strong>{inr.format(fee)}</strong>
        <small>({plan.rate} of {inr.format(rent)}, GST included)</small>
        <hr />
        <em>Estimated Balance to You</em>
        <strong>{inr.format(rent - fee)}</strong>
        <small>Before other deductions (repairs, taxes, etc.)</small>
      </div>
    </section>
  );
}
