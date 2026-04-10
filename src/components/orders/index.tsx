"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { apiFetch } from "@/lib/api";
import type { OrderDetail as OrderDetailType } from "@/lib/types";
import { OrdersLoginPrompt } from "./orders-login-prompt";
import { OrderList } from "./order-list";
import { OrderDetail } from "./order-detail";

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
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailType | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Order[] | { results?: Order[]; items?: Order[] }>(
        "/orders/?limit=20"
      );
      const list = Array.isArray(data)
        ? data
        : (data as { results?: Order[]; items?: Order[] }).results ||
          (data as { results?: Order[]; items?: Order[] }).items ||
          [];
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    try {
      const data = await apiFetch<OrderDetailType>(`/orders/${orderId}/`);
      setSelectedOrder(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  if (!authed) {
    return <OrdersLoginPrompt onLoginPress={onLoginPress} />;
  }

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <OrderList
      orders={orders}
      loading={loading}
      onSelectOrder={fetchOrderDetail}
    />
  );
}
