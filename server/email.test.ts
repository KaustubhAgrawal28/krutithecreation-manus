import { afterEach, describe, expect, it, vi } from "vitest";
import { sendOrderConfirmationEmail } from "./email";

const originalApiKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.STORE_FROM_EMAIL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalApiKey;
  if (originalFrom === undefined) delete process.env.STORE_FROM_EMAIL;
  else process.env.STORE_FROM_EMAIL = originalFrom;
});

describe("post-order email delivery", () => {
  it("sends an escaped customer confirmation through Resend", async () => {
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.STORE_FROM_EMAIL = "Knot & Nest <orders@example.com>";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendOrderConfirmationEmail({
        orderNumber: "KN-TEST-123",
        customerName: "Asha <script>",
        customerEmail: "asha@example.com",
        items: [{ name: "Sunbeam <Wall>", quantity: 1, lineTotal: 1800 }],
        quote: { subtotal: 1800, shipping: 0, total: 1800 },
        paymentMethod: "upi",
      })
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-resend-key",
        }),
        body: expect.stringContaining("Asha &lt;script&gt;"),
      })
    );
  });

  it("does not attempt a network call without provider configuration", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.STORE_FROM_EMAIL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendOrderConfirmationEmail({
        orderNumber: "KN-TEST-456",
        customerName: "Asha",
        customerEmail: "asha@example.com",
        items: [],
        quote: { subtotal: 0, shipping: 0, total: 0 },
        paymentMethod: "whatsapp",
      })
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
