import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrimaryButton } from "@/components/ui/primary-button";

describe("PrimaryButton", () => {
  it("renders children text", () => {
    render(<PrimaryButton>Enviar</PrimaryButton>);
    expect(screen.getByText("Enviar")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<PrimaryButton onClick={handleClick}>Click me</PrimaryButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("shows spinner when loading", () => {
    const { container } = render(
      <PrimaryButton loading>Enviar</PrimaryButton>
    );
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText("Enviar")).not.toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<PrimaryButton loading>Enviar</PrimaryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop passed", () => {
    render(<PrimaryButton disabled>Enviar</PrimaryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
