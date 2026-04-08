"use client";

import { RefreshCw, ShoppingBag } from "lucide-react";
import { OrderCard } from "./order-card";

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

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onSelectOrder: (orderId: string) => void;
}

export function OrderList({
  orders,
  loading,
  onRefresh,
  onSelectOrder,
}: OrderListProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827]">
            Meus pedidos
          </h2>
          <p className="text-[13px] text-[#6B7280]">
            Seus pedidos mais recentes
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
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
            Quando voce fizer um pedido, ele aparecera aqui.
          </p>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            shortId={order.shortId}
            status={order.status}
            total={order.total}
            createdAt={order.createdAt}
            items={order.items}
            onPress={() => onSelectOrder(order.id)}
          />
        ))}
      </div>
    </div>
  );
}
