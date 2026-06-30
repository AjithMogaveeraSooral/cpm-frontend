'use client';

import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LocationValue {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

interface LocationPickerProps {
  value?: LocationValue | null;
  onChange?: (value: LocationValue) => void;
  /** Map height in pixels. */
  height?: number;
  /** When true the map is display-only: no marker drag, click, or controls. */
  readOnly?: boolean;
}

// Bengaluru city centre — sensible default before the user pins a point.
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const containerStyle = { width: '100%', borderRadius: '0.75rem' };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

/**
 * LocationPicker lets a user pin a precise location on a Google Map (click or
 * drag the marker, or use their device location). When no Maps API key is
 * configured it degrades gracefully to manual latitude/longitude entry so the
 * feature still works in every environment.
 */
export function LocationPicker({ value, onChange, height = 320, readOnly = false }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'cpm-google-maps',
    googleMapsApiKey: API_KEY,
  });

  const [locating, setLocating] = useState(false);
  const center = useMemo(
    () => (value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER),
    [value],
  );

  // Reverse-geocode a point to a human-readable address (best effort).
  const resolveAddress = useCallback((lat: number, lng: number) => {
    if (!onChange) return;
    if (typeof google === 'undefined' || !google.maps) {
      onChange({ lat, lng });
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onChange({ lat, lng, address: results[0].formatted_address, placeId: results[0].place_id });
      } else {
        onChange({ lat, lng });
      }
    });
  }, [onChange]);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        resolveAddress(pos.coords.latitude, pos.coords.longitude);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [resolveAddress]);

  // --- Read-only fallback: no API key / load error → plain text summary ---
  if ((!API_KEY || loadError) && readOnly) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        {value
          ? value.address ?? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
          : 'No location set for this property.'}
      </div>
    );
  }

  // --- Fallback: no API key or load failed → manual entry ---
  if (!API_KEY || loadError) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-xs text-amber-700">
          {loadError
            ? 'Google Maps failed to load — enter coordinates manually.'
            : 'Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the interactive map. Enter coordinates manually for now.'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={value?.lat ?? ''}
            onChange={(e) => onChange?.({ lat: Number(e.target.value), lng: value?.lng ?? 0, address: value?.address })}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={value?.lng ?? ''}
            onChange={(e) => onChange?.({ lat: value?.lat ?? 0, lng: Number(e.target.value), address: value?.address })}
          />
        </div>
        <Button type="button" variant="secondary" onClick={useMyLocation} loading={locating}>
          <LocateFixed className="h-4 w-4" /> Use my current location
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50"
        style={{ height }}
      >
        <span className="h-6 w-6 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height: `${height}px` }}
        center={center}
        zoom={value ? 16 : 12}
        onClick={(e) => {
          if (readOnly) return;
          if (e.latLng) resolveAddress(e.latLng.lat(), e.latLng.lng());
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggable: !readOnly,
          gestureHandling: readOnly ? 'none' : 'auto',
        }}
      >
        {value && (
          <MarkerF
            position={{ lat: value.lat, lng: value.lng }}
            draggable={!readOnly}
            onDragEnd={(e) => {
              if (e.latLng) resolveAddress(e.latLng.lat(), e.latLng.lng());
            }}
          />
        )}
      </GoogleMap>
      {!readOnly && (
        <div className="flex items-center justify-between gap-3">
          <p className="flex-1 truncate text-xs text-slate-500">
            {value
              ? value.address ?? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
              : 'Click on the map or use your location to drop a pin.'}
          </p>
          <Button type="button" variant="secondary" onClick={useMyLocation} loading={locating}>
            <LocateFixed className="h-4 w-4" /> My location
          </Button>
        </div>
      )}
      {readOnly && value && (value.address || true) && (
        <p className="truncate text-xs text-slate-500">
          {value.address ?? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`}
        </p>
      )}
    </div>
  );
}
