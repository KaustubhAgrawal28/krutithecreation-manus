export type ShippingQuote = {
  shipping: number;
  subtotal: number;
  total: number;
  label: string;
};

export const FREE_SHIPPING_THRESHOLD = 2500;

const regionalRates: Record<string, number> = {
  "1": 99,
  "2": 99,
  "3": 119,
  "4": 119,
  "5": 129,
  "6": 129,
  "7": 149,
  "8": 149,
  "9": 169,
};

export function getShippingQuote(pinCode: string, subtotal: number): ShippingQuote {
  const firstDigit = pinCode.trim().charAt(0);
  const baseRate = regionalRates[firstDigit] ?? 149;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { subtotal, shipping: 0, total: subtotal, label: "Free delivery" };
  }
  return { subtotal, shipping: baseRate, total: subtotal + baseRate, label: `Delivery from ${formatShipping(baseRate)}` };
}

export function formatShipping(amount: number) {
  return amount === 0 ? "Free" : `₹${amount.toLocaleString("en-IN")}`;
}
