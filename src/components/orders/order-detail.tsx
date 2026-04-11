"use client";

import { ArrowLeft, Store } from "lucide-react";
import type { OrderDetail as OrderDetailType } from "@/lib/types";
import { STATUS_CONFIG, formatDate } from "./order-constants";
import { OrderProgress } from "./order-progress";
import {
  OrderItemsList,
  OrderAddress,
  OrderPayment,
  OrderPriceSummary,
} from "./order-detail-sections";

interface OrderDetailProps {
  order: OrderDetailType;
  onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>
        <h2 className="text-[18px] font-bold text-[#111827]">
          Detalhes do pedido
        </h2>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl ${cfg.bg} p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80">
            <cfg.icon size={22} className={cfg.text} />
          </div>
          <div>
            <p className={`text-[16px] font-bold ${cfg.text}`}>{cfg.label}</p>
            <p className="text-[12px] text-[#6B7280]">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <OrderProgress status={order.status} />

      {/* Restaurant info */}
      <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 mb-4 flex items-center gap-3">
        {order.restaurant?.logoUrl ? (
          <img
            src={order.restaurant.logoUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover border border-[#E5E7EB]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Store size={18} className="text-[#9CA3AF]" />
          </div>
        )}
        <p className="text-[15px] font-bold text-[#111827]">
          {order.restaurant?.name || "Restaurante"}
        </p>
      </div>

      <OrderItemsList items={order.items} />
      {order.deliveryAddress && <OrderAddress address={order.deliveryAddress} />}
      {order.paymentMethod && <OrderPayment method={order.paymentMethod} />}
      <OrderPriceSummary
        subtotal={order.subtotal}
        deliveryFee={order.deliveryFee}
        total={order.total}
      />
    </div>
  );
}
