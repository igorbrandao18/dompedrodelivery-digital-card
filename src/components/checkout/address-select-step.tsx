"use client";

import type { UserAddress } from "@/lib/types";
import { MapPin, Plus, Trash2, Navigation, Home } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

interface AddressSelectStepProps {
  addresses: UserAddress[];
  selectedAddressId: string;
  loading: boolean;
  error: string | null;
  userId: string | undefined;
  onSelectAddress: (id: string) => void;
  onDeleteAddress: (userId: string, addressId: string) => void;
  onAddNew: () => void;
}

export function AddressSelectStep({
  addresses,
  selectedAddressId,
  loading,
  error,
  userId,
  onSelectAddress,
  onDeleteAddress,
  onAddNew,
}: AddressSelectStepProps) {
  return (
    <div className="px-4 py-6 space-y-3">
      {/* Empty state */}
      {addresses.length === 0 && !loading && (
        <div className="flex flex-col items-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6] mb-4">
            <Navigation size={28} className="text-[#D1D5DB]" />
          </div>
          <p className="text-[16px] font-bold text-[#111827] mb-1">
            Nenhum endereço salvo
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Adicione um endereço para receber seus pedidos
          </p>
        </div>
      )}

      {/* Address cards */}
      {addresses.map((addr) => {
        const isSelected = selectedAddressId === addr.id;
        return (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelectAddress(addr.id)}
            className={`flex w-full items-center gap-3 rounded-[16px] border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-[#DC2626] bg-[#FEF2F2] shadow-sm"
                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
            }`}
          >
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isSelected ? "bg-[#DC2626]" : "bg-[#F3F4F6]"
              }`}
            >
              <Home
                size={18}
                className={isSelected ? "text-white" : "text-[#9CA3AF]"}
              />
            </div>

            {/* Address info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827] truncate">
                {addr.street}
                {addr.number ? `, ${addr.number}` : ""}
              </p>
              {addr.complement && (
                <p className="text-[12px] text-[#6B7280] truncate">
                  {addr.complement}
                </p>
              )}
              <p className="text-[12px] text-[#6B7280] truncate">
                {addr.neighborhood}
                {addr.city ? ` · ${addr.city}` : ""}
                {addr.state ? `, ${addr.state}` : ""}
              </p>
              {addr.zipCode && (
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  CEP {addr.zipCode.replace(/(\d{5})(\d{3})/, "$1-$2")}
                </p>
              )}
            </div>

            {/* Selected check or delete */}
            {isSelected ? (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DC2626]">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (userId) onDeleteAddress(userId, addr.id);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#D1D5DB] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                aria-label="Remover endereço"
              >
                <Trash2 size={16} />
              </button>
            )}
          </button>
        );
      })}

      {/* Add new button */}
      <button
        type="button"
        onClick={onAddNew}
        className="flex w-full items-center gap-3 rounded-[16px] border-2 border-dashed border-[#E5E7EB] p-4 text-left transition-colors hover:border-[#DC2626] hover:bg-[#FEF2F2] group"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] group-hover:bg-[#FEE2E2] transition-colors">
          <Plus
            size={20}
            className="text-[#9CA3AF] group-hover:text-[#DC2626] transition-colors"
          />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#6B7280] group-hover:text-[#DC2626] transition-colors">
            Adicionar novo endereço
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
            Use o mapa ou digite o CEP
          </p>
        </div>
      </button>

      {error && <ErrorAlert message={error} />}
    </div>
  );
}
