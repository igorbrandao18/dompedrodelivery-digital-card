import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCheckoutStore } from "@/stores/checkout";
import type { CartLine, MenuOption } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function mockFetchSequence(responses: Array<{ body: unknown; status?: number }>) {
  let callIndex = 0;
  globalThis.fetch = vi.fn().mockImplementation(() => {
    const resp = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    const status = resp.status ?? 200;
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(resp.body),
    });
  });
}

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: "line-1",
    restaurantId: "rest-1",
    restaurantName: "Restaurant",
    productId: "prod-1",
    name: "Burger",
    unitPrice: 20,
    quantity: 1,
    selectedOptions: [] as MenuOption[],
    optionsSummary: "",
    customerNote: "",
    ...overrides,
  };
}

describe("Checkout Flow (E2E)", () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("sets fulfillment mode", () => {
    useCheckoutStore.getState().setFulfillmentMode("pickup");
    expect(useCheckoutStore.getState().fulfillmentMode).toBe("pickup");
  });

  it("sets delivery tier", () => {
    useCheckoutStore.getState().setDeliveryTier("fast");
    expect(useCheckoutStore.getState().deliveryTier).toBe("fast");
  });

  it("sets payment method", () => {
    useCheckoutStore.getState().setPaymentMethod("credit_visa");
    expect(useCheckoutStore.getState().paymentMethod).toBe("credit_visa");
  });

  it("getDeliveryFee returns 0 for pickup", () => {
    useCheckoutStore.getState().setFulfillmentMode("pickup");
    expect(useCheckoutStore.getState().getDeliveryFee(5.99)).toBe(0);
  });

  it("getDeliveryFee returns restaurant fee for standard delivery", () => {
    useCheckoutStore.getState().setFulfillmentMode("delivery");
    useCheckoutStore.getState().setDeliveryTier("standard");
    expect(useCheckoutStore.getState().getDeliveryFee(5.99)).toBe(5.99);
  });

  it("getDeliveryFee returns restaurant fee + surcharge for fast delivery", () => {
    useCheckoutStore.getState().setFulfillmentMode("delivery");
    useCheckoutStore.getState().setDeliveryTier("fast");
    expect(useCheckoutStore.getState().getDeliveryFee(5.99)).toBe(5.99 + 3.0);
  });

  it("submitOrder calls DELETE /cart, POST items, POST /orders in sequence", async () => {
    const lines = [
      makeLine({ lineId: "l1", productId: "prod-1", quantity: 2 }),
      makeLine({ lineId: "l2", productId: "prod-2", quantity: 1 }),
    ];

    mockFetchSequence([
      { body: undefined, status: 204 }, // DELETE /cart
      { body: {} },                      // POST /cart/items/prod-1
      { body: {} },                      // POST /cart/items/prod-2
      { body: { id: "order-123" } },     // POST /orders
    ]);

    useCheckoutStore.getState().setFulfillmentMode("delivery");
    useCheckoutStore.getState().setDeliveryTier("standard");
    useCheckoutStore.getState().setPaymentMethod("cash");
    useCheckoutStore.getState().setSelectedAddressId("addr-1");

    const result = await useCheckoutStore.getState().submitOrder(lines, "rest-1");

    expect(result).toEqual({ id: "order-123" });

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(4);

    // 1. DELETE /cart
    expect(calls[0][0]).toBe(`${API_URL}/cart`);
    expect(calls[0][1]).toMatchObject({ method: "DELETE" });

    // 2. POST /cart/items/prod-1
    expect(calls[1][0]).toBe(`${API_URL}/cart/items/prod-1`);
    expect(calls[1][1]).toMatchObject({ method: "POST" });

    // 3. POST /cart/items/prod-2
    expect(calls[2][0]).toBe(`${API_URL}/cart/items/prod-2`);
    expect(calls[2][1]).toMatchObject({ method: "POST" });

    // 4. POST /orders
    expect(calls[3][0]).toBe(`${API_URL}/orders`);
    expect(calls[3][1]).toMatchObject({ method: "POST" });

    const orderBody = JSON.parse(calls[3][1].body);
    expect(orderBody).toMatchObject({
      restaurantId: "rest-1",
      paymentMethod: "cash",
      fulfillmentMode: "delivery",
      addressId: "addr-1",
      deliveryTier: "standard",
    });
  });

  it("submitOrder includes cashChangeAmount when paying with cash", async () => {
    const lines = [makeLine()];

    mockFetchSequence([
      { body: undefined, status: 204 },
      { body: {} },
      { body: { id: "order-456" } },
    ]);

    useCheckoutStore.getState().setPaymentMethod("cash");
    useCheckoutStore.getState().setCashChangeAmount(50);
    useCheckoutStore.getState().setSelectedAddressId("addr-1");

    await useCheckoutStore.getState().submitOrder(lines, "rest-1");

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const orderBody = JSON.parse(calls[2][1].body);
    expect(orderBody.cashChangeAmount).toBe(50);
  });

  it("reset clears all state", () => {
    useCheckoutStore.getState().setFulfillmentMode("pickup");
    useCheckoutStore.getState().setDeliveryTier("fast");
    useCheckoutStore.getState().setPaymentMethod("credit_visa");
    useCheckoutStore.getState().setCashChangeAmount(100);
    useCheckoutStore.getState().setSelectedAddressId("addr-99");

    useCheckoutStore.getState().reset();

    const state = useCheckoutStore.getState();
    expect(state.fulfillmentMode).toBe("delivery");
    expect(state.deliveryTier).toBe("standard");
    expect(state.paymentMethod).toBe("cash");
    expect(state.cashChangeAmount).toBeNull();
    expect(state.selectedAddressId).toBe("");
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});
