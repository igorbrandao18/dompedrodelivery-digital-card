"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import {
  ClipboardList,
  RefreshCw,
  LogIn,
  ArrowLeft,
  MapPin,
  CreditCard,
  Star,
  ShoppingBag,
  Clock,
  Package,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { OrderDetail, OrderDetailItem } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  shortId?: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  restaurant?: { name: string; logoUrl?: string } | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  PENDING: { label: "Pendente", bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
  CONFIRMED: { label: "Confirmado", bg: "bg-blue-50", text: "text-blue-700", icon: Package },
  PREPARING: { label: "Preparando", bg: "bg-indigo-50", text: "text-indigo-700", icon: Package },
  READY: { label: "Pronto", bg: "bg-purple-50", text: "text-purple-700", icon: Package },
  OUT_FOR_DELIVERY: { label: "Saiu p/ entrega", bg: "bg-cyan-50", text: "text-cyan-700", icon: Package },
  DELIVERED: { label: "Entregue", bg: "bg-green-50", text: "text-green-700", icon: Package },
  CANCELLED: { label: "Cancelado", bg: "bg-red-50", text: "text-red-700", icon: Package },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  credit_visa: "Visa (Crédito)",
  credit_mastercard: "Mastercard (Crédito)",
  credit_elo: "Elo (Crédito)",
  credit_hipercard: "Hipercard (Crédito)",
};

interface OrdersTabProps {
  restaurantId: string;
  restaurantName: string;
  onLoginPress: () => void;
}

