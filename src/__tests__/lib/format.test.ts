import { describe, it, expect } from "vitest";
import { formatCurrency, lineTotal } from "@/lib/format";

describe("formatCurrency", () => {
  it('formats 10 as "R$ 10,00"', () => {
    expect(formatCurrency(10)).toBe("R$\u00a010,00");
  });

  it('formats 0 as "R$ 0,00"', () => {
    expect(formatCurrency(0)).toBe("R$\u00a00,00");
  });

  it("handles undefined/NaN/null without crashing", () => {
    expect(() => formatCurrency(undefined as unknown as number)).not.toThrow();
    expect(() => formatCurrency(NaN)).not.toThrow();
    expect(() => formatCurrency(null as unknown as number)).not.toThrow();
  });

  it("formats 1234.56 correctly", () => {
    const result = formatCurrency(1234.56);
    // pt-BR format: R$ 1.234,56
    expect(result).toBe("R$\u00a01.234,56");
  });
});

describe("lineTotal", () => {
  it("calculates total with options", () => {
    const result = lineTotal(20, 2, [
      { priceModifier: 3 },
      { priceModifier: 2 },
    ]);
    // (20 + 3 + 2) * 2 = 50
    expect(result).toBe(50);
  });
});
