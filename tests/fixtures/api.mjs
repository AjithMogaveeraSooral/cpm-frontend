import { createServer } from 'node:http';

// Deliberately synthetic, isolated records. Nothing is persisted outside tests.
const property = { upid: 'CPM-BLR-WFD-TEST-A101', apartment_name: 'Browser Test Property', city: 'Bengaluru', locality: 'Whitefield', property_type: 'apartment', furnishing: 'semi', bhk: 2, monthly_rent: 30000, deposit: 150000, occupancy_status: 'vacant', amenities: ['Lift'] };
const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  const url = new URL(request.url, 'http://127.0.0.1:4178');
  if (url.pathname === '/healthz') return response.end(JSON.stringify({ status: 'ok' }));
  if (url.pathname === '/api/v1/public/properties') {
    const data = !url.searchParams.get('q') || 'browser test property whitefield'.includes(url.searchParams.get('q').toLowerCase()) ? [property] : [];
    return response.end(JSON.stringify({ success: true, data, meta: { pagination: { page: 1, page_size: 12, total_items: data.length, total_pages: 1 } } }));
  }
  if (url.pathname === `/api/v1/public/properties/${property.upid}`) return response.end(JSON.stringify({ success: true, data: property }));
  if (url.pathname === '/api/v1/public/leads' && request.method === 'POST') {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    const input = JSON.parse(raw);
    if (input.name === 'Failure Test') {
      response.statusCode = 503;
      return response.end(JSON.stringify({ success: false, error: { code: 'unavailable', message: 'Test outage' } }));
    }
    response.statusCode = 201;
    return response.end(JSON.stringify({ success: true, data: { id: 'test-enquiry-reference', ...input, status: 'new' } }));
  }
  response.statusCode = 404;
  response.end(JSON.stringify({ success: false, error: { code: 'not_found', message: 'Not in fixture' } }));
});
server.listen(4178, '127.0.0.1');