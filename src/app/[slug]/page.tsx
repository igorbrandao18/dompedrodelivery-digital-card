"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/stores/cart";
import type {
  Restaurant,
  MenuCategory,
  MenuProduct,
  MenuOption,
} from "@/lib/types";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Clock,
  Star,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  Trash2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════ */
/*  MAIN PAGE                                             */
/* ═══════════════════════════════════════════════════════ */

export default function CardapioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cartCount = useCartStore((s) => s.getItemCount());
  const cartSubtotal = useCartStore((s) => s.getSubtotal());

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const resto = await apiFetch<Restaurant>(`/restaurants/by-slug/${slug}/`);
        setRestaurant(resto);
        const menu = await apiFetch<{ categories: MenuCategory[] }>(`/restaurants/${resto.id}/menu/`);
        setCategories(menu.categories || []);
        if (menu.categories?.length > 0) {
          setExpandedCats(new Set([menu.categories[0].id]));
        }
      } catch {
        setError("Restaurante não encontrado");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const toggleCategory = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToCategory = (id: string) => {
    setExpandedCats((prev) => new Set(prev).add(id));
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredCategories = search
    ? categories.map((cat) => ({ ...cat, products: cat.products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())) })).filter((cat) => cat.products.length > 0)
    : categories;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DC2626] border-t-transparent" /></div>;

  if (error || !restaurant) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-xl font-bold text-[#111827] mb-2">{error || "Restaurante não encontrado"}</h1>
      <p className="text-sm text-[#6B7280]">Verifique o endereço e tente novamente</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* ── Banner (216px like mobile) ── */}
      <div className="relative">
        {restaurant.bannerUrl ? (
          <img src={restaurant.bannerUrl} alt="" className="w-full h-[216px] object-cover" />
        ) : (
          <div className="w-full h-[216px] bg-[#FEE2E2] flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-[#DC2626]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/[0.12]" />
      </div>

      {/* ── Restaurant Info Card (overlaps -14px like mobile) ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-3.5 relative z-10">
        <div className="bg-white rounded-t-[16px] px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-[800] text-[#111827] leading-tight line-clamp-2">{restaurant.name}</h1>
              {restaurant.rating && (
                <div className="flex items-center gap-1 mt-2 text-sm text-[#6B7280]">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-[#111827]">{restaurant.rating.toFixed(1)}</span>
                  {restaurant.ratingCount && <span>({restaurant.ratingCount})</span>}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-sm text-[#6B7280]">
                <Clock className="w-4 h-4" />
                <span>{restaurant.estimatedDeliveryMinutes} min</span>
              </div>
              {restaurant.minOrderValue > 0 && (
                <div className="flex items-center gap-1 mt-1 text-sm text-[#6B7280]">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedido mín. {formatCurrency(restaurant.minOrderValue)}</span>
                </div>
              )}
            </div>
            {/* Logo in ring (72px like mobile) */}
            <div className="-mt-10">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-[rgba(220,38,38,0.35)] shadow-[0_4px_12px_rgba(220,38,38,0.2)] flex items-center justify-center bg-white">
                {restaurant.logoUrl ? (
                  <img src={restaurant.logoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                )}
              </div>
            </div>
          </div>
          {!restaurant.isAcceptingOrders && (
            <div className="mt-3 bg-red-50 text-[#DC2626] text-sm font-medium px-3 py-2 rounded-[12px] text-center">
              Restaurante fechado no momento
            </div>
          )}
        </div>
      </div>

      {/* ── Cardápio title ── */}
      <div className="max-w-2xl mx-auto px-4 mt-3 mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Cardápio
        </div>
      </div>

      {/* ── Search + Category pills (sticky) ── */}
      <div className="max-w-2xl mx-auto px-4 sticky top-0 z-20 bg-[#F9FAFB] pt-2 pb-2">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar no cardápio..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 rounded-[12px] border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#DC2626]" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${expandedCats.has(cat.id) ? "bg-[#DC2626] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Categories accordion ── */}
      <div className="max-w-2xl mx-auto px-4 space-y-2 mt-2">
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCats.has(cat.id);
          const available = cat.products.filter((p) => p.isAvailable);
          return (
            <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }} className="bg-white rounded-[16px] overflow-hidden border border-[#E5E7EB]/50">
              <button onClick={() => toggleCategory(cat.id)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#111827]">{cat.name}</span>
                  <span className="text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-full">{available.length}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-[#6B7280]" /> : <ChevronDown className="w-5 h-5 text-[#6B7280]" />}
              </button>
              {isExpanded && (
                <div className="border-t border-[#E5E7EB]/50">
                  {available.map((product) => (
                    <button key={product.id} onClick={() => setSelectedProduct(product)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]/30 last:border-0 text-left hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] line-clamp-2">{product.name}</p>
                        {product.description && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{product.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          {product.listPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.listPrice)}</span>}
                          <span className="text-sm font-bold text-[#111827]">{product.price > 0 ? `A partir de ${formatCurrency(product.price)}` : "Grátis"}</span>
                        </div>
                      </div>
                      {product.imageUrl && <img src={product.imageUrl} alt="" className="w-20 h-20 rounded-[12px] object-cover shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filteredCategories.length === 0 && <div className="text-center py-12"><p className="text-sm text-gray-400">Nenhum produto encontrado</p></div>}
      </div>

      {/* ── Cart Footer ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E7EB] shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <button onClick={() => setCartOpen(true)} className="w-full flex items-center justify-between bg-[#DC2626] text-white rounded-[12px] px-5 py-3.5 hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{cartCount}</div>
                <span className="font-semibold">Ver sacola</span>
              </div>
              <span className="font-bold">{formatCurrency(cartSubtotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      {selectedProduct && restaurant && <ProductDetailModal product={selectedProduct} restaurant={restaurant} onClose={() => setSelectedProduct(null)} />}

      {/* ── Cart Drawer ── */}
      {cartOpen && restaurant && <CartDrawer restaurant={restaurant} onClose={() => setCartOpen(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  PRODUCT DETAIL MODAL (bottom sheet like mobile)       */
/* ═══════════════════════════════════════════════════════ */

function ProductDetailModal({ product, restaurant, onClose }: { product: MenuProduct; restaurant: Restaurant; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [note, setNote] = useState("");
  const cart = useCartStore();

  const toggle = (gId: string, oId: string, multi: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (!next[gId]) next[gId] = new Set();
      const g = new Set(next[gId]);
      if (multi) { g.has(oId) ? g.delete(oId) : g.add(oId); }
      else { g.clear(); g.add(oId); }
      next[gId] = g;
      return next;
    });
  };

  const isChecked = (gId: string, oId: string) => selected[gId]?.has(oId) || false;

  const canAdd = product.optionGroups.every((g) => (selected[g.id]?.size || 0) >= g.minSelections);

  const allOpts: MenuOption[] = [];
  for (const g of product.optionGroups) for (const o of g.options) if (isChecked(g.id, o.id)) allOpts.push(o);
  const optTotal = allOpts.reduce((s, o) => s + o.priceModifier, 0);
  const total = (product.price + optTotal) * qty;

  const handleAdd = () => {
    cart.addItem({ restaurantId: restaurant.id, restaurantName: restaurant.name, productId: product.id, name: product.name, description: product.description || undefined, imageUrl: product.imageUrl, unitPrice: product.price, quantity: qty, selectedOptions: allOpts, optionsSummary: allOpts.map((o) => o.name).join(", "), customerNote: note });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] bg-white rounded-t-[16px] flex flex-col sm:max-w-lg sm:mx-auto">
        {/* Hero */}
        {product.imageUrl ? (
          <div className="relative shrink-0">
            <img src={product.imageUrl} alt="" className="w-full h-52 object-cover rounded-t-[16px]" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex justify-end px-4 pt-3"><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
        )}

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-lg font-bold text-[#111827]">{product.name}</h2>
          {product.description && <p className="text-sm text-[#6B7280] mt-1 leading-relaxed line-clamp-6">{product.description}</p>}
          {product.servingCount && <p className="text-xs text-[#6B7280] mt-1">Serve {product.servingCount} pessoa{product.servingCount > 1 ? "s" : ""}</p>}
          <div className="flex items-center gap-2 mt-2">
            {product.listPrice && <span className="text-sm text-gray-400 line-through">{formatCurrency(product.listPrice)}</span>}
            <span className="text-lg font-bold text-[#111827]">{formatCurrency(product.price)}</span>
          </div>

          {/* Option groups */}
          {product.optionGroups.map((g) => {
            const multi = g.maxSelections > 1;
            const count = selected[g.id]?.size || 0;
            return (
              <div key={g.id} className="mt-5">
                <div className="flex items-center justify-between mb-2 sticky top-0 bg-white py-1 z-10">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{g.name}</p>
                    <p className="text-xs text-[#6B7280]">{multi ? `Escolha até ${g.maxSelections}` : `Escolha ${g.minSelections}`}</p>
                  </div>
                  {g.minSelections > 0 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${count >= g.minSelections ? "bg-green-50 text-green-700" : "bg-gray-100 text-[#6B7280]"}`}>
                      {count >= g.minSelections ? "✓" : `${count}/${g.minSelections}`}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {g.options.map((o) => {
                    const checked = isChecked(g.id, o.id);
                    return (
                      <button key={o.id} onClick={() => toggle(g.id, o.id, multi)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-colors ${checked ? "bg-[rgba(220,38,38,0.08)]" : "hover:bg-[#F9FAFB]"}`}>
                        {o.imageUrl ? <img src={o.imageUrl} alt="" className="w-12 h-12 rounded-[8px] object-cover shrink-0" /> : <div className="w-12 h-12 rounded-[8px] bg-gray-100 flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5 text-gray-300" /></div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827]">{o.name}</p>
                          {o.description && <p className="text-xs text-[#6B7280]">{o.description}</p>}
                          {o.priceModifier > 0 && <p className="text-xs font-medium text-[#6B7280] mt-0.5">+ {formatCurrency(o.priceModifier)}</p>}
                        </div>
                        {multi ? (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-[#DC2626] border-[#DC2626]" : "border-[#E5E7EB]"}`}>
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? "border-[#DC2626]" : "border-[#E5E7EB]"}`}>
                            {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#6B7280]" /><span className="text-sm font-bold text-[#111827]">Observações</span></div>
              <span className="text-xs text-[#6B7280]">{note.length}/500</span>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} placeholder="Ex: sem cebola, bem passado..." className="w-full h-20 px-3 py-2 rounded-[12px] border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#DC2626] resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-[12px] px-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} className="w-9 h-9 flex items-center justify-center text-[#DC2626] disabled:text-gray-300"><Minus className="w-4 h-4" /></button>
            <span className="w-6 text-center text-sm font-bold text-[#111827]">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-[#DC2626]"><Plus className="w-4 h-4" /></button>
          </div>
          <button onClick={handleAdd} disabled={!canAdd} className="flex-1 flex items-center justify-between bg-[#DC2626] text-white rounded-[12px] px-5 py-3 font-semibold hover:bg-[#B91C1C] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
            <span>Adicionar</span>
            <span>{formatCurrency(total)}</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  CART DRAWER                                           */
/* ═══════════════════════════════════════════════════════ */

function CartDrawer({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const cart = useCartStore();
  const lines = cart.lines;
  const subtotal = cart.getSubtotal();
  const serviceFee = 0.99;
  const deliveryFee = restaurant.deliveryFee || 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handleWhatsApp = () => {
    const items = lines.map((l) => `• ${l.quantity}x ${l.name}${l.optionsSummary ? ` (${l.optionsSummary})` : ""}${l.customerNote ? ` — Obs: ${l.customerNote}` : ""} — ${formatCurrency((l.unitPrice + l.selectedOptions.reduce((s, o) => s + o.priceModifier, 0)) * l.quantity)}`).join("\n");
    const text = `🛒 *Novo Pedido — ${restaurant.name}*\n\n${items}\n\nSubtotal: ${formatCurrency(subtotal)}\nEntrega: ${deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}\nTaxa: ${formatCurrency(serviceFee)}\n*Total: ${formatCurrency(total)}*`;
    const phone = (restaurant.phone || "").replace(/\D/g, "");
    const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-lg font-bold text-[#111827]">Sacola</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { if (confirm("Limpar sacola?")) cart.clearAll(); }} className="text-xs text-[#DC2626] font-medium">Limpar</button>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-400">Sua sacola está vazia</p></div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {restaurant.logoUrl && <img src={restaurant.logoUrl} alt="" className="w-6 h-6 rounded-full" />}
                <span className="font-semibold text-[#111827]">{restaurant.name}</span>
              </div>
              {lines.map((l) => {
                const optT = l.selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
                const lt = (l.unitPrice + optT) * l.quantity;
                return (
                  <div key={l.lineId} className="flex items-center gap-3 py-2 border-b border-[#E5E7EB]/50 last:border-0">
                    {l.imageUrl ? <img src={l.imageUrl} alt="" className="w-14 h-14 rounded-[12px] object-cover shrink-0" /> : <div className="w-14 h-14 rounded-[12px] bg-gray-100 flex items-center justify-center shrink-0"><ShoppingBag className="w-6 h-6 text-gray-300" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">{l.name}</p>
                      {l.optionsSummary && <p className="text-xs text-[#6B7280] truncate">{l.optionsSummary}</p>}
                      {l.customerNote && <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5"><MessageSquare className="w-3 h-3" />{l.customerNote}</p>}
                      <p className="text-sm font-bold text-[#111827] mt-1">{formatCurrency(lt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => cart.setQuantity(l.lineId, l.quantity - 1)} className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#DC2626] hover:text-[#DC2626]">
                        {l.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{l.quantity}</span>
                      <button onClick={() => cart.setQuantity(l.lineId, l.quantity + 1)} className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#DC2626] hover:text-[#DC2626]">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#E5E7EB] px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm text-[#6B7280]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-[#6B7280]"><span>Entrega</span><span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}</span></div>
              <div className="flex justify-between text-sm text-[#6B7280]"><span>Taxa de serviço</span><span>{formatCurrency(serviceFee)}</span></div>
              <div className="flex justify-between text-base font-bold text-[#111827] pt-2 border-t border-[#E5E7EB]"><span>Total</span><span>{formatCurrency(total)}</span></div>
              <button onClick={handleWhatsApp} className="w-full bg-[#25D366] text-white py-3.5 rounded-[12px] font-semibold hover:bg-[#1da851] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Fazer pedido via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
