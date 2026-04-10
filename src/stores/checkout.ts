"use client";

import { create } from "zustand";
import type { UserAddress, FulfillmentMode, PaymentMethod, CartLine } from "@/lib/types";
import { FAST_DELIVERY_SURCHARGE } from "@/lib/constants";
import { apiFetch } from "@/lib/api";

interface CheckoutState {
  fulfillmentMode: FulfillmentMode;
  deliveryTier: "standard" | "fast";
  paymentMethod: PaymentMethod;
  cashChangeAmount: number | null;
  selectedAddressId: string;
  addresses: UserAddress[];
  loading: boolean;
  error: string | null;

  setFulfillmentMode: (mode: FulfillmentMode) => void;
  setDeliveryTier: (tier: "standard" | "fast") => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashChangeAmount: (amount: number | null) => void;
  setSelectedAddressId: (id: string) => void;
  fetchAddresses: (userId: string) => Promise<void>;
  addAddress: (userId: string, data: Omit<UserAddress, "id">) => Promise<UserAddress>;
  deleteAddress: (userId: string, addressId: string) => Promise<void>;
  submitOrder: (lines: CartLine[], restaurantId: string) => Promise<{ id: string }>;
  getDeliveryFee: (restaurantDeliveryFee: number) => number;
  reset: () => void;
}

const initialState = {
  fulfillmentMode: "delivery" as FulfillmentMode,
  deliveryTier: "standard" as "standard" | "fast",
  paymentMethod: "cash" as PaymentMethod,
  cashChangeAmount: null as number | null,
  selectedAddressId: "",
  addresses: [] as UserAddress[],
  loading: false,
  error: null as string | null,
};

export const useCheckoutStore = create<CheckoutState>()((set, get) => ({
  ...initialState,

  setFulfillmentMode: (mode) => set({ fulfillmentMode: mode }),
  setDeliveryTier: (tier) => set({ deliveryTier: tier }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashChangeAmount: (amount) => set({ cashChangeAmount: amount }),
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),

  getDeliveryFee: (restaurantDeliveryFee: number) => {
    const { fulfillmentMode, deliveryTier } = get();
    if (fulfillmentMode === "pickup") return 0;
    return deliveryTier === "fast"
      ? restaurantDeliveryFee + FAST_DELIVERY_SURCHARGE
      : restaurantDeliveryFee;
  },

  fetchAddresses: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<UserAddress[] | { results: UserAddress[] }>(
        `/users/${userId}/addresses/`
      );
      const addresses = Array.isArray(data) ? data : data.results || [];
      set({ addresses, loading: false });
      // Auto-select default address
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr && !get().selectedAddressId) {
        set({ selectedAddressId: defaultAddr.id });
      } else if (addresses.length > 0 && !get().selectedAddressId) {
        set({ selectedAddressId: addresses[0].id });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao buscar enderecos",
        loading: false,
      });
    }
  },

  addAddress: async (userId: string, data: Omit<UserAddress, "id">) => {
    set({ loading: true, error: null });
    try {
      const newAddr = await apiFetch<UserAddress>(
        `/users/${userId}/addresses/`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      set((s) => ({
        addresses: [...s.addresses, newAddr],
        selectedAddressId: newAddr.id,
        loading: false,
      }));
      return newAddr;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao salvar endereco",
        loading: false,
      });
      throw err;
    }
  },

  deleteAddress: async (userId: string, addressId: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/users/${userId}/addresses/${addressId}/`, {
        method: "DELETE",
      });
      set((s) => ({
        addresses: s.addresses.filter((a) => a.id !== addressId),
        selectedAddressId:
          s.selectedAddressId === addressId ? "" : s.selectedAddressId,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao remover endereco",
        loading: false,
      });
    }
  },

  submitOrder: async (lines: CartLine[], restaurantId: string) => {
    const { fulfillmentMode, deliveryTier, selectedAddressId, paymentMethod, cashChangeAmount } = get();
    set({ loading: true, error: null });
    try {
      // 1. Clear server cart
      await apiFetch("/cart/", { method: "DELETE" });

      // 2. Add each line to server cart
      for (const line of lines) {
        await apiFetch(`/cart/items/${line.productId}/`, {
          method: "POST",
          body: JSON.stringify({
            quantity: line.quantity,
            optionIds: line.selectedOptions.map((o) => o.id),
            customerNote: line.customerNote || undefined,
          }),
        });
      }

      // 3. Create order
      const orderBody: Record<string, unknown> = {
        restaurantId,
        paymentMethod,
        fulfillmentMode,
      };
      if (fulfillmentMode === "delivery") {
        orderBody.addressId = selectedAddressId;
        orderBody.deliveryTier = deliveryTier;
      }
      if (paymentMethod === "cash" && cashChangeAmount) {
        orderBody.cashChangeAmount = cashChangeAmount;
      }

      const order = await apiFetch<{ id: string }>("/orders/", {
        method: "POST",
        body: JSON.stringify(orderBody),
      });

      set({ loading: false });
      return order;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao enviar pedido",
        loading: false,
      });
      throw err;
    }
  },

  reset: () => set(initialState),
}));
