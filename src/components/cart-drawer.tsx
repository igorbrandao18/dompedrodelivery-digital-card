"use client";

import { useEffect } from "react";
import type { Restaurant, CartLine } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/stores/cart";
import { SERVICE_FEE } from "@/lib/constants";
import {
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  MessageSquare,
  UtensilsCrossed,
} from "lucide-react";

interface CartDrawerProps {
  restaurant: Restaurant;
  onClose: () => void;
  onCheckout: () => void;
}

function CartLineRow({
  line,
  onSetQty,
}: {
  line: CartLine;
  onSetQty: (lineId: string, qty: number) => void;
}) {
  return (
    <div className="flex gap-3 px-4 py-3">
      {/* Thumbnail */}
      {line.imageUrl ? (
        <div className="h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-[8px]">
          <img
            src={line.imageUrl}
            alt={line.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
          <UtensilsCrossed className="h-5 w-5 text-[#6B7280]" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#111827]">
          {line.name}
        </p>
        {line.optionsSummary && (
          <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
            {line.optionsSummary}
          </p>
        )}
        {line.customerNote && (
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[#6B7280]">
            <MessageSquare className="h-3 w-3" />
            <span className="truncate">{line.customerNote}</span>
          </div>
        )}
        <p className="mt-1 text-[14px] font-bold text-[#111827]">
          {formatCurrency(
            (line.unitPrice +
              line.selectedOptions.reduce((s, o) => s + o.priceModifier, 0)) *
              line.quantity
          )}
        </p>

        {/* Qty controls */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetQty(line.lineId, line.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            {line.quantity === 1 ? (
              <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="w-5 text-center text-[14px] font-bold text-[#111827]">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onSetQty(line.lineId, line.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ restaurant, onClose, onCheckout }: CartDrawerProps) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clearAll = useCartStore((s) => s.clearAll);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const isClosed = !restaurant.isAcceptingOrders;
  const belowMin = restaurant.minOrderValue != null && subtotal < restaurant.minOrderValue;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.40)]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header — matches mobile cart screen */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-2 py-3">
          <div className="min-w-[72px]">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#DC2626] transition-colors hover:bg-[#F3F4F6]"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <h2 className="text-[14px] font-bold tracking-wide text-[#111827] uppercase">
            Sacola
          </h2>
          <div className="min-w-[72px] flex justify-end">
            {lines.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-[14px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
              >
                Limpar
              </button>
            ) : (
              <div className="w-2" />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <ShoppingBag className="h-12 w-12 text-[#E5E7EB]" />
              <p className="text-[16px] text-[#6B7280]">
                Sua sacola está vazia
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant info */}
              <div className="px-4 pt-6">
                <div className="flex items-center gap-4">
                  {restaurant.logoUrl ? (
                    <img
                      src={restaurant.logoUrl}
                      alt={restaurant.name}
                      className="h-12 w-12 rounded-full bg-[#F9FAFB] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F9FAFB]">
                      <UtensilsCrossed className="h-6 w-6 text-[#6B7280]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-[16px] font-bold text-[#111827]">
                      {restaurant.name}
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-0.5 text-[14px] font-semibold text-[#DC2626] hover:underline"
                    >
                      Adicionar mais itens
                    </button>
                  </div>
                </div>

                <p className="mt-6 mb-2 text-[14px] font-bold text-[#111827]">
                  Itens adicionados
                </p>
              </div>

              {/* Cart lines */}
              {lines.map((line, idx) => (
                <div key={line.lineId}>
                  {idx > 0 && (
                    <div className="mx-4 border-t border-[rgba(229,231,235,0.5)]" />
                  )}
                  <CartLineRow line={line} onSetQty={setQuantity} />
                </div>
              ))}

              {/* Summary */}
              <div className="mt-6 px-4 pb-4">
                <p className="text-[14px] font-bold text-[#111827] mb-4">
                  Resumo de valores
                </p>
                <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
                  <span>Entrega</span>
                  <span className="tabular-nums">A calcular</span>
                </div>
                <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
                  <span>Taxa de serviço</span>
                  <span className="tabular-nums">{formatCurrency(SERVICE_FEE)}</span>
                </div>
                <div className="mt-2 flex justify-between text-[14px] font-bold text-[#111827]">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(subtotal + SERVICE_FEE)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer — mobile style: total left + button right */}
        {lines.length > 0 && (
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-[#6B7280]">Total sem a entrega</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#111827] tabular-nums">
                  {formatCurrency(subtotal + SERVICE_FEE)} / {lines.length} {lines.length === 1 ? "item" : "itens"}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {isClosed && (
                  <p className="text-[12px] text-[#DC2626] font-medium">Restaurante fechado no momento</p>
                )}
                {!isClosed && belowMin && (
                  <p className="text-[12px] text-[#DC2626] font-medium">
                    Pedido mínimo: {formatCurrency(restaurant.minOrderValue!)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onCheckout}
                  disabled={isClosed || belowMin}
                  className="rounded-[12px] bg-[#DC2626] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
