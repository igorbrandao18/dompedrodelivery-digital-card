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
        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.12)]" />
      </div>

      {/* White card overlapping banner */}
      <div className="-mt-3.5 relative z-10 rounded-t-[16px] bg-white px-4 pb-4 pt-4">
        <div className="flex items-start justify-between">
          {/* Left: restaurant info */}
          <div className="flex-1 pr-4">
            <h1 className="text-[22px] font-[800] leading-tight text-[#111827]">
              {restaurant.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-[#6B7280]">
              {restaurant.rating != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-[#111827]">
                    {restaurant.rating.toFixed(1)}
                  </span>
                  {restaurant.ratingCount != null && (
                    <span>({restaurant.ratingCount})</span>
                  )}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {restaurant.estimatedDeliveryMinutes} min
              </span>

              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
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
            <div className="-mt-10">
              <div
                className="h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-[rgba(220,38,38,0.35)] shadow-[0_2px_8px_rgba(220,38,38,0.2)]"
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
