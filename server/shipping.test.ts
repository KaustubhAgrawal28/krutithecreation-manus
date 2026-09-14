import { describe, expect, it } from "vitest";
import { getShippingQuote } from "../shared/shipping";

describe("shipping quotes", () => {
  it("uses the regional rate for an eligible pin code", () => {
    expect(getShippingQuote("560001", 1890)).toEqual({
      subtotal: 1890,
      shipping: 129,
      total: 2019,
      label: "Delivery from ₹129",
    });
  });

  it("waives delivery at the free-shipping threshold", () => {
    expect(getShippingQuote("110001", 2500)).toEqual({
      subtotal: 2500,
      shipping: 0,
      total: 2500,
      label: "Free delivery",
    });
  });
});
