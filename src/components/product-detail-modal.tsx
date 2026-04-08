"use client";

import { useEffect } from "react";
import type { MenuProduct, MenuOptionGroup, Restaurant } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useCartStore } from "@/stores/cart";
import {
  Minus,
  Plus,
  Check,
  MessageSquare,
  Users,
} from "lucide-react";

interface ProductDetailModalProps {
  product: MenuProduct;
  restaurant: Restaurant;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  restaurant,
  onClose,
}: ProductDetailModalProps) {
  const {
    quantity,
    incrementQty,
    decrementQty,
    toggleOption,
    isSelected,
    canAdd,
    allSelectedOptions,
    lineTotal,
    customerNote,
    setCustomerNote,
    groupSubtitle,
  } = useProductDetail(product);

  const addItem = useCartStore((s) => s.addItem);

  const isClosed = !restaurant.isAcceptingOrders;

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

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      productId: product.id,
      name: product.name,
      description: product.description ?? undefined,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      selectedOptions: allSelectedOptions,
      optionsSummary: allSelectedOptions.map((o) => o.name).join(", "),
      customerNote,
    });
    onClose();
  };

  const isMulti = (group: MenuOptionGroup) => group.maxSelections > 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[80px]">
        {/* Hero image */}
        {product.imageUrl ? (
          <div className="relative h-[280px] w-full flex-shrink-0 bg-[#E5E7EB]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {/* Close button — dark circle, top-left */}
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 top-[env(safe-area-inset-top,12px)] mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45"
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative h-[120px] w-full flex-shrink-0 bg-[#F3F4F6]">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 top-[env(safe-area-inset-top,12px)] mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45"
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Product info */}
        <div className="px-4 pb-4 pt-4">
          <h2 className="text-[20px] font-bold text-[#111827]">
            {product.name}
          </h2>

          {product.description && (
            <p className="mt-1 text-[14px] leading-[20px] text-[#6B7280]">
              {product.description}
            </p>
          )}

          {product.servingCount != null && product.servingCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[13px] text-[#6B7280]">
              <Users className="h-4 w-4" />
              Serve {product.servingCount}{" "}
              {product.servingCount === 1 ? "pessoa" : "pessoas"}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            {product.listPrice != null && product.listPrice > product.price && (
              <span className="text-[14px] text-[#6B7280] line-through">
                {formatCurrency(product.listPrice)}
              </span>
            )}
            <span className="text-[18px] font-bold text-[#111827]">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Option groups */}
        {product.optionGroups.map((group) => {
          const multi = isMulti(group);
          const isRequired = group.minSelections > 0;

          return (
            <div key={group.id}>
              {/* Group header — sticky, light bg, name + subtitle stacked */}
              <div className="sticky top-0 z-10 flex items-start justify-between border-y border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
                <div>
                  <p className="text-[16px] font-bold text-[#111827]">
                    {group.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">
                    {groupSubtitle(group)}
                  </p>
                </div>
                {isRequired && (
                  <span className="mt-1 rounded-[4px] bg-[#111827] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Obrigatório
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="divide-y divide-[#E5E7EB] mx-4">
              {group.options.map((option) => {
                const selected = isSelected(group.id, option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(group.id, option.id, multi)}
                    className="flex w-full items-center gap-3 py-4 text-left transition-colors"
                  >
                    {/* Text content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-[#111827]">
                        {option.name}
                      </p>
                      {option.description && (
                        <p className="mt-0.5 text-[13px] text-[#6B7280]">
                          {option.description}
                        </p>
                      )}
                      {option.priceModifier > 0 && (
                        <p className="mt-0.5 text-[13px] text-[#6B7280]">
                          + {formatCurrency(option.priceModifier)}
                        </p>
                      )}
                    </div>

                    {/* Product image (if any) */}
                    {option.imageUrl && (
                      <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[8px] bg-[#F9FAFB]">
                        <img
                          src={option.imageUrl}
                          alt={option.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Action: + button (multi) or radio (single) */}
                    {multi ? (
                      selected ? (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#DC2626]">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
                          <Plus className="h-6 w-6 text-[#DC2626]" />
                        </div>
                      )
                    ) : (
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? "border-[#DC2626]" : "border-[#D1D5DB]"
                        }`}
                      >
                        {selected && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                        )}
                      </div>
                    )}

                  </button>
                );
              })}
              </div>
            </div>
          );
        })}

        {/* Customer notes */}
        <div className="border-t border-[#E5E7EB] px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
              <MessageSquare className="h-4 w-4" />
              Observações
            </div>
            <span className="text-[12px] text-[#6B7280]">
              {customerNote.length}/500
            </span>
          </div>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Ex: tirar cebola, sem gelo..."
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
          />
        </div>
      </div>

      {/* Footer — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
      >
        {/* Quantity box — bordered */}
        <div className="flex h-12 items-center rounded-[8px] border border-[#E5E7EB]">
          <button
            type="button"
            onClick={decrementQty}
            className="flex h-full w-10 items-center justify-center text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-[16px] font-bold text-[#111827]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={incrementQty}
            className="flex h-full w-10 items-center justify-center text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add button — "Adicionar" left, price right */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd || isClosed}
          className="flex flex-1 items-center justify-between rounded-[12px] bg-[#DC2626] px-5 py-3.5 text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-[14px] font-bold">{isClosed ? "Restaurante fechado" : "Adicionar"}</span>
          {!isClosed && <span className="text-[14px] font-bold">{formatCurrency(lineTotal)}</span>}
        </button>
      </div>
    </div>
  );
}
