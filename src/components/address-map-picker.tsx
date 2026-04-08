"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import type { UserAddress } from "@/lib/types";
import { ErrorAlert } from "@/components/ui/error-alert";

interface AddressMapPickerProps {
  onConfirm: (address: Omit<UserAddress, "id" | "isDefault">) => void;
  onBack: () => void;
  saveRef?: React.RefObject<(() => void) | null>;
}

/* ── CEP mask ── */
function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/* ── Reverse geocode via Nominatim (free) ── */
async function reverseGeocode(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt-BR`,
    { headers: { "User-Agent": "DomPedroDelivery/1.0" } }
  );
  if (!res.ok) return null;
  return res.json();
}

/* ── CEP lookup ── */
async function lookupCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return data;
}

type Step = "map" | "confirm";

export function AddressMapPicker({ onConfirm, onBack, saveRef }: AddressMapPickerProps) {
  const [step, setStep] = useState<Step>("map");

  // Map state
  const [lat, setLat] = useState(-3.7929); // Itaitinga default
  const [lng, setLng] = useState(-38.5267);
  const [geoLoading, setGeoLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<unknown>(null);

  // Form state (filled after map confirm)
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [noNumber, setNoNumber] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [formError, setFormError] = useState("");

  /* ── Init full-screen map ── */
  useEffect(() => {
    if (step !== "map" || mapInstance.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Track center on move
      map.on("moveend", () => {
        const c = map.getCenter();
        setLat(c.lat);
        setLng(c.lng);
      });

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 100);

      // Try GPS on first load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 17);
          },
          () => {}, // ignore error
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    };

    init();

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ── Init mini map on confirm step ── */
  useEffect(() => {
    if (step !== "confirm" || miniMapInstance.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!miniMapRef.current) return;

      const map = L.map(miniMapRef.current, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Red marker
      const icon = L.divIcon({
        html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#DC2626" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" stroke-width="1.5"/></svg>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      L.marker([lat, lng], { icon }).addTo(map);

      miniMapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      if (miniMapInstance.current) {
        (miniMapInstance.current as { remove: () => void }).remove();
        miniMapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ── Recenter on GPS ── */
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapInstance.current as { setView: (c: [number, number], z: number) => void } | null;
        if (map) map.setView([pos.coords.latitude, pos.coords.longitude], 17);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ── Confirm pin → reverse geocode → go to form ── */
  const confirmPin = async () => {
    setConfirming(true);
    try {
      const data = await reverseGeocode(lat, lng);
      if (data?.address) {
        const a = data.address;
        setStreet((a.road || a.pedestrian || a.street || "").slice(0, 200));
        setNeighborhood((a.suburb || a.neighbourhood || a.district || "").slice(0, 100));
        setCity((a.city || a.town || a.village || a.municipality || "").slice(0, 100));
        setState(a.state_code?.toUpperCase() || "");
        setZipCode(a.postcode ? formatCep(a.postcode) : "");
      }
    } catch {
      // Continue with empty
    }
    setConfirming(false);
    setStep("confirm");
  };

  /* ── CEP auto-fill + move mini map pin ── */
  const handleCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setZipCode(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepLoading(true);
      const data = await lookupCep(digits);
      if (data) {
        setStreet((data.logradouro || street).slice(0, 200));
        setNeighborhood((data.bairro || neighborhood).slice(0, 100));
        setCity((data.localidade || city).slice(0, 100));
        setState(data.uf || state);

        // Geocode the new address to move the mini map
        try {
          const query = `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade || ""}, ${data.uf || ""}, Brazil`;
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            { headers: { "User-Agent": "DomPedroDelivery/1.0" } }
          );
          if (geoRes.ok) {
            const results = await geoRes.json();
            if (results.length > 0) {
              const newLat = parseFloat(results[0].lat);
              const newLng = parseFloat(results[0].lon);
              setLat(newLat);
              setLng(newLng);

              // Update mini map view + marker
              if (miniMapInstance.current) {
                const map = miniMapInstance.current as { setView: (c: [number, number], z: number) => void; eachLayer: (fn: (l: { setLatLng?: (c: [number, number]) => void }) => void) => void };
                map.setView([newLat, newLng], 17);
                map.eachLayer((layer) => {
                  if (layer.setLatLng) layer.setLatLng([newLat, newLng]);
                });
              }
            }
          }
        } catch {
          // Geocoding failed, keep current pin
        }
      }
      setCepLoading(false);
    }
  };

  /* ── Save address ── */
  const handleSave = () => {
    setFormError("");
    if (!street.trim()) { setFormError("Informe a rua."); return; }
    if (!number.trim() && !noNumber) { setFormError("Informe o número ou marque 'Sem número'."); return; }
    if (!neighborhood.trim()) { setFormError("Informe o bairro."); return; }
    if (!city.trim()) { setFormError("Informe a cidade."); return; }

    onConfirm({
      street: street.trim(),
      number: noNumber ? "S/N" : number.trim(),
      complement: complement.trim(),
      referenceNote: referenceNote.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim() || "CE",
      zipCode: zipCode.replace(/\D/g, ""),
    });
  };

  // Expose save to parent via ref
  useEffect(() => {
    if (saveRef) saveRef.current = handleSave;
    return () => { if (saveRef) saveRef.current = null; };
  });

  const inputClass =
    "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

  /* ══════════ STEP 1: MAP PICKER (iFood style) ══════════ */
  if (step === "map") {
    return (
      <div className="flex flex-col h-full">
        {/* Map fills everything */}
        <div className="relative flex-1 min-h-[400px]">
          <div ref={mapRef} className="absolute inset-0" />

          {/* Fixed pin in center (not a marker — stays put while map moves) */}
          <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC2626" stroke="white" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Pin shadow */}
          <div className="absolute left-1/2 top-1/2 z-[999] -translate-x-1/2 translate-y-0 pointer-events-none">
            <div className="h-1.5 w-4 rounded-full bg-black/20 mx-auto" />
          </div>

          {/* Title overlay */}
          <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-white/90 to-transparent px-4 pt-3 pb-8">
            <h3 className="text-[16px] font-bold text-[#111827]">
              Onde entregamos?
            </h3>
            <p className="text-[13px] text-[#6B7280]">
              Mova o mapa até o pino ficar no endereço certo
            </p>
          </div>

          {/* My location FAB */}
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoLoading}
            className="absolute bottom-24 right-3 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
          >
            {geoLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Navigation size={20} />
            )}
          </button>
        </div>

        {/* Confirm button */}
        <div className="px-4 py-4 border-t border-[#E5E7EB] bg-white">
          <button
            type="button"
            onClick={confirmPin}
            disabled={confirming}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] text-[15px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
          >
            {confirming ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Buscando endereço...
              </>
            ) : (
              "Confirmar local"
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════ STEP 2: CONFIRM (mini map + form) ══════════ */
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mini map preview (32% height) */}
      <div className="relative h-[200px] shrink-0">
        <div ref={miniMapRef} className="absolute inset-0" />

        {/* Pin overlay on mini map */}
        <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full pointer-events-none">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#DC2626" stroke="white" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Adjust pin button */}
        <button
          type="button"
          onClick={() => {
            miniMapInstance.current = null;
            setStep("map");
          }}
          className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-lg text-[13px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
        >
          <MapPin size={14} />
          Ajustar marcador
        </button>
      </div>

      {/* Address + headline */}
      {street && (
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-[15px] font-bold text-[#111827]">{street}</p>
          <p className="text-[13px] text-[#6B7280]">
            {neighborhood}{city ? ` - ${city}` : ""}{state ? `, ${state}` : ""}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="px-4 py-4 space-y-4">
        {/* CEP */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">CEP</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={zipCode}
              onChange={(e) => handleCepChange(e.target.value)}
              className={inputClass}
              maxLength={9}
            />
            {cepLoading && (
              <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#9CA3AF]" />
            )}
          </div>
        </div>

        {/* Number */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Número</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="123"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={noNumber}
              className={`${inputClass} flex-1 ${noNumber ? "opacity-50" : ""}`}
              autoFocus
              maxLength={20}
            />
            <label className="flex items-center gap-2 text-[13px] text-[#6B7280] cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={noNumber}
                onChange={(e) => setNoNumber(e.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#DC2626] accent-[#DC2626]"
              />
              Sem número
            </label>
          </div>
        </div>

        {/* Complement */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Complemento (opcional)</label>
          <input
            type="text"
            placeholder="Apto, bloco..."
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            className={inputClass}
            maxLength={100}
          />
        </div>

        {/* Reference */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Ponto de referência (opcional)</label>
          <input
            type="text"
            placeholder="Ex.: portão azul, perto da padaria"
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
            className={inputClass}
            maxLength={200}
          />
        </div>

        {/* Error */}
        {formError && <ErrorAlert message={formError} />}

        {/* Spacer for fixed footer button */}
        <div className="h-4" />

      </div>
    </div>
  );
}
