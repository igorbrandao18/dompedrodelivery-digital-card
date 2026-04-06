"use client";

import { useAuthStore } from "@/stores/auth";
import { User, LogIn, LogOut, MapPin, Pencil } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <User size={48} className="mb-4 text-[#D1D5DB]" />
        <h2 className="mb-1 text-[16px] font-bold text-[#111827]">Meu perfil</h2>
        <p className="mb-6 text-center text-[14px] text-[#6B7280]">
          Entre para gerenciar seu perfil
        </p>
        <button
          type="button"
          onClick={onLoginPress}
          className="flex h-12 items-center gap-2 rounded-[12px] bg-[#DC2626] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C]"
        >
          <LogIn size={18} />
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* User info card */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]">
            <User size={24} className="text-[#DC2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-[16px] font-bold text-[#111827]">
              {user.name}
            </h3>
            <p className="truncate text-[13px] text-[#6B7280]">{user.email}</p>
            {user.phone && (
              <p className="truncate text-[13px] text-[#6B7280]">
                {user.phone}
              </p>
            )}
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

      {/* Addresses placeholder */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-[#6B7280]" />
          <h3 className="text-[14px] font-bold text-[#111827]">
            Meus enderecos
          </h3>
        </div>
        <p className="text-[13px] text-[#9CA3AF]">
          Em breve voce podera salvar seus enderecos aqui.
        </p>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={() => logout()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#DC2626] text-[14px] font-bold text-[#DC2626] transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>
  );
}
