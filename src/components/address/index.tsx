"use client";

import { useState } from "react";
import type { UserAddress } from "@/lib/types";
import { MapPicker } from "./map-picker";
import { AddressConfirmForm } from "./address-confirm-form";

interface AddressMapPickerProps {
  onConfirm: (address: Omit<UserAddress, "id" | "isDefault">) => void;
  onBack: () => void;
  saveRef?: React.RefObject<(() => void) | null>;
}

/* Reverse geocode via Nominatim (free) */
async function reverseGeocode(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt-BR`,
    { headers: { "User-Agent": "DomPedroDelivery/1.0" } }
  );
  if (!res.ok) return null;
  return res.json();
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

type Step = "map" | "confirm";

export function AddressMapPicker({
  onConfirm,
  onBack,
  saveRef,
}: AddressMapPickerProps) {
  const [step, setStep] = useState<Step>("map");
  const [lat, setLat] = useState(-3.7929);
  const [lng, setLng] = useState(-38.5267);
  const [confirming, setConfirming] = useState(false);

  // Form defaults from reverse geocode
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

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

  if (step === "map") {
    return (
      <MapPicker
        lat={lat}
        lng={lng}
        onLatLngChange={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
        }}
        onConfirm={confirmPin}
        confirming={confirming}
      />
    );
  }

  return (
    <AddressConfirmForm
      lat={lat}
      lng={lng}
      initialStreet={street}
      initialNeighborhood={neighborhood}
      initialCity={city}
      initialState={state}
      initialZipCode={zipCode}
      onGoBackToMap={() => setStep("map")}
      onSave={(data) =>
        onConfirm({
          street: data.street,
          number: data.number,
          complement: data.complement,
          referenceNote: data.referenceNote,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      }
      saveRef={saveRef}
      onLatLngChange={(newLat, newLng) => {
        setLat(newLat);
        setLng(newLng);
      }}
    />
  );
}
