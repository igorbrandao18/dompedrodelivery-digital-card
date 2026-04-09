"use client";

import { useState } from "react";
import type { CartLine, FulfillmentMode, UserAddress } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";
import { Truck, Store, CreditCard, Banknote, Tag } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { PAYMENT_OPTIONS } from "./payment-step";

interface ReviewStepProps {
  lines: CartLine[];
  fulfillmentMode: FulfillmentMode;
  selectedAddress: UserAddress | undefined;
  paymentMethod: string;
  cashChangeAmount: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  error: string | null;
}

export function ReviewStep({
  lines,
  fulfillmentMode,
  selectedAddress,
  paymentMethod,
  cashChangeAmount,
  subtotal,
  deliveryFee,
  total,
  error,
}: ReviewStepProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError("Cupom nao encontrado");
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Items */}
      <div>
        <p className="text-[14px] font-semibold text-[#111827] mb-3">
          Itens do pedido
        </p>
        <div className="space-y-2">
          {lines.map((line) => {
            const optTotal = line.selectedOptions.reduce(
              (s, o) => s + o.priceModifier,
              0
            );
            const linePrice = (line.unitPrice + optTotal) * line.quantity;
            return (
              <div
                key={line.lineId}
                className="flex items-start justify-between py-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[#111827]">
                    {line.quantity}x {line.name}
                  </p>
                  {line.optionsSummary && (
                    <p className="text-[12px] text-[#6B7280] truncate">
                      {line.optionsSummary}
                    </p>
                  )}
                </div>
                <span className="text-[14px] font-medium text-[#111827] ml-3 shrink-0">
                  {formatCurrency(linePrice)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery/pickup info */}
      <div className="rounded-[12px] border border-[#E5E7EB] p-3 space-y-2">
        <div className="flex items-center gap-2">
          {fulfillmentMode === "delivery" ? (
            <Truck size={16} className="text-[#DC2626]" />
          ) : (
            <Store size={16} className="text-[#DC2626]" />
          )}
          <span className="text-[14px] font-medium text-[#111827]">
            {fulfillmentMode === "delivery" ? "Entrega" : "Retirada na loja"}
          </span>
        </div>
        {fulfillmentMode === "delivery" && selectedAddress && (
          <p className="text-[13px] text-[#6B7280] pl-6">
            {selectedAddress.street}
            {selectedAddress.number ? `, ${selectedAddress.number}` : ""} -{" "}
            {selectedAddress.neighborhood}
          </p>
        )}
      </div>

      {/* Payment info */}
      <div className="rounded-[12px] border border-[#E5E7EB] p-3">
        <div className="flex items-center gap-2">
          {paymentMethod === "cash" ? (
            <Banknote size={16} className="text-[#DC2626]" />
          ) : (
            <CreditCard size={16} className="text-[#DC2626]" />
          )}
          <span className="text-[14px] font-medium text-[#111827]">
            {PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label}
          </span>
        </div>
        {paymentMethod === "cash" && cashChangeAmount && (
          <p className="text-[13px] text-[#6B7280] pl-6 mt-1">
            Troco para {formatCurrency(cashChangeAmount)}
          </p>
        )}
      </div>

      {/* Coupon */}
      <div className="rounded-[12px] border-2 border-dashed border-[#D1D5DB] p-3 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={16} className="text-[#DC2626]" />
          <span className="text-[14px] font-medium text-[#111827]">Cupom de desconto</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
            placeholder="Digite o cupom"
            className="flex-1 rounded-[8px] border border-[#D1D5DB] px-3 py-2 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#DC2626] transition-colors"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="rounded-[8px] bg-[#DC2626] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
            disabled={!couponCode.trim()}
          >
            Aplicar
          </button>
        </div>
        {couponError && (
          <p className="text-[12px] text-[#DC2626]">{couponError}</p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
        <div className="flex justify-between text-[14px] text-[#6B7280]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[14px] text-[#6B7280]">
          <span>Entrega</span>
          <span>
            {fulfillmentMode === "pickup"
              ? "Gratis"
              : formatCurrency(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between text-[14px] text-[#6B7280]">
          <span>Taxa de servico</span>
          <span>{formatCurrency(SERVICE_FEE)}</span>
        </div>
        <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-[16px] font-bold text-[#111827]">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
    </div>
  );
}
