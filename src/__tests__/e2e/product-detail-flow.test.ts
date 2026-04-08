import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProductDetail } from "@/hooks/use-product-detail";
import type { MenuProduct, MenuOptionGroup } from "@/lib/types";

function makeProduct(overrides: Partial<MenuProduct> = {}): MenuProduct {
  return {
    id: "prod-1",
    name: "X-Burguer Especial",
    description: "Delicious burger",
    price: 30,
    listPrice: null,
    servingCount: null,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [],
    ...overrides,
  };
}

const sizeGroup: MenuOptionGroup = {
  id: "group-size",
  name: "Tamanho",
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "size-p", name: "Pequeno", description: null, imageUrl: null, priceModifier: 0 },
    { id: "size-m", name: "Medio", description: null, imageUrl: null, priceModifier: 5 },
    { id: "size-g", name: "Grande", description: null, imageUrl: null, priceModifier: 10 },
  ],
};

const extrasGroup: MenuOptionGroup = {
  id: "group-extras",
  name: "Adicionais",
  minSelections: 0,
  maxSelections: 3,
  options: [
    { id: "extra-bacon", name: "Bacon", description: null, imageUrl: null, priceModifier: 4 },
    { id: "extra-cheese", name: "Queijo Extra", description: null, imageUrl: null, priceModifier: 3 },
    { id: "extra-egg", name: "Ovo", description: null, imageUrl: null, priceModifier: 2 },
    { id: "extra-onion", name: "Cebola Crispy", description: null, imageUrl: null, priceModifier: 2 },
  ],
};

const complexProduct = makeProduct({
  price: 30,
  optionGroups: [sizeGroup, extrasGroup],
});

describe("Product Detail Flow (E2E)", () => {
  it("canAdd is false when required option group is not selected", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));
    expect(result.current.canAdd).toBe(false);
  });

  it("canAdd becomes true after selecting required option", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.toggleOption("group-size", "size-p", false);
    });

    expect(result.current.canAdd).toBe(true);
  });

  it("canAdd is true with no required groups", () => {
    const noRequiredProduct = makeProduct({
      optionGroups: [extrasGroup], // minSelections = 0
    });
    const { result } = renderHook(() => useProductDetail(noRequiredProduct));
    expect(result.current.canAdd).toBe(true);
  });

  it("lineTotal updates when selecting options with price modifiers", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    // Base price = 30, qty = 1
    expect(result.current.lineTotal).toBe(30);

    act(() => {
      result.current.toggleOption("group-size", "size-m", false); // +5
    });
    expect(result.current.lineTotal).toBe(35);

    act(() => {
      result.current.toggleOption("group-extras", "extra-bacon", true); // +4
    });
    expect(result.current.lineTotal).toBe(39);

    act(() => {
      result.current.toggleOption("group-extras", "extra-cheese", true); // +3
    });
    expect(result.current.lineTotal).toBe(42);
  });

  it("lineTotal decreases when deselecting an option", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.toggleOption("group-extras", "extra-bacon", true); // +4
    });
    expect(result.current.lineTotal).toBe(34);

    act(() => {
      result.current.toggleOption("group-extras", "extra-bacon", true); // toggle off
    });
    expect(result.current.lineTotal).toBe(30);
  });

  it("switching single-select option replaces previous selection", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.toggleOption("group-size", "size-g", false); // +10
    });
    expect(result.current.lineTotal).toBe(40);

    act(() => {
      result.current.toggleOption("group-size", "size-p", false); // +0 (replaces size-g)
    });
    expect(result.current.lineTotal).toBe(30);
    expect(result.current.isSelected("group-size", "size-g")).toBe(false);
    expect(result.current.isSelected("group-size", "size-p")).toBe(true);
  });

  it("incrementQty scales lineTotal", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.toggleOption("group-size", "size-m", false); // +5
    });
    // unitTotal = 35, qty = 1 => lineTotal = 35
    expect(result.current.lineTotal).toBe(35);

    act(() => {
      result.current.incrementQty(); // qty = 2
    });
    expect(result.current.lineTotal).toBe(70);

    act(() => {
      result.current.incrementQty(); // qty = 3
    });
    expect(result.current.lineTotal).toBe(105);
  });

  it("decrementQty does not go below 1", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.decrementQty();
    });
    expect(result.current.quantity).toBe(1);
    expect(result.current.lineTotal).toBe(30);
  });

  it("customer note is capped at 500 characters", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    const longNote = "A".repeat(600);
    act(() => {
      result.current.setCustomerNote(longNote);
    });
    expect(result.current.customerNote).toHaveLength(500);
  });

  it("customer note accepts normal text", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.setCustomerNote("Sem cebola, por favor");
    });
    expect(result.current.customerNote).toBe("Sem cebola, por favor");
  });

  it("enforces maxSelections on multi-select group", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    // extrasGroup maxSelections = 3
    act(() => {
      result.current.toggleOption("group-extras", "extra-bacon", true);
      result.current.toggleOption("group-extras", "extra-cheese", true);
      result.current.toggleOption("group-extras", "extra-egg", true);
    });

    // Adding a 4th should remove the oldest
    act(() => {
      result.current.toggleOption("group-extras", "extra-onion", true);
    });

    expect(result.current.isSelected("group-extras", "extra-onion")).toBe(true);
    // Should have exactly 3 extras selected
    const selectedExtras = result.current.allSelectedOptions.filter(
      (o) => o.id.startsWith("extra-")
    );
    expect(selectedExtras).toHaveLength(3);
  });

  it("allSelectedOptions lists all selected options across groups", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    act(() => {
      result.current.toggleOption("group-size", "size-m", false);
      result.current.toggleOption("group-extras", "extra-bacon", true);
    });

    expect(result.current.allSelectedOptions).toHaveLength(2);
    expect(result.current.allSelectedOptions.map((o) => o.id)).toEqual(
      expect.arrayContaining(["size-m", "extra-bacon"])
    );
  });

  it("groupSubtitle returns correct labels", () => {
    const { result } = renderHook(() => useProductDetail(complexProduct));

    expect(result.current.groupSubtitle(sizeGroup)).toBe("Escolha 1 opção");
    expect(result.current.groupSubtitle(extrasGroup)).toBe("Escolha até 3 opções");
  });
});
