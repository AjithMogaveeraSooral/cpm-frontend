// IndexedDB-backed durable storage for tenant rent payments.
//
// Payment records embed an uploaded receipt (image/PDF) as a base64 data URL,
// which can exceed the ~5MB localStorage quota. As with property media, these
// are therefore stored in IndexedDB so they survive refreshes and never fail to
// save. Rent payments are excluded from the zustand localStorage persist and
// managed through this module instead.

import type { RentPayment } from './payment';

const DB_NAME = 'cpm-payments';
const DB_VERSION = 1;
const STORE = 'rent_payments';

function hasIDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// idbLoadRentPayments returns all stored rent payments (newest first).
export async function idbLoadRentPayments(): Promise<RentPayment[]> {
  if (!hasIDB()) return [];
  try {
    const db = await openDB();
    const items = await new Promise<RentPayment[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as RentPayment[]) ?? []);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
    return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  } catch {
    return [];
  }
}

// idbSaveRentPayment durably persists a single payment. Rejects on quota/write
// failure so callers can surface the error to the user.
export async function idbSaveRentPayment(payment: RentPayment): Promise<void> {
  if (!hasIDB()) return;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(payment);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
