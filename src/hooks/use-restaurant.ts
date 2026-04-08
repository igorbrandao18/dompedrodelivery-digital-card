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
      const resto = await apiFetch<Restaurant>(
        `/restaurants/by-slug/${slug}/`
      );
      setRestaurant(resto);

      const menu = await apiFetch<{ categories: MenuCategory[] }>(
        `/restaurants/${resto.id}/menu/`
      );
      setCategories(menu.categories || []);
    } catch {
      setError("Restaurante não encontrado");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { restaurant, categories, loading, error, refresh: load };
}