export function OrdersTab({
  restaurantId,
  restaurantName,
  onLoginPress,
}: OrdersTabProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authed = isAuthenticated();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Order detail view
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Review state
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/?limit=20`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.results || data.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao buscar detalhes");
      const data: OrderDetail = await res.json();
      setSelectedOrder(data);
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSubmitReview = async () => {
    if (!selectedOrder || reviewRating === 0) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrder.id}/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) throw new Error("Erro ao enviar avaliação. Tente novamente.");
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Erro ao enviar avaliação."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const itemCount = (items: OrderItem[]) => {
    const total = items.reduce((s, i) => s + i.quantity, 0);
    return total === 1 ? "1 item" : `${total} itens`;
  };

  /* ══════════════ NOT LOGGED IN ══════════════ */
  if (!authed) {
    return (
      <div>
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] px-6 pt-10 pb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/10">
            <ClipboardList size={36} className="text-white" />
          </div>
          <h2 className="text-[20px] font-bold">Meus pedidos</h2>
          <p className="mt-1 text-[14px] text-white/80">
            Entre para acompanhar seus pedidos em tempo real
          </p>
          <button
            type="button"
            onClick={onLoginPress}
            className="mt-5 flex h-12 w-full max-w-sm mx-auto items-center justify-center gap-2 rounded-[12px] bg-white text-[15px] font-bold text-[#DC2626] transition-colors hover:bg-white/90"
          >
            <LogIn size={18} />
            Entrar com WhatsApp
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-6 px-4 space-y-3 max-w-2xl mx-auto">
          <p className="px-1 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Acompanhe tudo
          </p>
          {[
            {
              icon: Clock,
              title: "Status em tempo real",
              desc: "Saiba quando seu pedido está sendo preparado",
            },
            {
              icon: Star,
              title: "Avalie seus pedidos",
              desc: "Ajude a melhorar a experiência",
            },
            {
              icon: ShoppingBag,
              title: "Histórico completo",
              desc: "Veja todos os pedidos anteriores",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                <item.icon size={20} className="text-[#DC2626]" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {item.title}
                </p>
                <p className="text-[13px] text-[#6B7280]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ══════════════ ORDER DETAIL ══════════════ */
  if (selectedOrder) {
    const status = STATUS_CONFIG[selectedOrder.status] || {
      label: selectedOrder.status,
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: Package,
    };
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Back + title */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedOrder(null);
              setShowReview(false);
              setReviewSubmitted(false);
              setReviewRating(0);
              setReviewComment("");
              setReviewError(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#111827]" />
          </button>
          <h2 className="text-[18px] font-bold text-[#111827]">
            Pedido #{selectedOrder.id.slice(0, 6)}
          </h2>
        </div>

        {/* Status card */}
        <div className={`rounded-[16px] ${status.bg} p-4 mb-4`}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white`}
            >
              <status.icon size={20} className={status.text} />
            </div>
            <div>
              <p className={`text-[16px] font-bold ${status.text}`}>
                {status.label}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <p className="text-[14px] font-bold text-[#111827]">Itens</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {selectedOrder.items.map((item: OrderDetailItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[11px] font-bold text-[#6B7280]">
                    {item.quantity}x
                  </span>
                  <span className="text-[14px] text-[#111827]">
                    {item.productName}
                  </span>
                </div>
                <span className="text-[14px] font-medium text-[#6B7280] tabular-nums ml-3 shrink-0">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {selectedOrder.deliveryAddress && (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] shrink-0">
                <MapPin size={16} className="text-[#DC2626]" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#111827]">
                  {selectedOrder.deliveryAddress.street}
                  {selectedOrder.deliveryAddress.streetNumber
                    ? `, ${selectedOrder.deliveryAddress.streetNumber}`
                    : ""}
                </p>
                {selectedOrder.deliveryAddress.complement && (
                  <p className="text-[12px] text-[#6B7280]">
                    {selectedOrder.deliveryAddress.complement}
                  </p>
                )}
                <p className="text-[12px] text-[#6B7280]">
                  {selectedOrder.deliveryAddress.neighborhood}
                  {selectedOrder.deliveryAddress.city
                    ? ` - ${selectedOrder.deliveryAddress.city}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        {selectedOrder.paymentMethod && (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] shrink-0">
                <CreditCard size={16} className="text-[#DC2626]" />
              </div>
              <span className="text-[14px] font-medium text-[#111827]">
                {PAYMENT_LABELS[selectedOrder.paymentMethod] ||
                  selectedOrder.paymentMethod}
              </span>
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden mb-4 px-4 py-3 space-y-2">
          <p className="text-[14px] font-bold text-[#111827] mb-2">Resumo</p>
          <div className="flex justify-between text-[14px] text-[#6B7280]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(selectedOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] text-[#6B7280]">
            <span>Entrega</span>
            <span className="tabular-nums">
              {selectedOrder.deliveryFee > 0
                ? formatCurrency(selectedOrder.deliveryFee)
                : "Grátis"}
            </span>
          </div>
          <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-[16px] font-bold text-[#111827]">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(selectedOrder.total)}</span>
          </div>
        </div>

        {/* Review button */}
        {selectedOrder.status === "DELIVERED" && !showReview && !reviewSubmitted && (
          <button
            type="button"
            onClick={() => setShowReview(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] px-4 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C]"
          >
            <Star size={18} />
            Avaliar pedido
          </button>
        )}

        {/* Review form */}
        {showReview && !reviewSubmitted && (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden p-4 space-y-4">
            <p className="text-[16px] font-bold text-[#111827] text-center">
              Como foi seu pedido?
            </p>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      star <= reviewRating
                        ? "fill-[#FBBF24] text-[#FBBF24]"
                        : "text-[#D1D5DB]"
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Conte como foi sua experiência (opcional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] resize-none"
            />
            {reviewError && (
              <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                <p className="text-[13px] text-[#DC2626]">{reviewError}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || reviewSubmitting}
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45]"
            >
              {reviewSubmitting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        )}

        {/* Review done */}
        {reviewSubmitted && (
          <div className="rounded-[16px] bg-green-50 p-4 text-center">
            <Star size={24} className="mx-auto mb-2 fill-[#FBBF24] text-[#FBBF24]" />
            <p className="text-[14px] font-bold text-green-800">
              Avaliação enviada! Obrigado.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════ ORDER LIST ══════════════ */
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827]">Meus pedidos</h2>
          <p className="text-[13px] text-[#6B7280]">Seus pedidos mais recentes</p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
          aria-label="Atualizar pedidos"
        >
          <RefreshCw
            size={16}
            className={`text-[#6B7280] ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#DC2626] border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
            <ShoppingBag size={28} className="text-[#D1D5DB]" />
          </div>
          <p className="text-[16px] font-bold text-[#111827] mb-1">
            Nenhum pedido ainda
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Quando você fizer um pedido, ele aparecerá aqui.
          </p>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-3">
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status] || {
            label: order.status,
            bg: "bg-gray-50",
            text: "text-gray-700",
            icon: Package,
          };

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => fetchOrderDetail(order.id)}
              className="flex w-full items-center gap-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:bg-[#F9FAFB]"
            >
              {/* Status indicator */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${status.bg}`}
              >
                <status.icon size={20} className={status.text} />
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#111827]">
                    #{order.shortId || order.id.slice(0, 6)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">
                  {formatDate(order.createdAt)} · {itemCount(order.items)}
                </p>
              </div>

              {/* Price + arrow */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[15px] font-bold text-[#111827] tabular-nums">
                  {formatCurrency(order.total)}
                </span>
                <ChevronRight size={16} className="text-[#D1D5DB]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
