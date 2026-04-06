"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  MapPin,
  Clock,
  Star,
  ChevronDown,
  Search,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* ── types ── */
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isAcceptingOrders: boolean;
  estimatedDeliveryMinutes: number;
  minOrderValue: number;
  deliveryFee: number;
  rating?: number;
  ratingCount?: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  listPrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  optionGroups?: OptionGroup[];
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface OptionGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: Option[];
}

interface Option {
  id: string;
  name: string;
  description: string | null;
  priceModifier: number;
  imageUrl: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  options: Option[];
}

interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}

/* ── helpers ── */
function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

/* ── page ── */
export default function CardapioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        // Get restaurant by slug
        const restoRes = await fetch(`${API_URL}/restaurants/by-slug/${slug}/`);
        if (!restoRes.ok) {
          setError("Restaurante não encontrado");
          setLoading(false);
          return;
        }
        const restaurant: Restaurant = await restoRes.json();

        // Get menu
        const menuRes = await fetch(
          `${API_URL}/restaurants/${restaurant.id}/menu/`
        );
        const menu = await menuRes.json();

        setData({
          restaurant,
          categories: menu.categories || [],
        });
        if (menu.categories?.length > 0) {
          setActiveCategory(menu.categories[0].name);
        }
      } catch {
        setError("Erro ao carregar cardápio");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, options: [] }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const scrollToCategory = (name: string) => {
    setActiveCategory(name);
    categoryRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Filter by search
  const filteredCategories = data?.categories
    .map((cat) => ({
      ...cat,
      products: search
        ? cat.products.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description?.toLowerCase().includes(search.toLowerCase())
          )
        : cat.products,
    }))
    .filter((cat) => cat.products.length > 0);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EA1D2C] border-t-transparent" />
      </div>
    );
  }

  /* ── error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {error || "Restaurante não encontrado"}
        </h1>
        <p className="text-sm text-gray-500">
          Verifique o endereço e tente novamente
        </p>
      </div>
    );
  }

  const { restaurant, categories } = data;

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative">
        {restaurant.bannerUrl ? (
          <img
            src={restaurant.bannerUrl}
            alt=""
            className="w-full h-48 sm:h-56 object-cover"
          />
        ) : (
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-[#EA1D2C] to-[#b91424]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Restaurant info */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-start gap-4">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md -mt-10"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#EA1D2C] flex items-center justify-center -mt-10 border-2 border-white shadow-md">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-gray-900">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                {restaurant.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {restaurant.rating.toFixed(1)}
                    {restaurant.ratingCount && (
                      <span className="text-gray-400">
                        ({restaurant.ratingCount})
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {restaurant.estimatedDeliveryMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Entrega{" "}
                  {restaurant.deliveryFee > 0
                    ? formatCurrency(restaurant.deliveryFee)
                    : "Grátis"}
                </span>
              </div>
              {restaurant.minOrderValue > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Pedido mínimo {formatCurrency(restaurant.minOrderValue)}
                </p>
              )}
            </div>
            {!restaurant.isAcceptingOrders && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full shrink-0">
                Fechado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search + Category pills */}
      <div className="max-w-3xl mx-auto px-4 mt-4 sticky top-0 z-20 bg-gray-50 pb-3 pt-2">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EA1D2C]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => scrollToCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.name
                  ? "bg-[#EA1D2C] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-3xl mx-auto px-4 pb-32">
        {(filteredCategories || []).map((cat) => (
          <div
            key={cat.name}
            ref={(el) => {
              categoryRefs.current[cat.name] = el;
            }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3 pt-2">
              {cat.name}
            </h2>
            <div className="space-y-3">
              {cat.products
                .filter((p) => p.isAvailable)
                .map((product) => {
                  const inCart = cart.find(
                    (i) => i.product.id === product.id
                  );
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden flex"
                    >
                      <div className="flex-1 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-[#EA1D2C]">
                            {formatCurrency(product.price)}
                          </span>
                          {product.listPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(product.listPrice)}
                            </span>
                          )}
                        </div>
                        {/* Add/quantity buttons */}
                        <div className="mt-3">
                          {inCart ? (
                            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(product.id, -1)
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#EA1D2C] hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold w-6 text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(product.id, 1)
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#EA1D2C] hover:bg-red-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              disabled={!restaurant.isAcceptingOrders}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#EA1D2C] text-white hover:bg-[#c91625] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Product image */}
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-28 h-28 object-cover shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {filteredCategories?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">
              Nenhum produto encontrado
            </p>
          </div>
        )}
      </div>

      {/* Cart footer */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between bg-[#EA1D2C] text-white rounded-xl px-5 py-3.5 hover:bg-[#c91625] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {cartCount}
                </div>
                <span className="font-semibold">Ver sacola</span>
              </div>
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-bold">Sua sacola</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3"
                >
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm font-bold text-[#EA1D2C]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#EA1D2C] hover:text-[#EA1D2C]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#EA1D2C] hover:text-[#EA1D2C]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Entrega</span>
                <span>
                  {restaurant.deliveryFee > 0
                    ? formatCurrency(restaurant.deliveryFee)
                    : "Grátis"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-[#EA1D2C]">
                  {formatCurrency(cartTotal + restaurant.deliveryFee)}
                </span>
              </div>
              <button className="w-full bg-[#EA1D2C] text-white py-3.5 rounded-xl font-semibold hover:bg-[#c91625] transition-colors">
                Fazer pedido via WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
