"use client";

import { create } from "zustand";
import type { UserAddress, FulfillmentMode, PaymentMethod, CartLine } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface CheckoutState {
  fulfillmentMode: FulfillmentMode;
  paymentMethod: PaymentMethod;
  cashChangeAmount: number | null;
  selectedAddressId: string;
  addresses: UserAddress[];
  loading: boolean;
  error: string | null;

  setFulfillmentMode: (mode: FulfillmentMode) => void;
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
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashChangeAmount: (amount) => set({ cashChangeAmount: amount }),
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),

  getDeliveryFee: (restaurantDeliveryFee: number) => {
    const { fulfillmentMode } = get();
    if (fulfillmentMode === "pickup") return 0;
    return restaurantDeliveryFee || 0;
  },

  fetchAddresses: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<UserAddress[] | { results: UserAddress[] }>(
        `/users/${userId}/addresses/`
      );
      const addresses = Array.isArray(data) ? data : data.results || [];
      set({ addresses, loading: false });
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr && !get().selectedAddressId) {
        set({ selectedAddressId: defaultAddr.id });
      } else if (addresses.length > 0 && !get().selectedAddressId) {
        set({ selectedAddressId: addresses[0].id });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao buscar endereços",
        loading: false,
      });
    }
  },

  addAddress: async (userId: string, data: Omit<UserAddress, "id">) => {
    set({ loading: true, error: null });
    try {
      const newAddr = await apiFetch<UserAddress>(
        `/users/${userId}/addresses/`,
        { method: "POST", body: JSON.stringify(data) }
      );
      set((s) => ({
        addresses: [...s.addresses, newAddr],
        selectedAddressId: newAddr.id,
        loading: false,
      }));
      return newAddr;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro ao salvar endereço",
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
        error: err instanceof Error ? err.message : "Erro ao remover endereço",
        loading: false,
      });
    }
  },

  submitOrder: async (lines: CartLine[], restaurantId: string) => {
    const { fulfillmentMode, selectedAddressId, paymentMethod, cashChangeAmount } = get();
    set({ loading: true, error: null });
    try {
      // 1. Popula o server cart primeiro (antes de deletar, pra não ficar inconsistente)
      await apiFetch("/cart/", { method: "DELETE" });

      const addedItems: string[] = [];
      for (const line of lines) {
        try {
          await apiFetch(`/cart/items/${line.productId}/`, {
            method: "POST",
            body: JSON.stringify({
              quantity: line.quantity,
              optionIds: line.selectedOptions.map((o) => o.id),
              customerNote: line.customerNote || undefined,
            }),
          });
          addedItems.push(line.productId);
        } catch (itemErr) {
          // Se falhar ao adicionar item, limpa o que já adicionou e aborta
          if (addedItems.length > 0) {
            await apiFetch("/cart/", { method: "DELETE" }).catch(() => {});
          }
          throw itemErr;
        }
      }

      // 2. Cria o pedido (só se TODOS items foram adicionados)
      const orderBody: Record<string, unknown> = {
        restaurantId,
        paymentMethod,
        fulfillmentMode,
      };
      if (fulfillmentMode === "delivery") {
        orderBody.addressId = selectedAddressId;
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
