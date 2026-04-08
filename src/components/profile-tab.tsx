"use client";

import { useAuthStore } from "@/stores/auth";
import { User, LogIn, LogOut, MapPin, Pencil, ShoppingBag, HelpCircle, ChevronRight } from "lucide-react";

interface ProfileTabProps {
  restaurantName: string;
  onLoginPress: () => void;
}

export function ProfileTab({ restaurantName, onLoginPress }: ProfileTabProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const authed = isAuthenticated();

  /* Not logged in */
  if (!authed || !user) {
    return (
      <div>
        {/* Hero banner — full width */}
        <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] px-6 pt-10 pb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/10">
            <User size={36} className="text-white" />
          </div>
          <h2 className="text-[20px] font-bold">Meu perfil</h2>
          <p className="mt-1 text-[14px] text-white/80">
            Entre para acompanhar pedidos e salvar seus dados
          </p>
          <button
            type="button"
            onClick={onLoginPress}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-white text-[15px] font-bold text-[#DC2626] transition-colors hover:bg-white/90"
          >
            <LogIn size={18} />
            Entrar com WhatsApp
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-6 px-4 space-y-3 max-w-2xl mx-auto">
          <p className="px-1 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Vantagens de ter uma conta
          </p>
          {[
            { icon: ShoppingBag, title: "Acompanhe seus pedidos", desc: "Veja o status em tempo real" },
            { icon: MapPin, title: "Salve seus endereços", desc: "Peça sem digitar tudo de novo" },
            { icon: User, title: "Perfil personalizado", desc: "Seus dados salvos para próximos pedidos" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                <item.icon size={20} className="text-[#DC2626]" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#111827]">{item.title}</p>
                <p className="text-[13px] text-[#6B7280]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Logged in ── */
  const phoneFormatted = user.phone
    ? user.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* User info card */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE2E2]">
            <User size={28} className="text-[#DC2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-[17px] font-bold text-[#111827]">
              {user.name}
            </h3>
            <p className="truncate text-[14px] text-[#6B7280]">
              {phoneFormatted}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
        >
          <Pencil size={14} />
          Editar perfil
        </button>
      </div>

      {/* Menu items */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6]">
        {[
          { icon: MapPin, label: "Meus endereços", hint: "Em breve" },
          { icon: HelpCircle, label: "Ajuda", hint: "" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F9FAFB]"
          >
            <item.icon size={20} className="text-[#6B7280] shrink-0" />
            <span className="flex-1 text-[14px] font-medium text-[#111827]">
              {item.label}
            </span>
            {item.hint && (
              <span className="text-[12px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                {item.hint}
              </span>
            )}
            <ChevronRight size={16} className="text-[#D1D5DB]" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={() => logout()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#DC2626] text-[14px] font-bold text-[#DC2626] transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        Sair da conta
      </button>

      {/* App info */}
      <p className="text-center text-[12px] text-[#D1D5DB] pt-2">
        {restaurantName} • Cardápio Digital
      </p>
    </div>
  );
}
