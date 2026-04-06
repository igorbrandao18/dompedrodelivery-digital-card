"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useRestaurant } from "@/hooks/use-restaurant";
import { useCartStore } from "@/stores/cart";
import { RestaurantHeader } from "@/components/restaurant-header";
import { SearchBar } from "@/components/search-bar";
import { CategoryAccordion } from "@/components/category-accordion";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { CartFooter } from "@/components/cart-footer";
import type { MenuProduct } from "@/lib/types";
import { ShoppingBag } from "lucide-react";

export default function CardapioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { restaurant, categories, loading, error } = useRestaurant(slug);

  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null
  );
  const [cartOpen, setCartOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cartCount = useCartStore((s) => s.getItemCount());
  const cartSubtotal = useCartStore((s) => s.getSubtotal());

  // Expand first category on load
  if (categories.length > 0 && expandedCats.size === 0) {
    setExpandedCats(new Set([categories[0].id]));
  }

  const toggleCategory = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToCategory = (id: string) => {
    setExpandedCats((prev) => new Set(prev).add(id));
    categoryRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Filter categories by search
  const filteredCategories = search
    ? categories
        .map((cat) => ({
          ...cat,
          products: cat.products.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description?.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.products.length > 0)
    : categories;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DC2626] border-t-transparent" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-[#111827] mb-2">
          {error || "Restaurante não encontrado"}
        </h1>
        <p className="text-sm text-[#6B7280]">
          Verifique o endereço e tente novamente
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Restaurant header (banner + info card) */}
      <RestaurantHeader restaurant={restaurant} />

      {/* Cardápio title */}
      <div className="max-w-2xl mx-auto px-4 mt-3 mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Cardápio
        </div>
      </div>

      {/* Search + category pills (sticky) */}
      <SearchBar
        value={search}
        onChange={setSearch}
        categories={categories}
        activeIds={expandedCats}
        onCategoryPress={scrollToCategory}
      />

      {/* Category accordion with products */}
      <CategoryAccordion
        categories={filteredCategories}
        expandedIds={expandedCats}
        onToggle={toggleCategory}
        onProductPress={setSelectedProduct}
        categoryRefs={categoryRefs}
      />

      {/* Empty search results */}
      {filteredCategories.length === 0 && (
        <div className="max-w-2xl mx-auto px-4 text-center py-12">
          <p className="text-sm text-gray-400">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Cart footer (fixed bottom) */}
      <CartFooter
        itemCount={cartCount}
        subtotal={cartSubtotal}
        onPress={() => setCartOpen(true)}
      />

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          restaurant={restaurant}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
