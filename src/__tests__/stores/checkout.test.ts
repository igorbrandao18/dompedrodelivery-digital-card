import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiFetch before importing the store
vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

import { useCheckoutStore } from "@/stores/checkout";
import { apiFetch } from "@/lib/api";

const mockedApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("useCheckoutStore", () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset();
    vi.clearAllMocks();
  });

  it("has initial state with fulfillmentMode set to 'delivery'", () => {
    const state = useCheckoutStore.getState();
    expect(state.fulfillmentMode).toBe("delivery");
    expect(state.deliveryTier).toBe("standard");
    expect(state.paymentMethod).toBe("cash");
    expect(state.selectedAddressId).toBe("");
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("setFulfillmentMode changes the mode", () => {
    useCheckoutStore.getState().setFulfillmentMode("pickup");
    expect(useCheckoutStore.getState().fulfillmentMode).toBe("pickup");
  });

  it("setDeliveryTier changes the tier", () => {
    useCheckoutStore.getState().setDeliveryTier("fast");
    expect(useCheckoutStore.getState().deliveryTier).toBe("fast");
  });

  it("setPaymentMethod changes the method", () => {
    useCheckoutStore.getState().setPaymentMethod("credit_visa");
    expect(useCheckoutStore.getState().paymentMethod).toBe("credit_visa");
  });

  it("setSelectedAddressId changes the address", () => {
    useCheckoutStore.getState().setSelectedAddressId("addr-123");
    expect(useCheckoutStore.getState().selectedAddressId).toBe("addr-123");
  });

  it("reset clears all state back to initial values", () => {
    const store = useCheckoutStore.getState();
    store.setFulfillmentMode("pickup");
    store.setDeliveryTier("fast");
    store.setPaymentMethod("credit_visa");
    store.setSelectedAddressId("addr-123");

    store.reset();

    const state = useCheckoutStore.getState();
    expect(state.fulfillmentMode).toBe("delivery");
    expect(state.deliveryTier).toBe("standard");
    expect(state.paymentMethod).toBe("cash");
    expect(state.selectedAddressId).toBe("");
  });

  it("submitOrder calls DELETE cart, POST items, then POST order", async () => {
    mockedApiFetch.mockResolvedValue({ id: "order-1" });

    const lines = [
      {
        lineId: "l1",
        restaurantId: "r1",
        restaurantName: "Test",
        productId: "p1",
        name: "Burger",
        unitPrice: 20,
        quantity: 2,
        selectedOptions: [{ id: "opt1", name: "Extra cheese", priceModifier: 2 }],
        optionsSummary: "Extra cheese",
        customerNote: "No onions",
      },
      {
        lineId: "l2",
        restaurantId: "r1",
        restaurantName: "Test",
        productId: "p2",
        name: "Fries",
        unitPrice: 10,
        quantity: 1,
        selectedOptions: [],
        optionsSummary: "",
        customerNote: "",
      },
    ];

    const result = await useCheckoutStore.getState().submitOrder(lines, "r1");

    expect(result).toEqual({ id: "order-1" });

    // 1st call: DELETE /cart
    expect(mockedApiFetch).toHaveBeenNthCalledWith(1, "/cart", {
      method: "DELETE",
    });

    // 2nd call: POST first item
    expect(mockedApiFetch).toHaveBeenNthCalledWith(2, "/cart/items/p1", {
      method: "POST",
      body: JSON.stringify({
        quantity: 2,
        optionIds: ["opt1"],
        customerNote: "No onions",
      }),
    });

    // 3rd call: POST second item
    expect(mockedApiFetch).toHaveBeenNthCalledWith(3, "/cart/items/p2", {
      method: "POST",
      body: JSON.stringify({
        quantity: 1,
        optionIds: [],
      }),
    });

    // 4th call: POST /orders
    expect(mockedApiFetch).toHaveBeenNthCalledWith(4, "/orders", {
      method: "POST",
      body: expect.stringContaining('"restaurantId":"r1"'),
    });

    expect(useCheckoutStore.getState().loading).toBe(false);
  });
});
