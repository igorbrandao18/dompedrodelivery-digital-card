"use client";

import { MapPin, CreditCard, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { OrderDetailItem, OrderDetail } from "@/lib/types";
import { PAYMENT_LABELS } from "./order-constants";

/* ---------- Items list ---------- */
export function OrderItemsList({ items }: { items: OrderDetailItem[] }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden mb-4">
      <p className="px-4 pt-4 pb-2 text-[14px] font-bold text-[#111827]">
        Itens do pedido
      </p>
      <div className="divide-y divide-[#F3F4F6]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            {/* Product image */}
            {item.imageUrl ? (
              <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[8px] bg-[#F9FAFB]">
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
                <UtensilsCrossed size={18} className="text-[#D1D5DB]" />
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#111827] truncate">
                {item.productName}
              </p>
              <p className="text-[13px] text-[#6B7280] tabular-nums mt-0.5">
                {formatCurrency(item.totalPrice)}
              </p>
            </div>
            {/* Qty */}
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-[6px] bg-[#F3F4F6] text-[11px] font-bold text-[#6B7280] shrink-0">
              {item.quantity}×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Address ---------- */
export function OrderAddress({
  address,
}: {
  address: NonNullable<OrderDetail["deliveryAddress"]>;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
          <MapPin size={16} className="text-[#DC2626]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#111827] mb-0.5">
            Endereco de entrega
          </p>
          <p className="text-[13px] text-[#6B7280]">
            {address.street}
            {address.streetNumber ? `, ${address.streetNumber}` : ""}
            {address.complement ? ` - ${address.complement}` : ""}
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
            {address.neighborhood}
            {address.city ? ` - ${address.city}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Payment ---------- */
export function OrderPayment({ method }: { method: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
          <CreditCard size={16} className="text-[#DC2626]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#111827] mb-0.5">
            Pagamento
          </p>
          <p className="text-[13px] text-[#6B7280]">
            {PAYMENT_LABELS[method] || method}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Price summary ---------- */
export function OrderPriceSummary({
  subtotal,
  deliveryFee,
  total,
}: {
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 mb-4 space-y-2">
      <p className="text-[14px] font-bold text-[#111827] mb-2">
        Resumo de valores
      </p>
      <div className="flex justify-between text-[13px] text-[#6B7280]">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-[13px] text-[#6B7280]">
        <span>Taxa de entrega</span>
        <span className="tabular-nums">
          {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Gratis"}
        </span>
      </div>
      <div className="flex justify-between border-t border-[#F3F4F6] pt-2 text-[16px] font-bold text-[#111827]">
        <span>Total</span>
        <span className="tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
