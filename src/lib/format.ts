export function formatCurrency(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);
}

export function lineTotal(unitPrice: number, qty: number, options: { priceModifier: number }[]): number {
  const optionsTotal = options.reduce((sum, o) => sum + o.priceModifier, 0);
  return (unitPrice + optionsTotal) * qty;
}
