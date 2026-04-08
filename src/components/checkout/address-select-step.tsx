"use client";

import type { UserAddress } from "@/lib/types";
import { MapPin, Plus, Trash2, Check } from "lucide-react";
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
    <div className="px-4 py-6 space-y-4">
      {addresses.length === 0 && !loading && (
        <div className="flex flex-col items-center py-8">
          <MapPin size={40} className="text-[#D1D5DB] mb-3" />
          <p className="text-[14px] text-[#6B7280]">
            Nenhum endereco salvo
          </p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`relative flex items-start gap-3 rounded-[16px] border-2 p-4 transition-colors ${
            selectedAddressId === addr.id
              ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
              : "border-[#E5E7EB] bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectAddress(addr.id)}
            className="flex-1 text-left"
          >
            <p className="text-[14px] font-medium text-[#111827]">
              {addr.street}
              {addr.number ? `, ${addr.number}` : ""}
            </p>
            {addr.complement && (
              <p className="text-[12px] text-[#6B7280]">{addr.complement}</p>
            )}
            <p className="text-[12px] text-[#6B7280]">
              {addr.neighborhood} - {addr.city}, {addr.state}
            </p>
          </button>
          {selectedAddressId === addr.id && (
            <Check size={20} className="text-[#DC2626] shrink-0 mt-0.5" />
          )}
          <button
            type="button"
            onClick={() => userId && onDeleteAddress(userId, addr.id)}
            className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors shrink-0 mt-0.5"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddNew}
        className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-[#E5E7EB] p-4 text-[14px] font-medium text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
      >
        <Plus size={18} />
        Adicionar endereco
      </button>

      {error && <ErrorAlert message={error} />}
    </div>
  );
}
