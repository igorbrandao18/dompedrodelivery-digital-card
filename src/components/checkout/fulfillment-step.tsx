"use client";

import type { FulfillmentMode } from "@/lib/types";
import type { UserAddress } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { FAST_DELIVERY_SURCHARGE } from "@/lib/constants";
import {
  Truck,
  Store,
  MapPin,
  Check,
  ChevronRight,
  Zap,
  Clock,
} from "lucide-react";

interface FulfillmentStepProps {
  fulfillmentMode: FulfillmentMode;
  deliveryTier: "standard" | "fast";
  selectedAddress: UserAddress | undefined;
  restaurantDeliveryFee: number;
  onSetFulfillmentMode: (mode: FulfillmentMode) => void;
  onSetDeliveryTier: (tier: "standard" | "fast") => void;
}

export function FulfillmentStep({
  fulfillmentMode,
  deliveryTier,
  selectedAddress,
  restaurantDeliveryFee,
  onSetFulfillmentMode,
  onSetDeliveryTier,
}: FulfillmentStepProps) {
  return (
    <div className="px-4 py-6 space-y-5">
      <p className="text-[14px] text-[#6B7280]">
        Como deseja receber seu pedido?
      </p>

      {/* Delivery option */}
      <button
        type="button"
        onClick={() => onSetFulfillmentMode("delivery")}
        className={`flex w-full items-center gap-4 rounded-[16px] border-2 p-4 text-left transition-colors ${
          fulfillmentMode === "delivery"
            ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
            : "border-[#E5E7EB] bg-white"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            fulfillmentMode === "delivery"
              ? "bg-[#DC2626] text-white"
              : "bg-[#F3F4F6] text-[#6B7280]"
          }`}
        >
          <Truck size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[16px] font-bold text-[#111827]">Entrega</p>
          <p className="text-[13px] text-[#6B7280]">
            Receba no seu endereco
          </p>
        </div>
        {fulfillmentMode === "delivery" && (
          <Check size={20} className="text-[#DC2626]" />
        )}
      </button>

      {/* Pickup option */}
      <button
        type="button"
        onClick={() => onSetFulfillmentMode("pickup")}
        className={`flex w-full items-center gap-4 rounded-[16px] border-2 p-4 text-left transition-colors ${
          fulfillmentMode === "pickup"
            ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
            : "border-[#E5E7EB] bg-white"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            fulfillmentMode === "pickup"
              ? "bg-[#DC2626] text-white"
              : "bg-[#F3F4F6] text-[#6B7280]"
          }`}
        >
          <Store size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[16px] font-bold text-[#111827]">
            Retirada na loja
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Retire no estabelecimento
          </p>
        </div>
        {fulfillmentMode === "pickup" && (
          <Check size={20} className="text-[#DC2626]" />
        )}
      </button>

      {/* Delivery tier (only if delivery) */}
      {fulfillmentMode === "delivery" && (
        <div className="space-y-3 pt-2">
          <p className="text-[14px] font-semibold text-[#111827]">
            Velocidade de entrega
          </p>

          <button
            type="button"
            onClick={() => onSetDeliveryTier("standard")}
            className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-3 text-left transition-colors ${
              deliveryTier === "standard"
                ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <Clock size={18} className={deliveryTier === "standard" ? "text-[#DC2626]" : "text-[#6B7280]"} />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#111827]">Padrao</p>
              <p className="text-[12px] text-[#6B7280]">40-60 min</p>
            </div>
            <span className="text-[14px] font-bold text-[#111827]">
              {formatCurrency(restaurantDeliveryFee)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSetDeliveryTier("fast")}
            className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-3 text-left transition-colors ${
              deliveryTier === "fast"
                ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <Zap size={18} className={deliveryTier === "fast" ? "text-[#DC2626]" : "text-[#6B7280]"} />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#111827]">Rapida</p>
              <p className="text-[12px] text-[#6B7280]">20-35 min</p>
            </div>
            <span className="text-[14px] font-bold text-[#111827]">
              {formatCurrency(restaurantDeliveryFee + FAST_DELIVERY_SURCHARGE)}
            </span>
          </button>
        </div>
      )}

      {/* Selected address preview (delivery only) */}
      {fulfillmentMode === "delivery" && selectedAddress && (
        <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] p-3">
          <MapPin size={18} className="text-[#DC2626] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[#111827] truncate">
              {selectedAddress.street}
              {selectedAddress.number ? `, ${selectedAddress.number}` : ""}
            </p>
            <p className="text-[12px] text-[#6B7280] truncate">
              {selectedAddress.neighborhood} - {selectedAddress.city}
            </p>
          </div>
          <ChevronRight size={16} className="text-[#9CA3AF] shrink-0" />
        </div>
      )}
    </div>
  );
}
