// Server wrapper for the client-rendered ticket detail view. `generateStaticParams`
// is required for static export (`output: 'export'`). Ticket ids are unknown at
// build time, so we emit a single placeholder page; real ids are resolved on the
// client (see `useParams` in ./view) and served via the SPA 404 fallback.
import TicketDetailView from './view';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function TicketDetailPage() {
  return <TicketDetailView />;
}
