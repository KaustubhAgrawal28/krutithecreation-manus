import type { ShippingQuote } from "../shared/shipping";
import { formatPrice } from "../shared/catalogue";

type ConfirmationEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  quote: ShippingQuote;
  paymentMethod: "upi" | "whatsapp";
};

const STORE_ORDER_NOTIFICATION_EMAIL = "kaustubhagrawal28@gmail.com";

export async function sendOrderConfirmationEmail(input: ConfirmationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.STORE_FROM_EMAIL;
  if (!apiKey || !from) {
    console.info("[Email] Confirmation skipped: RESEND_API_KEY or STORE_FROM_EMAIL is not configured.");
    return false;
  }

  const itemRows = input.items.map((item) => `<li>${escapeHtml(item.name)} × ${item.quantity} — ${formatPrice(item.lineTotal)}</li>`).join("");
  const paymentLabel = input.paymentMethod === "upi" ? "UPI / QR" : "WhatsApp handoff";
  const html = `<div style="font-family:Arial,sans-serif;color:#2c2b28;line-height:1.6;max-width:620px"><h1 style="font-family:Georgia,serif;font-weight:500">Thank you, ${escapeHtml(input.customerName)}.</h1><p>Your Knot &amp; Nest order <strong>${escapeHtml(input.orderNumber)}</strong> is safely with us.</p><h2 style="font-size:16px">Your pieces</h2><ul>${itemRows}</ul><p>Subtotal: <strong>${formatPrice(input.quote.subtotal)}</strong><br />Delivery: <strong>${input.quote.shipping === 0 ? "Free" : formatPrice(input.quote.shipping)}</strong><br />Total: <strong>${formatPrice(input.quote.total)}</strong></p><p>Payment method: <strong>${paymentLabel}</strong></p><p>We’ll confirm payment details and dispatch timing shortly.</p></div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [input.customerEmail], bcc: [STORE_ORDER_NOTIFICATION_EMAIL], subject: `Knot & Nest order ${input.orderNumber}`, html }),
    });
    if (!response.ok) {
      console.warn(`[Email] Resend rejected confirmation (${response.status}). Order was still saved.`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Email] Confirmation delivery failed. Order was still saved.", error);
    return false;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
