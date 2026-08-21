'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, Search, Sparkles, MessageCircleQuestion } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Rent & Financials' | 'Screening & Safety' | 'Maintenance' | 'NRI Services';
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'How does the ₹0 Onboarding Fee work?',
    answer:
      'We do not charge any upfront registration, property listing, or initial inspection fees. You only pay a standard performance commission once we successfully onboard and secure a verified tenant for your property.',
  },
  {
    id: 'faq-2',
    category: 'Rent & Financials',
    question: 'How and when do I receive my monthly rent payouts?',
    answer:
      'Rent is collected directly via automated payment gateways and transferred to your designated bank account by the 5th of every month. For NRI property owners, we support automated multi-currency transfers (USD, AED, GBP, EUR) with tax-compliant digital statements.',
  },
  {
    id: 'faq-3',
    category: 'Rent & Financials',
    question: 'What happens if a tenant delays or misses rent payments?',
    answer:
      'We enforce strict rental agreements with automated late-fee structures. If a payment is delayed, our dedicated accounts and legal team follow up immediately. Under our Premium plan, you also get Rent Guarantee protection to ensure uninterrupted monthly cash flows.',
  },
  {
    id: 'faq-4',
    category: 'Screening & Safety',
    question: 'How are prospective tenants screened and verified?',
    answer:
      'Every prospective tenant undergoes our comprehensive 5-point verification checklist: official police verification, government ID validation (Aadhaar/Passport/PAN), credit background check, employment/income verification, and prior landlord reference checks.',
  },
  {
    id: 'faq-5',
    category: 'NRI Services',
    question: 'I live abroad as an NRI. How can I monitor my property remotely?',
    answer:
      'Our platform provides a 24/7 Owner Dashboard accessible via web and mobile app. You receive real-time financial updates, digital copies of signed agreements, quarterly move-in/move-out HD video inspection reports, and direct chat with your dedicated Property Manager.',
  },
  {
    id: 'faq-6',
    category: 'Maintenance',
    question: 'How are property repairs and emergency maintenance handled?',
    answer:
      'Tenants log maintenance requests directly through the app. Minor repairs within your pre-approved threshold (e.g., ₹2,000) are resolved instantly by our verified vendor network. For major repairs, we provide itemized cost estimates and photo evidence for your prior approval.',
  },
  {
    id: 'faq-7',
    category: 'General',
    question: 'Who drafts the rental agreement and manages renewal?',
    answer:
      'Our legal experts draft state-compliant rental agreements tailored to your requirements. Agreements are digitally executed via legally binding e-signatures. We also track lease expirations and handle renewal negotiations 60 days prior to contract completion.',
  },
  {
    id: 'faq-8',
    category: 'General',
    question: 'Can I terminate or cancel the property management service?',
    answer:
      'Yes, we believe in complete flexibility without restrictive lock-ins. You can cancel our management services at any time by submitting a 30-day written notice through your dashboard, subject to ongoing tenant lease obligations.',
  },
];

const CATEGORIES = ['All', 'General', 'Rent & Financials', 'Screening & Safety', 'Maintenance', 'NRI Services'] as const;

export function FaqSection() {
  const [openItemIds, setOpenItemIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-cypress-200/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-72 w-72 rounded-full bg-cypress-300/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header Badge & Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cypress-200 bg-cypress-50/80 px-4 py-1.5 text-xs font-bold text-cypress-800 backdrop-blur shadow-sm mb-4">
            <HelpCircle className="h-4 w-4 text-cypress-600" />
            GOT QUESTIONS? WE&apos;VE GOT ANSWERS
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about Cypress Property Management, ₹0 onboarding fees, tenant verification, and NRI property care.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cypress-700 text-white shadow-soft'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List Accordion */}
        <div className="mt-8 space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <MessageCircleQuestion className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-bold text-slate-700">No questions found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try searching for another term or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cypress-700 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border bg-white transition-all duration-200 shadow-soft ${
                    isOpen ? 'border-cypress-300 ring-2 ring-cypress-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Question Row */}
                  <div className="flex items-center justify-between p-5 sm:p-6 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Click + icon to {isOpen ? 'hide' : 'view'} answer
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    {/* ONLY clicking this + icon button toggles/opens the answer */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item.id);
                      }}
                      aria-label={isOpen ? `Close answer for: ${item.question}` : `Open answer for: ${item.question}`}
                      aria-expanded={isOpen}
                      title={isOpen ? 'Click to collapse answer' : 'Click + to open answer'}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cypress-500/40 ${
                        isOpen
                          ? 'border-cypress-600 bg-cypress-600 text-white rotate-45 shadow-md'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-cypress-500 hover:bg-cypress-50 hover:text-cypress-800'
                      }`}
                    >
                      <Plus className="h-5 w-5 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Answer Drawer - opens only when + icon is clicked */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">
                          <div className="rounded-xl border-l-4 border-cypress-500 bg-cypress-50/60 p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-slate-700">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center rounded-2xl border border-cypress-100 bg-cypress-50/50 p-6 sm:p-8">
          <h4 className="text-base font-bold text-slate-900">Have a specific question not answered here?</h4>
          <p className="mt-1 text-sm text-slate-600">
            Our property management specialists are available to assist you 6 days a week.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-lead-modal', { detail: { type: 'callback' } }));
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-cypress-gradient px-5 py-2.5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask a Manager
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
