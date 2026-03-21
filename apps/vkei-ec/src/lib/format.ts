export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

export function formatPriceWithTax(price: number, taxRate = 0.1): string {
  const taxIncluded = Math.floor(price * (1 + taxRate));
  return `¥${taxIncluded.toLocaleString('ja-JP')} (税込)`;
}
