"use client";

import { ShoppingBag, ClipboardList, User } from "lucide-react";

interface BottomTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

const tabs = [
  { key: "cardapio", label: "Cardápio", Icon: ShoppingBag },
  { key: "pedidos", label: "Pedidos", Icon: ClipboardList },
  { key: "perfil", label: "Perfil", Icon: User },
] as const;

export function BottomTabs({
  activeTab,
  onTabChange,
  cartCount,
}: BottomTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E7EB] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-2xl items-center justify-around"
        style={{ height: 56, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              style={{ color: isActive ? "#DC2626" : "#6B7280" }}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                {key === "cardapio" && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className="font-medium"
                style={{ fontSize: 10, lineHeight: "14px" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
