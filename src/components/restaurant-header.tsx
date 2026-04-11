"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { ShoppingBag, Clock, Package, Truck, Info } from "lucide-react";
import { RestaurantInfoModal } from "./restaurant-info-modal";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* Banner */}
      <div className="relative h-[216px] w-full overflow-hidden">
        {restaurant.bannerUrl ? (
          <img
            src={restaurant.bannerUrl}
            alt={`Banner de ${restaurant.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#FEE2E2]">
            <ShoppingBag className="h-16 w-16 text-[#DC2626] opacity-40" />
          </div>
        )}
        {/* Red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(180,20,20,0.55)] via-[rgba(0,0,0,0.10)] to-[rgba(0,0,0,0.05)]" />
      </div>

      {/* White card overlapping banner */}
      <div className="-mt-3.5 relative z-10 rounded-t-[16px] bg-white px-4 pb-4 pt-4">
        <div className="flex items-start justify-between">
          {/* Left: restaurant info */}
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-[800] leading-tight tracking-[-0.4px] text-[#111827]">
                {restaurant.name}
              </h1>
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                className="shrink-0 rounded-full p-1 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Informacoes do restaurante"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                <Clock className="h-3.5 w-3.5" />
                {restaurant.estimatedDeliveryMinutes} min
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                <Package className="h-3.5 w-3.5" />
                Min. {formatCurrency(restaurant.minOrderValue)}
              </span>

              {restaurant.deliveryFee === 0 ? (
                <span className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[12px] font-semibold text-[#065F46]">
                  <Truck className="h-3.5 w-3.5" />
                  Entrega gratis
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                  <Truck className="h-3.5 w-3.5" />
                  Entrega {formatCurrency(restaurant.deliveryFee)}
                </span>
              )}

              {restaurant.isAcceptingOrders ? (
                <span className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[12px] font-semibold text-[#065F46]">
                  Aberto agora
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                  Fechado
                </span>
              )}

            </div>
          </div>

          {/* Right: logo */}
          {restaurant.logoUrl && (
            <div className="-mt-16">
              <div
                className="h-[120px] w-[120px] overflow-hidden rounded-full border-[3px] border-[rgba(220,38,38,0.35)] shadow-[0_4px_12px_rgba(220,38,38,0.25)]"
              >
                <img
                  src={restaurant.logoUrl}
                  alt={`Logo de ${restaurant.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Closed banner */}
      {!restaurant.isAcceptingOrders && (
        <div className="w-full bg-[#DC2626] px-4 py-2.5 text-center text-[14px] font-semibold text-white">
          Este restaurante esta fechado no momento
        </div>
      )}

      {/* Info modal */}
      {infoOpen && (
        <RestaurantInfoModal restaurant={restaurant} onClose={() => setInfoOpen(false)} />
      )}
    </div>
  );
}
