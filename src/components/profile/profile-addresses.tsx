"use client";

import { ArrowLeft, Home, Trash2, MapPin } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout";
import { useAuthStore } from "@/stores/auth";
import type { UserAddress } from "@/lib/types";

interface ProfileAddressesProps {
  onBack: () => void;
}

export function ProfileAddresses({ onBack }: ProfileAddressesProps) {
  const user = useAuthStore((s) => s.user);
  const addresses = useCheckoutStore((s) => s.addresses);
  const deleteAddress = useCheckoutStore((s) => s.deleteAddress);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>
        <h2 className="text-[18px] font-bold text-[#111827]">Meus endereços</h2>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center py-16 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6] mb-4">
            <MapPin size={28} className="text-[#D1D5DB]" />
          </div>
          <p className="text-[16px] font-bold text-[#111827] mb-1">
            Nenhum endereço salvo
          </p>
          <p className="text-[13px] text-[#6B7280] text-center">
            Seus endereços aparecerão aqui quando você adicionar durante o checkout
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {addresses.map((addr: UserAddress) => (
            <div
              key={addr.id}
              className="flex items-center gap-3 rounded-[14px] bg-[#F9FAFB] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                <Home size={18} className="text-[#DC2626]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] truncate">
                  {addr.street}{addr.number ? `, ${addr.number}` : ""}
                </p>
                {addr.complement && (
                  <p className="text-[12px] text-[#6B7280] truncate">{addr.complement}</p>
                )}
                <p className="text-[12px] text-[#9CA3AF] truncate">
                  {addr.neighborhood} · {addr.city}, {addr.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => user?.id && deleteAddress(user.id, addr.id)}
                className="shrink-0 rounded-full p-2 text-[#D1D5DB] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                aria-label="Remover"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
