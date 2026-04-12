"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRestaurant } from "@/hooks/use-restaurant";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { RestaurantHeader } from "@/components/restaurant-header";
import { SearchBar } from "@/components/search-bar";
import { CategoryAccordion } from "@/components/category-accordion";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutModal } from "@/components/checkout-modal";
import { BottomTabs } from "@/components/bottom-tabs";
import { OrdersTab } from "@/components/orders-tab";
import { ProfileTab } from "@/components/profile-tab";
import { AuthModal } from "@/components/auth-modal";
import type { MenuProduct } from "@/lib/types";
import { ShoppingBag } from "lucide-react";

type Tab = "cardapio" | "pedidos" | "perfil";

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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("cardapio");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cartCount = useCartStore((s) => s.getItemCount());
  const cartSubtotal = useCartStore((s) => s.getSubtotal());
  const restoreSession = useAuthStore((s) => s.restoreSession);

  // Restore auth session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Expand first category once when menu loads
  const didExpandFirst = useRef(false);
  useEffect(() => {
    if (categories.length > 0 && !didExpandFirst.current) {
      didExpandFirst.current = true;
      setExpandedCats(new Set([categories[0].id]));
    }
  }, [categories]);

  const toggleCategory = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
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

  const [pendingCheckout, setPendingCheckout] = useState(false);

  const handleOpenAuth = () => setShowAuthModal(true);
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingCheckout) {
      setPendingCheckout(false);
      setCheckoutOpen(true);
    }
  };

  const handleCheckout = () => {
    const isAuth = useAuthStore.getState().isAuthenticated();
    if (!isAuth) {
      setPendingCheckout(true);
      setShowAuthModal(true);
    } else {
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setActiveTab("pedidos");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DC2626] border-t-transparent" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
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

  /* Bottom padding: tabs (56px) + cart footer when visible */
  const bottomPadding = activeTab === "cardapio" && cartCount > 0 ? "pb-36" : "pb-20";

  return (
    <div className={`min-h-screen bg-white ${bottomPadding}`}>
      {/* ── Cardapio Tab ── */}
      {activeTab === "cardapio" && (
        <>
          {/* Restaurant header (banner + info card) */}
          <RestaurantHeader restaurant={restaurant} />


          {/* Search + category pills (sticky) */}
          <SearchBar
            value={search}
            onChange={setSearch}
          />

          {/* Category accordion with products */}
          <div className={!restaurant.isAcceptingOrders ? "opacity-50 pointer-events-none" : ""}>
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
          </div>

          {/* Cart footer (above bottom tabs) */}
          {cartCount > 0 && (
            <div className="fixed bottom-[56px] left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
              style={{ paddingBottom: 0 }}
            >
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="flex w-full items-center justify-between rounded-[12px] bg-[#DC2626] px-4 py-3 text-white transition-colors hover:bg-[#B91C1C]"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[13px] font-bold">
                      {cartCount}
                    </span>
                    <span className="text-[16px] font-bold">Ver sacola</span>
                  </div>
                  <span className="text-[16px] font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(cartSubtotal)}
                  </span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Pedidos Tab ── */}
      {activeTab === "pedidos" && (
        <OrdersTab
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          onLoginPress={handleOpenAuth}
        />
      )}

      {/* ── Perfil Tab ── */}
      {activeTab === "perfil" && (
        <ProfileTab
          restaurantName={restaurant.name}
          onLoginPress={handleOpenAuth}
          onSwitchTab={(tab) => setActiveTab(tab as typeof activeTab)}
        />
      )}

      {/* Bottom tabs (always visible) */}
      <BottomTabs
        activeTab={activeTab}
        onTabChange={(tab: string) => setActiveTab(tab as Tab)}
        cartCount={cartCount}
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
          onCheckout={handleCheckout}
        />
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <CheckoutModal
          restaurant={restaurant}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingCheckout(false);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
