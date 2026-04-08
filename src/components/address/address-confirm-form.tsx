"use client";

import { useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useAddressForm } from "./use-address-form";

interface AddressConfirmFormProps {
  lat: number;
  lng: number;
  initialStreet: string;
  initialNeighborhood: string;
  initialCity: string;
  initialState: string;
  initialZipCode: string;
  onGoBackToMap: () => void;
  onSave: (data: {
    street: string;
    number: string;
    complement: string;
    referenceNote: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  saveRef?: React.RefObject<(() => void) | null>;
  onLatLngChange: (lat: number, lng: number) => void;
}

export function AddressConfirmForm(props: AddressConfirmFormProps) {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<unknown>(null);

  const form = useAddressForm({
    initialStreet: props.initialStreet,
    initialNeighborhood: props.initialNeighborhood,
    initialCity: props.initialCity,
    initialState: props.initialState,
    initialZipCode: props.initialZipCode,
    onLatLngChange: props.onLatLngChange,
    miniMapInstance,
    onSave: props.onSave,
    saveRef: props.saveRef,
  });

  /* Init mini map */
  useEffect(() => {
    if (miniMapInstance.current) return;
    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!miniMapRef.current) return;
      const map = L.map(miniMapRef.current, {
        center: [props.lat, props.lng], zoom: 17, zoomControl: false,
        dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      const icon = L.divIcon({
        html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#DC2626" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" stroke-width="1.5"/></svg>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 32],
      });
      L.marker([props.lat, props.lng], { icon }).addTo(map);
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
  }, []);

  const inputClass =
    "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mini map preview */}
      <div className="relative h-[200px] shrink-0">
        <div ref={miniMapRef} className="absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full pointer-events-none">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#DC2626" stroke="white" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" strokeWidth="1.5" />
          </svg>
        </div>
        <button type="button" onClick={props.onGoBackToMap} className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-lg text-[13px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
          <MapPin size={14} />
          Ajustar marcador
        </button>
      </div>

      {form.street && (
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-[15px] font-bold text-[#111827]">{form.street}</p>
          <p className="text-[13px] text-[#6B7280]">{form.neighborhood}{form.city ? ` - ${form.city}` : ""}{form.state ? `, ${form.state}` : ""}</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">CEP</label>
          <div className="relative">
            <input type="text" inputMode="numeric" placeholder="00000-000" value={form.zipCode} onChange={(e) => form.handleCepChange(e.target.value)} className={inputClass} maxLength={9} />
            {form.cepLoading && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#9CA3AF]" />}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Número</label>
          <div className="flex items-center gap-3">
            <input type="text" placeholder="123" value={form.number} onChange={(e) => form.setNumber(e.target.value)} disabled={form.noNumber} className={`${inputClass} flex-1 ${form.noNumber ? "opacity-50" : ""}`} autoFocus maxLength={20} />
            <label className="flex items-center gap-2 text-[13px] text-[#6B7280] cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={form.noNumber} onChange={(e) => form.setNoNumber(e.target.checked)} className="h-4 w-4 rounded border-[#D1D5DB] text-[#DC2626] accent-[#DC2626]" />
              Sem número
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Complemento (opcional)</label>
          <input type="text" placeholder="Apto, bloco..." value={form.complement} onChange={(e) => form.setComplement(e.target.value)} className={inputClass} maxLength={100} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Ponto de referência (opcional)</label>
          <input type="text" placeholder="Ex.: portão azul, perto da padaria" value={form.referenceNote} onChange={(e) => form.setReferenceNote(e.target.value)} className={inputClass} maxLength={200} />
        </div>
        {form.formError && <ErrorAlert message={form.formError} />}
        <div className="h-4" />
      </div>
    </div>
  );
}
