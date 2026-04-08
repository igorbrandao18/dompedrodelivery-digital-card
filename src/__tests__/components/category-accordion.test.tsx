import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryAccordion } from "@/components/category-accordion";
import type { MenuCategory, MenuProduct } from "@/lib/types";
import React from "react";

function makeProduct(overrides: Partial<MenuProduct> = {}): MenuProduct {
  return {
    id: "prod-1",
    name: "X-Burger",
    description: "Delicious burger",
    price: 25.9,
    listPrice: null,
    servingCount: null,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [],
    ...overrides,
  };
}

function makeCategory(overrides: Partial<MenuCategory> = {}): MenuCategory {
  return {
    id: "cat-1",
    name: "Lanches",
    sortOrder: 0,
    products: [makeProduct()],
    ...overrides,
  };
}

function renderAccordion({
  categories = [makeCategory()],
  expandedIds = new Set<string>(),
  onToggle = vi.fn(),
  onProductPress = vi.fn(),
}: {
  categories?: MenuCategory[];
  expandedIds?: Set<string>;
  onToggle?: (id: string) => void;
  onProductPress?: (product: MenuProduct) => void;
} = {}) {
  const categoryRefs = { current: {} } as React.MutableRefObject<
    Record<string, HTMLDivElement | null>
  >;
  return render(
    <CategoryAccordion
      categories={categories}
      expandedIds={expandedIds}
      onToggle={onToggle}
      onProductPress={onProductPress}
      categoryRefs={categoryRefs}
    />
  );
}

describe("CategoryAccordion", () => {
  it("renders category names", () => {
    renderAccordion({
      categories: [
        makeCategory({ id: "1", name: "Lanches" }),
        makeCategory({ id: "2", name: "Bebidas" }),
      ],
    });
    expect(screen.getByText("Lanches")).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
  });

  it("shows item count", () => {
    renderAccordion({
      categories: [
        makeCategory({
          products: [
            makeProduct({ id: "1" }),
            makeProduct({ id: "2", name: "Pizza" }),
          ],
        }),
      ],
    });
    expect(screen.getByText("2 itens")).toBeInTheDocument();
  });

  it("expands category on click", () => {
    const onToggle = vi.fn();
    renderAccordion({ onToggle });
    fireEvent.click(screen.getByText("Lanches"));
    expect(onToggle).toHaveBeenCalledWith("cat-1");
  });

  it("shows products when expanded", () => {
    renderAccordion({ expandedIds: new Set(["cat-1"]) });
    expect(screen.getByText("X-Burger")).toBeInTheDocument();
  });

  it("collapses on second click", () => {
    const onToggle = vi.fn();
    renderAccordion({ expandedIds: new Set(["cat-1"]), onToggle });
    fireEvent.click(screen.getByText("Lanches"));
    expect(onToggle).toHaveBeenCalledWith("cat-1");
  });

  it("calls onProductPress when product clicked", () => {
    const onProductPress = vi.fn();
    const product = makeProduct();
    renderAccordion({
      categories: [makeCategory({ products: [product] })],
      expandedIds: new Set(["cat-1"]),
      onProductPress,
    });
    fireEvent.click(screen.getByText("X-Burger"));
    expect(onProductPress).toHaveBeenCalledWith(product);
  });
});
