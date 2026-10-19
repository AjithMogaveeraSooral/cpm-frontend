'use client';

export default function PropertyError({ reset }: { reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-3xl px-6 py-20 text-center"><h2 className="text-2xl font-bold">Unable to load this home</h2><p className="mt-3 text-slate-600">Please try again. Availability has not been confirmed.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-cypress-800 px-5 py-3 font-semibold text-white">Try again</button></div>;
}