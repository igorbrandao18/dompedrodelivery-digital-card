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
      className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-[#F9FAFB]"
    >
      {/* Left side */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[14px] font-semibold text-[#111827]">
          {product.name}
        </p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-[12px] text-[#6B7280]">
            {product.description}
          </p>
        )}
        <p className="mt-1.5 text-[12px] font-bold text-[#DC2626]">
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
        <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] bg-[#F9FAFB]">
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
    <div>
      {categories.map((category) => {
        const isExpanded = expandedIds.has(category.id);

        return (
          <div
            key={category.id}
            ref={(el) => {
              categoryRefs.current[category.id] = el;
            }}
            className="mb-2 overflow-hidden"
          >
            {/* Header — gray bg, no border */}
            <button
              type="button"
              onClick={() => onToggle(category.id)}
              className="flex w-full items-center justify-between bg-[#EFEFF4] px-4 py-3 min-h-[52px]"
            >
              <div className="flex flex-1 items-center gap-1.5">
                <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6B7280] line-clamp-2">
                  {category.name}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-[#6B7280]" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#6B7280]" />
                )}
              </div>
              <span className="text-[11px] font-semibold text-[#6B7280] shrink-0 ml-2">
                {category.products.length === 1
                  ? "1 item"
                  : `${category.products.length} itens`}
              </span>
            </button>

            {/* Products list */}
            {isExpanded && (
              <div className="bg-white">
                {category.products.map((product, idx) => (
                  <div key={product.id}>
                    {idx > 0 && (
                      <div className="border-t border-[#E5E7EB]" />
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
