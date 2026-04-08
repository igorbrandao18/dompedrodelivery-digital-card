"use client";

import type { Restaurant } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { ShoppingBag, Star, Clock, Package } from "lucide-react";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
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
            <h1 className="text-[22px] font-[800] leading-tight tracking-[-0.4px] text-[#111827]">
              {restaurant.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {restaurant.rating != null && (
                <span className="flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[12px] font-semibold text-[#92400E]">
                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  {restaurant.rating.toFixed(1)}
                  {restaurant.ratingCount != null && (
                    <span className="font-normal text-[#B45309]">({restaurant.ratingCount})</span>
                  )}
                </span>
              )}

              <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                <Clock className="h-3.5 w-3.5" />
                {restaurant.estimatedDeliveryMinutes} min
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
                <Package className="h-3.5 w-3.5" />
                Min. {formatCurrency(restaurant.minOrderValue)}
              </span>
            </div>

            {!restaurant.isAcceptingOrders && (
              <div className="mt-2 inline-flex items-center rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] font-semibold text-[#DC2626]">
                Fechado no momento
              </div>
            )}
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
    </div>
  );
}
