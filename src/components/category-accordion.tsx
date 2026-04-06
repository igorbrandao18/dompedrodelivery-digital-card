"use client";

import type { MenuCategory, MenuProduct } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CategoryAccordionProps {
  categories: MenuCategory[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onProductPress: (product: MenuProduct) => void;
  categoryRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

function ProductRow({
  product,
  onPress,
}: {
  product: MenuProduct;
  onPress: (product: MenuProduct) => void;
}) {
  const hasVariants = product.optionGroups.length > 0;

  return (
    <button
      type="button"
      onClick={() => onPress(product)}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F9FAFB]"
    >
      {/* Left side */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[14px] font-medium text-[#111827]">
          {product.name}
        </p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-[12px] text-[#6B7280]">
            {product.description}
          </p>
        )}
        <p className="mt-1 text-[14px] font-semibold text-[#111827]">
          {hasVariants && (
            <span className="text-[12px] font-normal text-[#6B7280]">
              A partir de{" "}
            </span>
          )}
          {formatCurrency(product.price)}
        </p>
      </div>

      {/* Right side: thumbnail */}
      {product.imageUrl && (
        <div className="h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-[12px]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </button>
  );
}

export function CategoryAccordion({
  categories,
  expandedIds,
  onToggle,
  onProductPress,
  categoryRefs,
}: CategoryAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((category) => {
        const isExpanded = expandedIds.has(category.id);

        return (
          <div
            key={category.id}
            ref={(el) => {
              categoryRefs.current[category.id] = el;
            }}
            className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => onToggle(category.id)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[#111827]">
                  {category.name}
                </span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F3F4F6] px-1.5 text-[12px] font-medium text-[#6B7280]">
                  {category.products.length}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </button>

            {/* Products list */}
            {isExpanded && (
              <div className="border-t border-[#E5E7EB]">
                {category.products.map((product, idx) => (
                  <div key={product.id}>
                    {idx > 0 && (
                      <div className="mx-4 border-t border-[rgba(229,231,235,0.5)]" />
                    )}
                    <ProductRow product={product} onPress={onProductPress} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
