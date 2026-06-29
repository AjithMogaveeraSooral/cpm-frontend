export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">About Cypress</h1>
      <p className="mt-4 text-slate-600">
        Cypress Property Management is an end-to-end platform that brings property owners, tenants, and operations
        teams together. We streamline the entire rental lifecycle — from listing and discovery to tenancy agreements,
        rent collection, and maintenance.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">What we do</h2>
      <ul className="mt-4 space-y-3 text-slate-600">
        <li>• Curated property listings with verified details and a transparent marketplace.</li>
        <li>• Digital tenancy management with approvals, documents, and renewals.</li>
        <li>• Automated rent cycles, receipts, and owner payouts.</li>
        <li>• Maintenance ticketing with vendor coordination and SLA tracking.</li>
        <li>• A dedicated Cypress operations team overseeing quality and approvals.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Three kinds of accounts</h2>
      <p className="mt-4 text-slate-600">
        Whether you&apos;re a <strong>Tenant</strong> looking for a home, a <strong>Property Owner</strong> listing your
        units, or part of the <strong>Cypress Admin</strong> team, there&apos;s a tailored experience for you. Tenant and
        owner registrations are reviewed and approved by our operations team before portal access is granted.
      </p>
    </div>
  );
}
