import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomTabs } from "@/components/bottom-tabs";

describe("BottomTabs", () => {
  const defaultProps = {
    activeTab: "cardapio",
    onTabChange: vi.fn(),
    cartCount: 0,
  };

  it("renders 3 tabs (Cardapio, Pedidos, Perfil)", () => {
    render(<BottomTabs {...defaultProps} />);
    expect(screen.getByText("Cardápio")).toBeInTheDocument();
    expect(screen.getByText("Pedidos")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("highlights active tab", () => {
    render(<BottomTabs {...defaultProps} activeTab="pedidos" />);
    const pedidosLabel = screen.getByText("Pedidos");
    expect(pedidosLabel.className).toContain("font-bold");
    const cardapioLabel = screen.getByText("Cardápio");
    expect(cardapioLabel.className).not.toContain("font-bold");
  });

  it("calls onTabChange when clicked", () => {
    const onTabChange = vi.fn();
    render(<BottomTabs {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Pedidos"));
    expect(onTabChange).toHaveBeenCalledWith("pedidos");
  });

  it("shows cart badge when cartCount > 0", () => {
    render(<BottomTabs {...defaultProps} cartCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hides badge when cartCount = 0", () => {
    render(<BottomTabs {...defaultProps} cartCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
