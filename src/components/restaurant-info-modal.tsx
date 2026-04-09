"use client";

import type { Restaurant } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { X, Clock, Package, Truck, Share2 } from "lucide-react";

interface RestaurantInfoModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

async function handleShare(name: string) {
  const url = window.location.href;
  const data = { title: name, text: `Confira ${name}!`, url };
  if (navigator.share) {
    try { await navigator.share(data); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(url);
    alert("Link copiado!");
  }
}

export function RestaurantInfoModal({ restaurant, onClose }: RestaurantInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-lg rounded-t-[20px] bg-white px-5 pb-8 pt-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + close */}
        <div className="mb-4 flex items-center justify-between">
          <div className="mx-auto h-1 w-10 rounded-full bg-[#D1D5DB]" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-[#F3F4F6]">
            <X className="h-5 w-5 text-[#6B7280]" />
          </button>
        </div>

        <h2 className="text-[18px] font-bold text-[#111827] mb-4">{restaurant.name}</h2>

        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#6B7280]">Status</span>
            {restaurant.isAcceptingOrders ? (
              <span className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[12px] font-semibold text-[#065F46]">Aberto</span>
            ) : (
              <span className="rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-[12px] font-semibold text-[#DC2626]">Fechado</span>
            )}
          </div>

          {/* Delivery time */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-[#6B7280]">
              <Clock className="h-4 w-4" /> Tempo estimado
            </span>
            <span className="text-[14px] font-medium text-[#111827]">{restaurant.estimatedDeliveryMinutes} min</span>
          </div>

          {/* Min order */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-[#6B7280]">
              <Package className="h-4 w-4" /> Pedido minimo
            </span>
            <span className="text-[14px] font-medium text-[#111827]">{formatCurrency(restaurant.minOrderValue)}</span>
          </div>

          {/* Delivery fee */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-[#6B7280]">
              <Truck className="h-4 w-4" /> Taxa de entrega
            </span>
            <span className={`text-[14px] font-medium ${restaurant.deliveryFee === 0 ? "text-[#065F46]" : "text-[#111827]"}`}>
              {restaurant.deliveryFee === 0 ? "Gratis" : formatCurrency(restaurant.deliveryFee)}
            </span>
          </div>
        </div>

        {/* Share button */}
        <button
          type="button"
          onClick={() => handleShare(restaurant.name)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] py-2.5 text-[14px] font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}
