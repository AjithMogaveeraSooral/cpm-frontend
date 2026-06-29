import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-4 text-slate-600">
        Have a question about a property, your account, or a registration? Reach out — our team is happy to help.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Phone className="h-6 w-6 text-cypress-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">Phone</h3>
          <p className="mt-1 text-sm text-slate-600">+91 80 4000 0000</p>
          <p className="text-sm text-slate-600">Mon–Sat, 9am–7pm IST</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Mail className="h-6 w-6 text-cypress-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">Email</h3>
          <p className="mt-1 text-sm text-slate-600">support@cypresspm.com</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <MapPin className="h-6 w-6 text-cypress-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">Office</h3>
          <p className="mt-1 text-sm text-slate-600">Koramangala, Bengaluru, Karnataka 560034</p>
        </div>
      </div>
    </div>
  );
}
