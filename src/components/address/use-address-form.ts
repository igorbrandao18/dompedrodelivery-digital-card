"use client";

import { useState, useEffect } from "react";

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

async function lookupCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return data;
}

interface UseAddressFormOpts {
  initialStreet: string;
  initialNeighborhood: string;
  initialCity: string;
  initialState: string;
  initialZipCode: string;
  onLatLngChange: (lat: number, lng: number) => void;
  miniMapInstance: React.RefObject<unknown>;
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
}

export function useAddressForm(opts: UseAddressFormOpts) {
  const [street, setStreet] = useState(opts.initialStreet);
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [neighborhood, setNeighborhood] = useState(opts.initialNeighborhood);
  const [city, setCity] = useState(opts.initialCity);
  const [state, setState] = useState(opts.initialState);
  const [zipCode, setZipCode] = useState(opts.initialZipCode);
  const [noNumber, setNoNumber] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [formError, setFormError] = useState("");

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
              opts.onLatLngChange(newLat, newLng);
              if (opts.miniMapInstance.current) {
                const map = opts.miniMapInstance.current as {
                  setView: (c: [number, number], z: number) => void;
                  eachLayer: (fn: (l: { setLatLng?: (c: [number, number]) => void }) => void) => void;
                };
                map.setView([newLat, newLng], 17);
                map.eachLayer((layer) => {
                  if (layer.setLatLng) layer.setLatLng([newLat, newLng]);
                });
              }
            }
          }
        } catch { /* Geocoding failed */ }
      }
      setCepLoading(false);
    }
  };

  const handleSave = () => {
    setFormError("");
    if (!street.trim()) { setFormError("Informe a rua."); return; }
    if (!number.trim() && !noNumber) { setFormError("Informe o número ou marque 'Sem número'."); return; }
    if (!neighborhood.trim()) { setFormError("Informe o bairro."); return; }
    if (!city.trim()) { setFormError("Informe a cidade."); return; }
    opts.onSave({
      street: street.trim(), number: noNumber ? "S/N" : number.trim(),
      complement: complement.trim(), referenceNote: referenceNote.trim(),
      neighborhood: neighborhood.trim(), city: city.trim(),
      state: state.trim() || "CE", zipCode: zipCode.replace(/\D/g, ""),
    });
  };

  useEffect(() => {
    if (opts.saveRef) opts.saveRef.current = handleSave;
    return () => { if (opts.saveRef) opts.saveRef.current = null; };
  });

  return {
    street, number, complement, referenceNote, neighborhood,
    city, state, zipCode, noNumber, cepLoading, formError,
    setNumber, setComplement, setReferenceNote, setNoNumber,
    handleCepChange, handleSave,
  };
}
