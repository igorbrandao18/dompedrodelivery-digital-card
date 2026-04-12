"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Restaurant, MenuCategory } from "@/lib/types";

interface UseRestaurantResult {
  restaurant: Restaurant | null;
  categories: MenuCategory[];
  loading: boolean;
  error: string;
  refresh: () => void;
}

export function useRestaurant(slug: string): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      // Fetch restaurant first (need the id for menu endpoint)
      const resto = await apiFetch<Restaurant>(
        `/restaurants/by-slug/${slug}/`
      );
      // "Aberto" = toggle manual (isAcceptingOrders) + horário (isOpenNow)
      resto.isAcceptingOrders = resto.isAcceptingOrders && resto.isOpenNow !== false;
      setRestaurant(resto);

      // Menu can load in parallel with setting restaurant state
      const menu = await apiFetch<{ categories: MenuCategory[] }>(
        `/restaurants/${resto.id}/menu/`
      );
      setCategories(menu.categories || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("404") || msg.includes("não encontrado")) {
        setError("Restaurante não encontrado. Verifique o endereço.");
      } else if (msg.includes("timeout") || msg.includes("network")) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        setError("Não foi possível carregar o restaurante. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { restaurant, categories, loading, error, refresh: load };
}
