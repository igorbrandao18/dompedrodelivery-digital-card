import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "@/components/ui/form-input";

describe("FormInput", () => {
  it("renders label text", () => {
    render(<FormInput label="Nome completo" />);
    expect(screen.getByText("Nome completo")).toBeInTheDocument();
  });

  it("renders input with placeholder", () => {
    render(<FormInput label="Email" placeholder="Digite seu email" />);
    expect(screen.getByPlaceholderText("Digite seu email")).toBeInTheDocument();
  });

  it("calls onChange when typed", async () => {
    const handleChange = vi.fn();
    render(<FormInput label="Nome" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("passes maxLength to input", () => {
    render(<FormInput label="CEP" maxLength={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "8");
  });
});
