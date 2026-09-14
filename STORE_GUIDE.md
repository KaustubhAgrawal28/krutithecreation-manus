# Knot & Nest store guide

## Add a product

Open `shared/catalogue.ts` and add one object to the `catalogue` array. Keep `id` unique, choose one of the existing category values (`wall-art`, `plant-life`, or `little-things`), set the price in rupees as a number, and point `image` to a WebDev storage path such as `/manus-storage/your-image.jpg`. The catalogue, filters, cart, and server-side order validation all read from this same list.

For new images, upload them with `manus-upload-file --webdev /path/to/image.jpg`, then paste the returned `/manus-storage/...` path into the product object. Avoid placing large images in `client/public`.

## Keep headings in the same font

The page headings use the `font-serif` utility, mapped in `client/src/index.css` to **Playfair Display**. Keep `font-serif` on new headings and use the existing `tracking-[-0.05em]` or `tracking-[-0.07em]` styles for the same editorial feel. Body copy uses **DM Sans**, loaded in `client/index.html`.

## Email confirmations

Customer emails use Resend when `RESEND_API_KEY` and `STORE_FROM_EMAIL` are configured. `STORE_FROM_EMAIL` should be a verified sender such as `Knot & Nest <orders@yourdomain.com>`. If these values are not configured, the order is still saved and the checkout remains usable; only the confirmation email is skipped.

Shipping is estimated from the first digit of the Indian pin code and becomes free at ₹2,500. Update the regional values in `shared/shipping.ts` if your courier rates differ.
