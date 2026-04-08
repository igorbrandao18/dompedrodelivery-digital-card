"use client";

import type { Restaurant } from "@/lib/types";
import { useCartStore } from "@/stores/cart";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { ShoppingBag } from "lucide-react";
import { CartHeader } from "./cart-header";
import { CartRestaurantInfo } from "./cart-restaurant-info";
import { CartLineRow } from "./cart-line-row";
import { CartSummary } from "./cart-summary";
import { CartFooter } from "./cart-footer";

interface CartDrawerProps {
  restaurant: Restaurant;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({
  restaurant,
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clearAll = useCartStore((s) => s.clearAll);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const isClosed = !restaurant.isAcceptingOrders;
  const belowMin =
    restaurant.minOrderValue != null && subtotal < restaurant.minOrderValue;

  useBodyScrollLock();
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.40)]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <CartHeader
          hasItems={lines.length > 0}
          onClose={onClose}
          onClear={clearAll}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <ShoppingBag className="h-12 w-12 text-[#E5E7EB]" />
              <p className="text-[16px] text-[#6B7280]">
                Sua sacola esta vazia
              </p>
            </div>
          ) : (
            <>
              <CartRestaurantInfo
                name={restaurant.name}
                logoUrl={restaurant.logoUrl}
                onAddMore={onClose}
              />

              {lines.map((line, idx) => (
                <div key={line.lineId}>
                  {idx > 0 && (
                    <div className="mx-4 border-t border-[rgba(229,231,235,0.5)]" />
                  )}
                  <CartLineRow line={line} onSetQty={setQuantity} />
                </div>
              ))}

              <CartSummary subtotal={subtotal} />
            </>
          )}
        </div>

        {lines.length > 0 && (
          <CartFooter
            subtotal={subtotal}
            lineCount={lines.length}
            isClosed={isClosed}
            belowMin={belowMin}
            minOrderValue={restaurant.minOrderValue}
            onCheckout={onCheckout}
          />
        )}
      </div>
    </div>
  );
}
