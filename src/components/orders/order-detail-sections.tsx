"use client";

import { MapPin, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { OrderDetailItem, OrderDetail } from "@/lib/types";
import { PAYMENT_LABELS } from "./order-constants";

export function OrderItemsList({ items }: { items: OrderDetailItem[] }) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-[14px] font-bold text-[#111827]">Itens</p>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[11px] font-bold text-[#6B7280]">
                {item.quantity}x
              </span>
              <span className="text-[14px] text-[#111827]">{item.productName}</span>
            </div>
            <span className="text-[14px] font-medium text-[#6B7280] tabular-nums ml-3 shrink-0">
              {formatCurrency(item.totalPrice)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderAddress({ address }: { address: NonNullable<OrderDetail["deliveryAddress"]> }) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] shrink-0">
          <MapPin size={16} className="text-[#DC2626]" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#111827]">
            {address.street}
            {address.streetNumber ? `, ${address.streetNumber}` : ""}
          </p>
          {address.complement && (
            <p className="text-[12px] text-[#6B7280]">{address.complement}</p>
          )}
          <p className="text-[12px] text-[#6B7280]">
            {address.neighborhood}
            {address.city ? ` - ${address.city}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function OrderPayment({ method }: { method: string }) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] shrink-0">
          <CreditCard size={16} className="text-[#DC2626]" />
        </div>
        <span className="text-[14px] font-medium text-[#111827]">
          {PAYMENT_LABELS[method] || method}
        </span>
      </div>
    </div>
  );
}

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
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4 px-4 py-3 space-y-2">
      <p className="text-[14px] font-bold text-[#111827] mb-2">Resumo</p>
      <div className="flex justify-between text-[14px] text-[#6B7280]">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-[14px] text-[#6B7280]">
        <span>Entrega</span>
        <span className="tabular-nums">
          {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}
        </span>
      </div>
      <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-[16px] font-bold text-[#111827]">
        <span>Total</span>
        <span className="tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
