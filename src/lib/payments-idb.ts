// Offline means an external bank/UPI transfer, not an offline app submission.
// Legacy account-wide records must never be loaded, merged or auto-submitted.

import type { RentPayment } from './payment';

// Explicit cleanup only: do not automatically delete a user's legacy evidence.
export async function clearLegacyRentPayments(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('cpm-payments');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close older CPM tabs to remove legacy payment storage.'));
  });
}

/** @deprecated Payment loading is authenticated and online-only. */
export async function idbLoadRentPayments(): Promise<RentPayment[]> {
  return [];
}

/** @deprecated Local payment writes are disabled, including pending records. */
export async function idbSaveRentPayment(_payment: RentPayment): Promise<void> {
  throw new Error('Local payment storage is disabled. Submit to the server while connected.');
}
