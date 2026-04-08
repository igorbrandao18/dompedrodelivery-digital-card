import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/cart";
import type { MenuOption } from "@/lib/types";

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    restaurantId: "r1",
    restaurantName: "Dom Pedro",
    productId: "p1",
    name: "X-Burger",
    unitPrice: 20,
    quantity: 1,
    selectedOptions: [] as MenuOption[],
    optionsSummary: "",
    customerNote: "",
    ...overrides,
  };
}

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
  });

  // ---------- addItem ----------

  it("addItem: adds item, generates lineId, and sets restaurantId", () => {
    useCartStore.getState().addItem(makeItem());
    const lines = useCartStore.getState().lines;

    expect(lines).toHaveLength(1);
    expect(lines[0].lineId).toBeDefined();
    expect(lines[0].lineId.length).toBeGreaterThan(0);
    expect(lines[0].restaurantId).toBe("r1");
    expect(lines[0].name).toBe("X-Burger");
  });

  it("addItem: clears cart if adding from a different restaurant", () => {
    useCartStore.getState().addItem(makeItem({ restaurantId: "r1", productId: "p1" }));
    expect(useCartStore.getState().lines).toHaveLength(1);

    useCartStore.getState().addItem(makeItem({ restaurantId: "r2", productId: "p2" }));
    const lines = useCartStore.getState().lines;

    expect(lines).toHaveLength(1);
    expect(lines[0].restaurantId).toBe("r2");
  });

  it("addItem: caps quantity at 99", () => {
    useCartStore.getState().addItem(makeItem({ quantity: 150 }));
    expect(useCartStore.getState().lines[0].quantity).toBe(99);
  });

  it("addItem: merges quantity when same product + options already exist", () => {
    useCartStore.getState().addItem(makeItem({ quantity: 50 }));
    useCartStore.getState().addItem(makeItem({ quantity: 60 }));
    const lines = useCartStore.getState().lines;

    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(99); // capped
  });

  // ---------- setQuantity ----------

  it("setQuantity: changes quantity of a line", () => {
    useCartStore.getState().addItem(makeItem());
    const lineId = useCartStore.getState().lines[0].lineId;

    useCartStore.getState().setQuantity(lineId, 5);
    expect(useCartStore.getState().lines[0].quantity).toBe(5);
  });

  it("setQuantity: removes item when qty is 0", () => {
    useCartStore.getState().addItem(makeItem());
    const lineId = useCartStore.getState().lines[0].lineId;

    useCartStore.getState().setQuantity(lineId, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("setQuantity: caps at 99", () => {
    useCartStore.getState().addItem(makeItem());
    const lineId = useCartStore.getState().lines[0].lineId;

    useCartStore.getState().setQuantity(lineId, 200);
    expect(useCartStore.getState().lines[0].quantity).toBe(99);
  });

  // ---------- removeLine ----------

  it("removeLine: removes specific line", () => {
    useCartStore.getState().addItem(makeItem({ productId: "p1" }));
    useCartStore.getState().addItem(makeItem({ productId: "p2" }));
    expect(useCartStore.getState().lines).toHaveLength(2);

    const lineId = useCartStore.getState().lines[0].lineId;
    useCartStore.getState().removeLine(lineId);

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].productId).toBe("p2");
  });

  // ---------- clearAll ----------

  it("clearAll: empties the cart", () => {
    useCartStore.getState().addItem(makeItem());
    useCartStore.getState().addItem(makeItem({ productId: "p2" }));
    expect(useCartStore.getState().lines.length).toBeGreaterThan(0);

    useCartStore.getState().clearAll();
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  // ---------- getSubtotal ----------

  it("getSubtotal: calculates correctly with options", () => {
    const options: MenuOption[] = [
      { id: "o1", name: "Bacon", description: null, imageUrl: null, priceModifier: 3 },
      { id: "o2", name: "Cheddar", description: null, imageUrl: null, priceModifier: 2 },
    ];
    useCartStore.getState().addItem(
      makeItem({ unitPrice: 20, quantity: 2, selectedOptions: options, optionsSummary: "Bacon, Cheddar" })
    );
    // (20 + 3 + 2) * 2 = 50
    expect(useCartStore.getState().getSubtotal()).toBe(50);
  });

  // ---------- getItemCount ----------

  it("getItemCount: sums quantities across lines", () => {
    useCartStore.getState().addItem(makeItem({ productId: "p1", quantity: 3 }));
    useCartStore.getState().addItem(makeItem({ productId: "p2", quantity: 5 }));
    expect(useCartStore.getState().getItemCount()).toBe(8);
  });
});
