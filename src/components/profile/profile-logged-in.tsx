"use client";

import { useState, useCallback } from "react";
import {
  User,
  LogOut,
  MapPin,
  CreditCard,
  ClipboardList,
  ChevronRight,
  HelpCircle,
  FileText,
  Shield,
  Phone,
  Trash2,
  Home,
  X,
  Banknote,
  Check,
} from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout";
import { useAuthStore } from "@/stores/auth";
import { ProfileAddresses } from "./profile-addresses";
import { ProfilePayment } from "./profile-payment";

interface ProfileLoggedInProps {
  userName: string;
  userPhone?: string;
  restaurantName: string;
  onLogout: () => void;
  onSwitchTab?: (tab: string) => void;
}

type Section = null | "addresses" | "payment";

export function ProfileLoggedIn({
  userName,
  userPhone,
  restaurantName,
  onLogout,
  onSwitchTab,
}: ProfileLoggedInProps) {
  const [section, setSection] = useState<Section>(null);
  const user = useAuthStore((s) => s.user);
  const addresses = useCheckoutStore((s) => s.addresses);
  const fetchAddresses = useCheckoutStore((s) => s.fetchAddresses);

  const phoneFormatted = userPhone
    ? userPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : "";

  const initial = userName.charAt(0).toUpperCase();

  const openAddresses = useCallback(() => {
    if (user?.id) fetchAddresses(user.id);
    setSection("addresses");
  }, [user, fetchAddresses]);

  if (section === "addresses") {
    return <ProfileAddresses onBack={() => setSection(null)} />;
  }

  if (section === "payment") {
    return <ProfilePayment onBack={() => setSection(null)} />;
  }

  return (
    <div className="pb-6">
      {/* ── Profile header ── */}
      <div className="flex items-center gap-4 px-5 pt-6 pb-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-[24px] font-bold text-white ring-[3px] ring-[#DC2626]/30">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-bold text-[#111827] truncate">
            {userName}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone size={12} className="text-[#9CA3AF]" />
            <span className="text-[13px] text-[#6B7280]">{phoneFormatted}</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex gap-3 px-5 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { icon: ClipboardList, label: "Pedidos", action: () => onSwitchTab?.("pedidos") },
          { icon: MapPin, label: "Endereços", action: openAddresses },
          { icon: CreditCard, label: "Pagamento", action: () => setSection("payment") },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className="flex flex-col items-center gap-2 rounded-[16px] bg-[#F9FAFB] px-5 py-4 min-w-[100px] transition-colors hover:bg-[#F3F4F6]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]">
              <item.icon size={20} className="text-[#DC2626]" />
            </div>
            <span className="text-[12px] font-semibold text-[#374151]">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Menu list ── */}
      <div className="mt-6">
        <p className="px-5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
          Conta
        </p>
        <MenuItem icon={MapPin} label="Meus endereços" sub={`${addresses.length} salvo${addresses.length !== 1 ? "s" : ""}`} onClick={openAddresses} />
        <MenuItem icon={CreditCard} label="Formas de pagamento" sub="Dinheiro, cartão na entrega" onClick={() => setSection("payment")} />
      </div>

      <div className="mt-5">
        <p className="px-5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
          Suporte
        </p>
        <MenuItem icon={HelpCircle} label="Ajuda" />
        <MenuItem icon={FileText} label="Termos de uso" />
        <MenuItem icon={Shield} label="Política de privacidade" />
      </div>

      {/* ── Logout ── */}
      <div className="px-5 mt-6">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] text-[14px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>

      <p className="text-center text-[11px] text-[#D1D5DB] mt-4">
        {restaurantName} • v1.0
      </p>
    </div>
  );
}

/* ── Reusable menu item ── */
function MenuItem({
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  icon: typeof User;
  label: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
    >
      <Icon size={20} className="text-[#6B7280] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#111827]">{label}</p>
        {sub && <p className="text-[12px] text-[#9CA3AF]">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
    </button>
  );
}
