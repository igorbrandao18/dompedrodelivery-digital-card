import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/search-bar";

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Buscar no cardápio")
    ).toBeInTheDocument();
  });

  it("calls onChange when typed", async () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Buscar no cardápio");
    await userEvent.type(input, "pizza");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows clear button when has value", () => {
    const { container } = render(
      <SearchBar value="pizza" onChange={vi.fn()} />
    );
    const clearButton = container.querySelector("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears value when X clicked", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <SearchBar value="pizza" onChange={handleChange} />
    );
    const clearButton = container.querySelector("button")!;
    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("hides clear button when empty", () => {
    const { container } = render(
      <SearchBar value="" onChange={vi.fn()} />
    );
    const clearButton = container.querySelector("button");
    expect(clearButton).not.toBeInTheDocument();
  });
});
