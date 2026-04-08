"use client";

import { LogIn } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface LoginPromptHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  benefitsLabel: string;
  benefits: BenefitItem[];
  onLoginPress: () => void;
}

export function LoginPromptHero({
  icon: Icon,
  title,
  subtitle,
  benefitsLabel,
  benefits,
  onLoginPress,
}: LoginPromptHeroProps) {
  return (
    <div>
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] px-6 pt-10 pb-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/10">
          <Icon size={36} className="text-white" />
        </div>
        <h2 className="text-[20px] font-bold">{title}</h2>
        <p className="mt-1 text-[14px] text-white/80">{subtitle}</p>
        <button
          type="button"
          onClick={onLoginPress}
          className="mt-5 flex h-12 w-full max-w-sm mx-auto items-center justify-center gap-2 rounded-[12px] bg-white text-[15px] font-bold text-[#DC2626] transition-colors hover:bg-white/90"
        >
          <LogIn size={18} />
          Entrar com WhatsApp
        </button>
      </div>

      {/* Benefits */}
      <div className="mt-6 px-4 space-y-3 max-w-2xl mx-auto">
        <p className="px-1 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">
          {benefitsLabel}
        </p>
        {benefits.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
              <item.icon size={20} className="text-[#DC2626]" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {item.title}
              </p>
              <p className="text-[13px] text-[#6B7280]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
