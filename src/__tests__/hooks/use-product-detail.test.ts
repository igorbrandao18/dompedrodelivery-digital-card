import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProductDetail } from "@/hooks/use-product-detail";
import type { MenuProduct, MenuOptionGroup } from "@/lib/types";

function makeProduct(overrides: Partial<MenuProduct> = {}): MenuProduct {
  return {
    id: "prod1",
    name: "X-Burger",
    description: "Delicious burger",
    price: 25,
    listPrice: null,
    servingCount: null,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [],
    ...overrides,
  };
}

function makeGroup(overrides: Partial<MenuOptionGroup> = {}): MenuOptionGroup {
  return {
    id: "g1",
    name: "Extras",
    minSelections: 0,
    maxSelections: 3,
    options: [
      { id: "o1", name: "Bacon", description: null, imageUrl: null, priceModifier: 3 },
      { id: "o2", name: "Cheddar", description: null, imageUrl: null, priceModifier: 2 },
      { id: "o3", name: "Egg", description: null, imageUrl: null, priceModifier: 1 },
    ],
    ...overrides,
  };
}

describe("useProductDetail", () => {
  // ---------- quantity ----------

  it("initial quantity is 1", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    expect(result.current.quantity).toBe(1);
  });

  it("incrementQty increases to 2", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    act(() => result.current.incrementQty());
    expect(result.current.quantity).toBe(2);
  });

  it("decrementQty does not go below 1", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    act(() => result.current.decrementQty());
    expect(result.current.quantity).toBe(1);
  });

  it("incrementQty caps at 99", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    // Set quantity to 99 by incrementing many times
    for (let i = 0; i < 100; i++) {
      act(() => result.current.incrementQty());
    }
    expect(result.current.quantity).toBe(99);
  });

  // ---------- toggleOption ----------

  it("toggleOption selects a single option", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));

    act(() => result.current.toggleOption("g1", "o1", true));
    expect(result.current.isSelected("g1", "o1")).toBe(true);
  });

  it("toggleOption deselects on re-toggle (multi)", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));

    act(() => result.current.toggleOption("g1", "o1", true));
    expect(result.current.isSelected("g1", "o1")).toBe(true);

    act(() => result.current.toggleOption("g1", "o1", true));
    expect(result.current.isSelected("g1", "o1")).toBe(false);
  });

  it("toggleOption in single mode replaces previous selection", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));

    act(() => result.current.toggleOption("g1", "o1", false));
    act(() => result.current.toggleOption("g1", "o2", false));

    expect(result.current.isSelected("g1", "o1")).toBe(false);
    expect(result.current.isSelected("g1", "o2")).toBe(true);
  });

  // ---------- canAdd ----------

  it("canAdd returns false when required group not selected", () => {
    const product = makeProduct({
      optionGroups: [makeGroup({ minSelections: 1 })],
    });
    const { result } = renderHook(() => useProductDetail(product));
    expect(result.current.canAdd).toBe(false);
  });

  it("canAdd returns true when requirements met", () => {
    const product = makeProduct({
      optionGroups: [makeGroup({ minSelections: 1 })],
    });
    const { result } = renderHook(() => useProductDetail(product));
    act(() => result.current.toggleOption("g1", "o1", true));
    expect(result.current.canAdd).toBe(true);
  });

  it("canAdd returns true when no option groups", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    expect(result.current.canAdd).toBe(true);
  });

  // ---------- lineTotal ----------

  it("lineTotal calculates correctly", () => {
    const product = makeProduct({
      price: 25,
      optionGroups: [makeGroup()],
    });
    const { result } = renderHook(() => useProductDetail(product));

    // Select bacon (+3) and cheddar (+2)
    act(() => result.current.toggleOption("g1", "o1", true));
    act(() => result.current.toggleOption("g1", "o2", true));
    // Increase qty to 2
    act(() => result.current.incrementQty());

    // (25 + 3 + 2) * 2 = 60
    expect(result.current.lineTotal).toBe(60);
  });

  // ---------- groupSubtitle ----------

  it("groupSubtitle: min=0, max=1 returns 'Opcional'", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));
    const group = { ...makeGroup(), minSelections: 0, maxSelections: 1 };
    expect(result.current.groupSubtitle(group)).toBe("Opcional");
  });

  it("groupSubtitle: min=0, max=3 returns 'Escolha ate 3 opcoes'", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));
    const group = { ...makeGroup(), minSelections: 0, maxSelections: 3 };
    expect(result.current.groupSubtitle(group)).toBe("Escolha até 3 opções");
  });

  it("groupSubtitle: min=1, max=1 returns 'Escolha 1 opcao'", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));
    const group = { ...makeGroup(), minSelections: 1, maxSelections: 1 };
    expect(result.current.groupSubtitle(group)).toBe("Escolha 1 opção");
  });

  it("groupSubtitle: min=2, max=2 returns 'Escolha 2 opcoes'", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));
    const group = { ...makeGroup(), minSelections: 2, maxSelections: 2 };
    expect(result.current.groupSubtitle(group)).toBe("Escolha 2 opções");
  });

  it("groupSubtitle: min=1, max=3 returns 'Escolha de 1 a 3 opcoes'", () => {
    const product = makeProduct({ optionGroups: [makeGroup()] });
    const { result } = renderHook(() => useProductDetail(product));
    const group = { ...makeGroup(), minSelections: 1, maxSelections: 3 };
    expect(result.current.groupSubtitle(group)).toBe("Escolha de 1 a 3 opções");
  });

  // ---------- customerNote ----------

  it("customerNote caps at 500 chars", () => {
    const { result } = renderHook(() => useProductDetail(makeProduct()));
    const longNote = "a".repeat(600);
    act(() => result.current.setCustomerNote(longNote));
    expect(result.current.customerNote.length).toBe(500);
  });
});
