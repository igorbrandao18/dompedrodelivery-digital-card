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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#DC2626]">
      <div
        className="mx-auto flex max-w-2xl items-center justify-around"
        style={{
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.6}
                  className={isActive ? "text-white" : "text-white/70"}
                />
                {key === "cardapio" && cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#DC2626]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`${isActive ? "text-white font-bold" : "text-white/70 font-medium"}`}
                style={{ fontSize: 11, lineHeight: "14px" }}
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
