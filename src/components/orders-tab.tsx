"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { ClipboardList, ChevronDown, RefreshCw, LogIn } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Pendente", bg: "bg-yellow-100", text: "text-yellow-800" },
  CONFIRMED: { label: "Confirmado", bg: "bg-blue-100", text: "text-blue-800" },
  PREPARING: { label: "Preparando", bg: "bg-indigo-100", text: "text-indigo-800" },
  READY: { label: "Pronto", bg: "bg-purple-100", text: "text-purple-800" },
  OUT_FOR_DELIVERY: { label: "Saiu p/ entrega", bg: "bg-cyan-100", text: "text-cyan-800" },
  DELIVERED: { label: "Entregue", bg: "bg-green-100", text: "text-green-800" },
  CANCELLED: { label: "Cancelado", bg: "bg-red-100", text: "text-red-800" },
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/?limit=20`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.results || data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  /* Not logged in */
  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <ClipboardList size={48} className="mb-4 text-[#D1D5DB]" />
        <h2 className="mb-1 text-[16px] font-bold text-[#111827]">
          Meus pedidos
        </h2>
        <p className="mb-6 text-center text-[14px] text-[#6B7280]">
          Faça login para ver seus pedidos
        </p>
        <button
          type="button"
          onClick={onLoginPress}
          className="flex h-12 items-center gap-2 rounded-[12px] bg-[#DC2626] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C]"
        >
          <LogIn size={18} />
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#111827]">Meus pedidos</h2>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={`text-[#6B7280] ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#DC2626] border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <ClipboardList size={40} className="mb-3 text-[#D1D5DB]" />
          <p className="text-[14px] text-[#6B7280]">Nenhum pedido ainda</p>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status] || {
            label: order.status,
            bg: "bg-gray-100",
            text: "text-gray-800",
          };
          const isExpanded = expandedId === order.id;
          const date = new Date(order.createdAt);
          const formattedDate = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : order.id)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#F9FAFB]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#111827]">
                      #{order.shortId || order.id.slice(0, 6)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    {formattedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#111827]">
                    {formatCurrency(order.total)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#9CA3AF] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded items */}
              {isExpanded && order.items && (
                <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-1.5"
                    >
                      <div>
                        <span className="text-[13px] text-[#111827]">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.notes && (
                          <p className="text-[11px] text-[#6B7280]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-[13px] text-[#6B7280]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
