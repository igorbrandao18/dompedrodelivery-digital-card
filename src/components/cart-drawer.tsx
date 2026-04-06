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
        <div className="h-[56px] w-[56px] flex-shrink-0 overflow-hidden rounded-[8px]">
          <img
            src={line.imageUrl}
            alt={line.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
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

function buildWhatsAppText(
  restaurant: Restaurant,
  lines: CartLine[],
  subtotal: number,
  deliveryFee: number
): string {
  let msg = `*Novo Pedido - ${restaurant.name}*\n\n`;

  lines.forEach((line, i) => {
    const linePrice =
      (line.unitPrice +
        line.selectedOptions.reduce((s, o) => s + o.priceModifier, 0)) *
      line.quantity;
    msg += `*${i + 1}. ${line.name}* x${line.quantity} — ${formatCurrency(linePrice)}\n`;
    if (line.optionsSummary) msg += `   _${line.optionsSummary}_\n`;
    if (line.customerNote) msg += `   Obs: ${line.customerNote}\n`;
  });

  msg += `\n---\n`;
  msg += `Subtotal: ${formatCurrency(subtotal)}\n`;
  msg += `Entrega: ${deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}\n`;
  msg += `Taxa de serviço: ${formatCurrency(SERVICE_FEE)}\n`;
  msg += `*Total: ${formatCurrency(subtotal + deliveryFee + SERVICE_FEE)}*`;

  return msg;
}

export function CartDrawer({ restaurant, onClose }: CartDrawerProps) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clearAll = useCartStore((s) => s.clearAll);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const deliveryFee = restaurant.deliveryFee;
  const total = subtotal + deliveryFee + SERVICE_FEE;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleWhatsApp = () => {
    const phone = restaurant.phone?.replace(/\D/g, "") || "";
    const text = buildWhatsAppText(restaurant, lines, subtotal, deliveryFee);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.40)]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#DC2626]" />
            <h2 className="text-[18px] font-bold text-[#111827]">Sacola</h2>
          </div>
          <div className="flex items-center gap-3">
            {lines.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[14px] font-medium text-[#DC2626]"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]"
            >
              <X className="h-5 w-5 text-[#111827]" />
            </button>
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
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                {restaurant.logoUrl && (
                  <img
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <span className="text-[14px] font-medium text-[#111827]">
                  {restaurant.name}
                </span>
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
              <div className="border-t border-[#E5E7EB] px-4 py-3">
                <div className="flex justify-between text-[14px] text-[#6B7280]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-[14px] text-[#6B7280]">
                  <span>Entrega</span>
                  <span>
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-[14px] text-[#6B7280]">
                  <span>Taxa de serviço</span>
                  <span>{formatCurrency(SERVICE_FEE)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-[#E5E7EB] pt-2 text-[16px] font-bold text-[#111827]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        {lines.length > 0 && (
          <div className="border-t border-[#E5E7EB] px-4 py-3">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#25D366] px-4 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#20bd5a]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Fazer pedido via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
