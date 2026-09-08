// IndexedDB-backed durable storage for user-uploaded property media.
//
// The main app state is persisted with zustand's `persist` middleware, which
// uses localStorage. localStorage has a ~5MB quota — far too small for
// walkthrough videos (and even a few photos) stored as base64 data URLs, so
// those uploads silently failed to persist and vanished on refresh. IndexedDB
// offers a much larger, disk-backed quota, so media saved here survives page
// reloads. Attachments are therefore excluded from the localStorage persist and
// managed through this module instead.

import type { PropertyAttachmentBucket } from './data-store';

const DB_NAME = 'cpm-media';
const DB_VERSION = 1;
const STORE = 'attachments';

function hasIDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// idbLoadAllAttachments returns every stored property attachment bucket keyed by
// property id. Returns an empty map when IndexedDB is unavailable or errors.
export async function idbLoadAllAttachments(): Promise<Record<string, PropertyAttachmentBucket>> {
  if (!hasIDB()) return {};
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const result: Record<string, PropertyAttachmentBucket> = {};
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          result[String(cursor.key)] = cursor.value as PropertyAttachmentBucket;
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return {};
  }
}

// idbSaveAttachment durably persists a single property's attachment bucket.
// Rejects if the write fails (e.g. disk quota exceeded) so callers can surface
// the error to the user.
export async function idbSaveAttachment(propertyId: string, bucket: PropertyAttachmentBucket): Promise<void> {
  if (!hasIDB()) return;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(bucket, propertyId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
