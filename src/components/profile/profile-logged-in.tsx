"use client";

import { useState } from "react";
import {
  User,
  LogOut,
  MapPin,
  CreditCard,
  Banknote,
  HelpCircle,
  ChevronRight,
  Phone,
  Pencil,
  Shield,
  FileText,
  X,
  Check,
  Trash2,
  Plus,
  Home,
} from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout";
import { useAuthStore } from "@/stores/auth";
import type { UserAddress } from "@/lib/types";

interface ProfileLoggedInProps {
  userName: string;
  userPhone?: string;
  restaurantName: string;
  onLogout: () => void;
}

type ActiveSection = null | "addresses" | "payment" | "edit";

const PAYMENT_METHODS = [
  { id: "cash", label: "Dinheiro", icon: Banknote, color: "text-[#059669]" },
  { id: "credit_visa", label: "Visa (Crédito)", icon: CreditCard, color: "text-[#1A1F71]" },
  { id: "credit_mastercard", label: "Mastercard (Crédito)", icon: CreditCard, color: "text-[#EB001B]" },
  { id: "credit_elo", label: "Elo (Crédito)", icon: CreditCard, color: "text-[#00A4E0]" },
  { id: "credit_hipercard", label: "Hipercard (Crédito)", icon: CreditCard, color: "text-[#822124]" },
];

export function ProfileLoggedIn({
  userName,
  userPhone,
  restaurantName,
  onLogout,
}: ProfileLoggedInProps) {
  const [section, setSection] = useState<ActiveSection>(null);
  const [selectedPayment, setSelectedPayment] = useState("cash");

  const user = useAuthStore((s) => s.user);
  const addresses = useCheckoutStore((s) => s.addresses);
  const fetchAddresses = useCheckoutStore((s) => s.fetchAddresses);
  const deleteAddress = useCheckoutStore((s) => s.deleteAddress);

  const phoneFormatted = userPhone
    ? userPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : "";

  // Load addresses when opening that section
  const openAddresses = () => {
    if (user?.id) fetchAddresses(user.id);
    setSection("addresses");
  };

  /* ══════ ADDRESSES SECTION ══════ */
  if (section === "addresses") {
    return (
      <div className="px-4 py-4 space-y-3">
        <button
          type="button"
          onClick={() => setSection(null)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#6B7280] mb-2"
        >
          <X size={16} /> Voltar
        </button>

        <h2 className="text-[18px] font-bold text-[#111827]">Meus endereços</h2>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <MapPin size={32} className="text-[#D1D5DB] mb-3" />
            <p className="text-[14px] text-[#6B7280]">Nenhum endereço salvo</p>
            <p className="text-[12px] text-[#9CA3AF]">
              Adicione um endereço durante o checkout
            </p>
          </div>
        ) : (
          addresses.map((addr: UserAddress) => (
            <div
              key={addr.id}
              className="flex items-center gap-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                <Home size={18} className="text-[#DC2626]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] truncate">
                  {addr.street}{addr.number ? `, ${addr.number}` : ""}
                </p>
                <p className="text-[12px] text-[#6B7280] truncate">
                  {addr.neighborhood} · {addr.city}, {addr.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => user?.id && deleteAddress(user.id, addr.id)}
                className="shrink-0 rounded-full p-2 text-[#D1D5DB] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  /* ══════ PAYMENT SECTION ══════ */
  if (section === "payment") {
    return (
      <div className="px-4 py-4 space-y-3">
        <button
          type="button"
          onClick={() => setSection(null)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#6B7280] mb-2"
        >
          <X size={16} /> Voltar
        </button>

        <h2 className="text-[18px] font-bold text-[#111827]">Formas de pagamento</h2>
        <p className="text-[13px] text-[#6B7280]">
          Escolha sua forma de pagamento preferida na entrega
        </p>

        <div className="space-y-2 mt-4">
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = selectedPayment === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setSelectedPayment(pm.id)}
                className={`flex w-full items-center gap-3 rounded-[16px] border-2 p-4 transition-all ${
                  isSelected
                    ? "border-[#DC2626] bg-[#FEF2F2]"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-[#DC2626]" : "bg-[#F3F4F6]"
                }`}>
                  <pm.icon size={20} className={isSelected ? "text-white" : pm.color} />
                </div>
                <span className="flex-1 text-left text-[14px] font-medium text-[#111827]">
                  {pm.label}
                </span>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626]">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[12px] text-[#9CA3AF] text-center pt-2">
          Pagamento online (Pix, cartão) em breve
        </p>
      </div>
    );
  }

  /* ══════ MAIN PROFILE ══════ */
  return (
    <div className="px-4 py-4 space-y-4">
      {/* User card */}
      <div className="rounded-[20px] bg-gradient-to-br from-[#DC2626] to-[#991B1B] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
            <User size={30} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-bold truncate">{userName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone size={12} className="text-white/70" />
              <p className="text-[13px] text-white/80">{phoneFormatted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
        <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Minha conta
        </p>
        {[
          {
            icon: MapPin,
            label: "Meus endereços",
            sub: `${addresses.length} salvo${addresses.length !== 1 ? "s" : ""}`,
            onClick: openAddresses,
          },
          {
            icon: CreditCard,
            label: "Formas de pagamento",
            sub: "Dinheiro, cartão na entrega",
            onClick: () => setSection("payment"),
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left border-t border-[#F3F4F6] transition-colors hover:bg-[#F9FAFB]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
              <item.icon size={18} className="text-[#DC2626]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#111827]">{item.label}</p>
              <p className="text-[12px] text-[#9CA3AF]">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
          </button>
        ))}
      </div>

      {/* Support */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
        <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Suporte
        </p>
        {[
          { icon: HelpCircle, label: "Ajuda" },
          { icon: FileText, label: "Termos de uso" },
          { icon: Shield, label: "Política de privacidade" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left border-t border-[#F3F4F6] transition-colors hover:bg-[#F9FAFB]"
          >
            <item.icon size={18} className="text-[#6B7280] shrink-0" />
            <span className="flex-1 text-[14px] text-[#111827]">{item.label}</span>
            <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#DC2626] text-[14px] font-bold text-[#DC2626] transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        Sair da conta
      </button>

      {/* Footer */}
      <p className="text-center text-[12px] text-[#D1D5DB] pt-1">
        {restaurantName} • Cardápio Digital
      </p>
    </div>
  );
}
