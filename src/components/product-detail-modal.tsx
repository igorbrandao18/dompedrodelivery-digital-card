"use client";

import { useEffect } from "react";
import type { MenuProduct, MenuOptionGroup, MenuOption, Restaurant } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useCartStore } from "@/stores/cart";
import {
  X,
  Minus,
  Plus,
  Check,
  MessageSquare,
  UtensilsCrossed,
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

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.40)]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[16px] bg-white sm:mx-auto sm:max-w-lg sm:rounded-[16px]">
        {/* Hero image or close button */}
        {product.imageUrl ? (
          <div className="relative h-[208px] w-full flex-shrink-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
            >
              <X className="h-5 w-5 text-[#111827]" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end px-4 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]"
            >
              <X className="h-5 w-5 text-[#111827]" />
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-4 pt-4">
            {/* Name */}
            <h2 className="text-[20px] font-bold text-[#111827]">
              {product.name}
            </h2>

            {/* Description */}
            {product.description && (
              <p className="mt-1 line-clamp-6 text-[14px] text-[#6B7280]">
                {product.description}
              </p>
            )}

            {/* Serving hint */}
            {product.servingCount != null && product.servingCount > 0 && (
              <div className="mt-2 flex items-center gap-1 text-[13px] text-[#6B7280]">
                <Users className="h-4 w-4" />
                Serve {product.servingCount}{" "}
                {product.servingCount === 1 ? "pessoa" : "pessoas"}
              </div>
            )}

            {/* Price */}
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
              <div key={group.id} className="border-t border-[#E5E7EB]">
                {/* Group header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F9FAFB] px-4 py-3">
                  <div>
                    <p className="text-[14px] font-bold text-[#111827]">
                      {group.name}
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      {groupSubtitle(group)}
                    </p>
                  </div>
                  {isRequired && (
                    <span className="rounded-full bg-[#DC2626] px-2 py-0.5 text-[10px] font-bold text-white">
                      Obrigatório
                    </span>
                  )}
                </div>

                {/* Options */}
                {group.options.map((option) => {
                  const selected = isSelected(group.id, option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        toggleOption(group.id, option.id, multi)
                      }
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selected ? "bg-[rgba(220,38,38,0.08)]" : ""
                      }`}
                    >
                      {/* Thumbnail or fallback */}
                      {option.imageUrl ? (
                        <div className="h-[48px] w-[48px] flex-shrink-0 overflow-hidden rounded-[8px]">
                          <img
                            src={option.imageUrl}
                            alt={option.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
                          <UtensilsCrossed className="h-5 w-5 text-[#6B7280]" />
                        </div>
                      )}

                      {/* Name, description, price */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[#111827]">
                          {option.name}
                        </p>
                        {option.description && (
                          <p className="mt-0.5 text-[12px] text-[#6B7280]">
                            {option.description}
                          </p>
                        )}
                        {option.priceModifier > 0 && (
                          <p className="mt-0.5 text-[13px] text-[#6B7280]">
                            + {formatCurrency(option.priceModifier)}
                          </p>
                        )}
                      </div>

                      {/* Radio / Checkbox */}
                      {multi ? (
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                            selected
                              ? "border-[#DC2626] bg-[#DC2626]"
                              : "border-[#D1D5DB]"
                          }`}
                        >
                          {selected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      ) : (
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-[#DC2626]"
                              : "border-[#D1D5DB]"
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

        {/* Footer: qty + add button */}
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-[#E5E7EB] bg-white px-4 py-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-2 rounded-[8px] bg-[#F3F4F6] px-2 py-1">
            <button
              type="button"
              onClick={decrementQty}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-[16px] font-bold text-[#111827]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQty}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1 rounded-[12px] bg-[#DC2626] px-4 py-3 text-center text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Adicionar {formatCurrency(lineTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
