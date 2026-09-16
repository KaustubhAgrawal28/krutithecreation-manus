# Product Requirements Document

## Knot & Nest — Handmade Macramé Storefront

**Document status:** Product baseline and implementation roadmap  
**Owner:** Knot & Nest  
**Prepared by:** Manus AI  
**Date:** 16 September 2026  
**Primary platform:** Responsive web application  
**Primary market:** India  
**Currency:** Indian rupees (₹)

---

## 1. Executive Summary

Knot & Nest is a direct-to-consumer storefront for handmade macramé pieces. The product combines an editorial shopping experience with a lightweight checkout flow that supports catalogue browsing, cart management, delivery estimation, order placement, secure sign-in, order history, and post-order email confirmation.

The storefront should feel calm, tactile, and trustworthy rather than transactional. Its visual system uses warm neutrals, editorial serif headlines, concise product storytelling, and restrained motion. The commerce system should remain operationally simple: customers select products, provide delivery details, choose a payment handoff method, accept the applicable policies, and submit an order for manual confirmation and fulfilment.

The current implementation provides the foundational customer journey. The next product phase should make the experience operationally complete by improving order operations, catalogue management, payment reconciliation, delivery communication, observability, and measurement without compromising the handmade brand experience.

> **Product principle:** Make it easy to discover a meaningful handmade object, place a clear and trustworthy order, and feel looked after after checkout.

---

## 2. Product Context and Current State

The existing website is a public storefront with five catalogue products across three categories: wall art, plant life, and little things. Product data is currently maintained in a shared catalogue file and is used by both the storefront and server-side order validation. Product imagery is served from managed storage rather than committed to the frontend repository.

The current customer-facing routes are:

| Route | Purpose | Current status |
|---|---|---|
| `/` | Editorial home page, catalogue, cart, checkout, story, and care content | Implemented |
| `/account` | OAuth sign-in state and authenticated order history | Implemented |
| `/privacy` | Privacy policy | Implemented |
| `/terms` | Terms of service | Implemented |
| `/cookies` | Cookie policy and consent context | Implemented |
| `/refunds` | Refund policy | Implemented |

Checkout supports guest and signed-in customers. When a customer is signed in, the order is associated with the authenticated user and becomes visible in that user’s account history. Guest orders remain valid and are not forced through account creation.

The current payment experience is a payment handoff rather than a payment gateway. Customers select either UPI/QR or WhatsApp handoff. The store then confirms payment manually. This distinction must be made explicit in all checkout copy and operational documentation.

Shipping is estimated from the first digit of the Indian PIN code. Delivery becomes free for orders above ₹2,500. The estimate is a business rule, not a live courier quote, and should be described as an estimate until courier integration is introduced.

Post-order emails are integrated through Resend. If the Resend credentials are absent or delivery fails, the order remains saved and checkout still completes. This fallback protects order capture but requires an operational monitoring process so failed notifications are not silently missed.

The application uses Manus OAuth for authentication. It does not collect or store passwords. Session tokens are signed with `JWT_SECRET`, and production startup requires that secret to be at least 32 characters long.

---

## 3. Problem Statement

Handmade products are often discovered through visual browsing and personal recommendations, but the purchase journey can become uncertain when the store does not clearly explain product dimensions, delivery cost, payment expectations, fulfilment timing, or what happens after an order is placed.

Knot & Nest must solve four customer problems:

1. **Discovery:** Customers need to understand what makes each piece distinctive and where it fits in their home.
2. **Confidence:** Customers need clear product details, delivery estimates, policies, and payment instructions before committing.
3. **Low-friction ordering:** Customers should be able to order as guests or sign in for future convenience without being forced into unnecessary account setup.
4. **Post-order reassurance:** Customers need a reliable confirmation and a visible order record so they know the store received their request.

The business also has operational problems:

1. Orders need a stable identifier and normalized line items.
2. The store needs customer contact details and delivery data in a consistent format.
3. Signed-in customers need a private, reliable history of their own orders.
4. Notification failures must not delete or invalidate successfully saved orders.
5. The system must reject tampered product IDs, invalid totals, malformed inputs, abusive traffic, and unsafe session configuration.

---

## 4. Goals and Non-Goals

### 4.1 Goals

The product must:

- Present a distinctive, warm, editorial storefront for handmade macramé.
- Make product discovery understandable within one or two interactions.
- Allow customers to add products to a cart and adjust quantities.
- Calculate subtotal, delivery estimate, and total consistently on the server.
- Support guest checkout and authenticated checkout.
- Save orders with stable order numbers and normalized line items.
- Associate authenticated orders with the correct user without exposing another user’s history.
- Send an order confirmation to the customer when the email provider is configured.
- Preserve the order if email delivery fails.
- Provide a private account view for authenticated order history.
- Apply input validation, sanitization, rate limiting, secure cookies, CSRF-aware OAuth state handling, and strict runtime secret validation.
- Respect reduced-motion preferences and maintain keyboard-visible focus states.
- Provide a foundation for future catalogue administration, payment confirmation, fulfilment updates, and analytics.

### 4.2 Non-Goals for the current product phase

The following are intentionally outside the current baseline:

- Native mobile applications.
- User-created passwords or local password reset flows.
- Automatic online payment capture or payment settlement.
- Real-time courier tracking.
- Multi-vendor marketplace functionality.
- Product reviews, ratings, or social feeds.
- Customer-to-customer messaging.
- A complete admin dashboard for catalogue and order operations.
- Automatic tax invoice generation unless required by the business.
- International currency, multi-language checkout, or international shipping.

These may be considered in later phases after operational volume justifies their complexity.

---

## 5. Target Users

### 5.1 Primary customer: thoughtful home decorator

This customer wants a small number of expressive objects rather than mass-produced décor. They respond to strong imagery, concise craftsmanship details, and evidence that the product will suit a real room. They need clear dimensions, material descriptions, delivery expectations, and a simple checkout.

### 5.2 Gift buyer

This customer may not know the product category well. They need quick product comprehension, price clarity, a reliable order confirmation, and confidence that the recipient will receive an appropriate handmade item.

### 5.3 Returning customer

This customer has purchased before or intends to purchase more than once. They benefit from secure sign-in, prefilled identity fields, and private order history. They should not need to search old messages to identify a previous order number.

### 5.4 Store operator

The store operator receives orders, verifies payment, communicates with customers, prepares pieces, and arranges delivery. They need stable order numbers, readable line items, customer contact information, policy acceptance records, and dependable notifications.

---

## 6. Product Experience Principles

### 6.1 Editorial before transactional

The home page should first communicate the material, mood, and purpose of the collection. Commerce controls should remain visible but should not make the website feel like a generic marketplace.

### 6.2 Clarity at commitment points

The customer must see the product total, delivery estimate, payment method, policy acceptance, and next step before placing an order. No material cost or obligation should be hidden behind an ambiguous button.

### 6.3 Account optional, ownership precise

A customer can order without an account. When signed in, the order is linked to the authenticated user. The system must never infer ownership from an email address alone when a stronger authenticated identity is available.

### 6.4 Handmade does not mean uncertain

Brand warmth may be expressive, but product details, dimensions, materials, delivery rules, refund policy, and confirmation behavior must be precise.

### 6.5 Motion supports hierarchy

Animations should communicate entry, response, or state change. They must remain under approximately 300 milliseconds for ordinary interactions, use transform and opacity where possible, and be disabled or reduced when the user requests reduced motion.

---

## 7. Primary User Journeys

### 7.1 Browse and purchase as a guest

1. The customer lands on the home page.
2. They scan the hero message and choose to explore the collection.
3. They filter the catalogue by all pieces, wall art, plant life, or little things.
4. They review a product image, name, description, price, and details.
5. They add one or more pieces to the bag.
6. They adjust quantities and review subtotal and delivery estimate.
7. They open checkout and provide name, email, phone, address, and PIN code.
8. They choose UPI/QR or WhatsApp handoff.
9. They accept the terms, privacy policy, and refund policy.
10. They place the order.
11. The server validates product identity and recalculates the amount.
12. The order is saved with a stable order number.
13. If configured, the customer receives an email confirmation.
14. The storefront displays an order confirmation and next-step guidance.

### 7.2 Purchase while signed in

The signed-in journey is identical except that the account identity is available to the server, customer name and email may be prefilled, and the saved order includes the authenticated user ID. The customer can later open `/account` to view their order history.

### 7.3 View order history

1. The customer opens the account route.
2. If not authenticated, they see a secure sign-in explanation and a sign-in action.
3. Manus OAuth completes the login flow.
4. The server resolves the authenticated user.
5. The account page requests only orders belonging to that user.
6. Each order displays order number, date, status, line items, payment method, and total.
7. An empty state directs the customer back to the collection.

### 7.4 Recover from notification failure

1. The order is saved first.
2. The email service is called after persistence.
3. If delivery succeeds, the customer receives the confirmation.
4. If delivery fails or credentials are unavailable, checkout still returns success.
5. The server logs a non-sensitive delivery failure for operational investigation.
6. A future operations feature should expose failed notification status for retry.

---

## 8. Functional Requirements

### 8.1 Storefront and catalogue

**FR-CAT-01 — Product presentation.** Each product must display a stable name, short name, category, price in rupees, description, detailed material or dimension information, and image.

**FR-CAT-02 — Category filtering.** The catalogue must support all products and the three current categories: wall art, plant life, and little things. Selecting a category must update the visible product set without a full-page navigation.

**FR-CAT-03 — Server catalogue authority.** The server must validate every submitted product ID against the authoritative catalogue. The client must not be trusted to define product name or price.

**FR-CAT-04 — Availability behavior.** If a submitted product ID no longer exists, the order must be rejected with a customer-readable error and no order must be created.

**FR-CAT-05 — Product imagery.** Images must be served from managed storage or an approved remote asset location. Large media must not be committed to the frontend repository.

**FR-CAT-06 — Content consistency.** Product dimensions, materials, pot exclusions, and handmade variation notes must be kept current with the physical product.

### 8.2 Cart

**FR-CART-01 — Add to bag.** Customers must be able to add a product from the catalogue.

**FR-CART-02 — Quantity changes.** Customers must be able to increment, decrement, and remove line items. The interface must prevent quantity values below one and should cap unusually large quantities.

**FR-CART-03 — Persistence.** The cart may persist in browser storage for convenience. Browser storage must not be treated as an order record or source of pricing truth.

**FR-CART-04 — Empty state.** An empty cart must provide a clear path back to the catalogue.

**FR-CART-05 — Total preview.** The bag must display item subtotal, delivery estimate when a valid PIN code is available, and the expected order total.

### 8.3 Checkout and orders

**FR-ORD-01 — Required checkout fields.** Checkout must collect customer name, email, phone, address, six-digit Indian PIN code, payment handoff method, and policy acceptance.

**FR-ORD-02 — Optional notes.** Customers may provide delivery or order notes within a bounded length. Notes must be treated as untrusted text.

**FR-ORD-03 — Payment handoff.** The current payment options must be explicitly labeled as UPI/QR and WhatsApp handoff. The interface must not imply that payment has been automatically captured.

**FR-ORD-04 — Server-side recalculation.** The server must resolve each product from the authoritative catalogue, calculate line totals, calculate subtotal, calculate delivery, and calculate total.

**FR-ORD-05 — Shipping rule.** Delivery must be free above ₹2,500. Below that threshold, the server must apply the configured PIN-code shipping estimate. The rule must be centralized so it can later be replaced with a courier quote.

**FR-ORD-06 — Stable order number.** Each saved order must receive a unique, customer-safe order number suitable for email and manual operations.

**FR-ORD-07 — Policy record.** The order must store the policy version and the UTC timestamp at which the customer accepted the terms.

**FR-ORD-08 — Guest order support.** An order may be created without an authenticated user ID. Guest checkout must remain available unless a future business decision explicitly removes it.

**FR-ORD-09 — Authenticated ownership.** When a valid authenticated user exists, the server must save that user’s ID on the order. A customer must never be able to submit an arbitrary user ID.

**FR-ORD-10 — Failure behavior.** If the order database write fails, checkout must return an error and must not claim success. If only email delivery fails after a successful write, the order must remain successful.

**FR-ORD-11 — Duplicate submission protection.** The client should disable the place-order action while a request is pending. The server should be extended with an idempotency key before high-volume launch to prevent repeated orders from network retries.

### 8.4 Authentication and account

**FR-AUTH-01 — OAuth-only identity.** Authentication must use the configured Manus OAuth flow. The product must not introduce local password storage unless the identity architecture is deliberately redesigned.

**FR-AUTH-02 — Signed sessions.** Session tokens must be signed with a high-entropy `JWT_SECRET` of at least 32 characters.

**FR-AUTH-03 — Secure cookies.** Session cookies must be HTTP-only, secure in production, scoped to `/`, and configured for the OAuth deployment topology.

**FR-AUTH-04 — OAuth state validation.** The OAuth callback must validate the one-time state nonce associated with the initiating browser.

**FR-AUTH-05 — Account privacy.** The account history procedure must be protected and must query by the authenticated user ID from server context.

**FR-AUTH-06 — Logout.** Logout must clear the session cookie and return a deterministic success response.

**FR-AUTH-07 — Non-authenticated account state.** Visitors who open the account page while signed out must receive a clear sign-in prompt rather than an error or an empty private record.

### 8.5 Email notifications

**FR-EMAIL-01 — Customer confirmation.** After a successful order write, the system should send a confirmation to the submitted customer email when Resend configuration exists.

**FR-EMAIL-02 — Confirmation contents.** The email must include the order number, customer name, line items, subtotal, delivery amount, total, and selected payment handoff method.

**FR-EMAIL-03 — Store notification.** The store operator should receive a blind-copied operational notification or a separate store email containing the same order reference and line items.

**FR-EMAIL-04 — Safe HTML.** All customer-controlled values inserted into HTML email must be escaped.

**FR-EMAIL-05 — Timeout.** The email request must have a bounded timeout so an external provider cannot hold the order request open indefinitely.

**FR-EMAIL-06 — Failure isolation.** Email failure must be logged without exposing credentials or customer-sensitive content in logs, and must not roll back a saved order.

**FR-EMAIL-07 — Configuration state.** The store must clearly track whether Resend credentials and a verified sender are configured. Missing credentials should be treated as an operational readiness issue, not a customer-facing server crash.

### 8.6 Security and abuse prevention

**FR-SEC-01 — Input schema validation.** All order inputs must be validated with explicit length, format, enum, and quantity constraints.

**FR-SEC-02 — Text sanitization.** Control characters must be removed from submitted free text. HTML must not be rendered from customer input.

**FR-SEC-03 — Email normalization.** Email values must be trimmed, lowercased, and validated.

**FR-SEC-04 — Rate limiting.** OAuth, storage, general tRPC, and order creation routes must have rate limits. The order endpoint must apply a stricter identity-based limit.

**FR-SEC-05 — Security headers.** The server must apply secure headers, deny debug paths in production, limit request body size, and trust proxy configuration only as required by the managed runtime.

**FR-SEC-06 — Secret hygiene.** Secrets must never be committed, printed, returned through APIs, or included in client bundles. Production debug output must not reveal secret presence or length.

**FR-SEC-07 — Session secret readiness.** Production must fail closed when `JWT_SECRET` is missing or shorter than 32 characters. The deployment environment, not application code, must provide the secret.

**FR-SEC-08 — Authorization boundary.** User-owned procedures must use protected server context. Client-provided ownership fields must be ignored.

**FR-SEC-09 — Dependency maintenance.** Dependencies, browser compatibility data, and security advisories should be reviewed before major launches.

### 8.7 Accessibility and interaction design

**FR-UX-01 — Keyboard access.** Interactive controls must be reachable and operable with a keyboard.

**FR-UX-02 — Focus visibility.** Links, buttons, inputs, and textareas must have visible focus indicators.

**FR-UX-03 — Reduced motion.** Non-essential animation must respect `prefers-reduced-motion: reduce`.

**FR-UX-04 — Loading states.** Authentication, account history, and order placement must expose a loading state without leaving the user uncertain about whether an action was received.

**FR-UX-05 — Error states.** Validation errors must identify the corrective action. Server errors must not expose stack traces or internal implementation details.

**FR-UX-06 — Responsive layouts.** The storefront, cart, checkout, account page, policy pages, and cookie consent must remain usable at mobile, tablet, and desktop widths.

**FR-UX-07 — Motion restraint.** Hover and scroll motion must support hierarchy rather than distract from product content. No essential information may depend on animation.

---

## 9. Data Model Requirements

The core data model consists of users and orders.

### 9.1 Users

The user record is created or updated through the OAuth synchronization path. It includes the Manus OAuth open ID, optional name and email, login method, role, creation time, update time, and last sign-in time. The application should not store a password hash for OAuth users.

### 9.2 Orders

An order must contain:

- Internal numeric identifier.
- Nullable authenticated user ID.
- Unique public order number.
- Customer name, email, phone, address, and PIN code.
- Optional notes.
- Serialized or normalized line items with product ID, product name snapshot, quantity, unit price, and line total.
- Subtotal, shipping, and total in integer rupee units.
- Payment handoff method.
- Policy version and acceptance timestamp.
- Order status.
- Creation timestamp.

The product name and unit price should be stored as an order-time snapshot so later catalogue edits do not rewrite historical orders. Before scaling the operations workflow, the line items should be migrated from serialized JSON to a dedicated `order_items` table if reporting, partial fulfilment, inventory, or returns become important.

### 9.3 Recommended future status model

The current baseline supports `new`, `confirmed`, `fulfilled`, and `cancelled`. A future operational model should distinguish at least:

- `new`: Order captured, payment not yet verified.
- `payment_pending`: Customer instructed to complete payment.
- `paid`: Payment confirmed.
- `preparing`: Piece is being made or packed.
- `dispatched`: Handover to courier completed.
- `delivered`: Delivery confirmed.
- `cancelled`: Order cancelled.
- `refunded`: Money returned where applicable.

Status transitions must be server-controlled and auditable.

---

## 10. API and Backend Requirements

The application should retain tRPC as the typed contract between client and server.

| Procedure | Access | Purpose |
|---|---|---|
| `auth.me` | Public | Return current authenticated user or null |
| `auth.logout` | Public | Clear the session cookie |
| `catalogue` | Public | Return authoritative product catalogue |
| `orders.create` | Public | Validate and save a guest or authenticated order |
| `orders.history` | Protected | Return only the current user’s order history |

Before production scale, add the following procedures behind appropriate authorization:

| Proposed procedure | Access | Purpose |
|---|---|---|
| `orders.getByOrderNumber` | Protected or signed token | Customer-safe order detail lookup |
| `orders.retryNotification` | Admin | Retry a failed email notification |
| `orders.updateStatus` | Admin | Transition an order through an allowed status machine |
| `catalogue.adminList` | Admin | Review products without editing source code |
| `catalogue.adminUpdate` | Admin | Update product content and availability |
| `inventory.update` | Admin | Track available or made-to-order capacity |

All admin procedures must use server-side role checks. A hidden client button is not an authorization boundary.

---

## 11. Non-Functional Requirements

### 11.1 Reliability

A successful database write is the source of truth for order capture. External email delivery must not determine whether an order is accepted. The application should emit structured, non-sensitive logs for order creation, email success, email failure, authentication failure, rate limiting, and startup configuration errors.

### 11.2 Performance

The storefront should load the initial content quickly on a mobile network. Product images should be resized or served in appropriate formats. Large JavaScript chunks should be reviewed for code splitting as the feature set grows. The application should avoid blocking the first meaningful view on optional analytics, email, or account history requests.

### 11.3 Security

The production service must start only with valid required configuration. Secrets must be injected by the deployment platform. The server must validate every monetary value from product identity rather than accepting client-calculated totals. Customer history must be protected by server authorization.

### 11.4 Privacy

The store should collect only information required to fulfil the order, communicate with the customer, and maintain legally required records. Privacy and refund policies must remain accessible from checkout and the footer. Analytics must be optional where the cookie consent model requires opt-in.

### 11.5 Accessibility

The application should target WCAG 2.2 AA practices for keyboard access, focus visibility, color contrast, form labels, error messaging, and reduced motion. Formal accessibility testing should be added before a public marketing campaign.

### 11.6 Observability

Minimum production monitoring should include uptime, startup failures, error rates, tRPC latency, order creation failures, email delivery failures, and rate-limit events. Logs must exclude JWT values, API keys, full payment details, and unnecessary personal data.

---

## 12. Analytics and Measurement

Analytics should measure whether customers can discover products and complete an order without compromising privacy.

Recommended events are:

| Event | Trigger | Useful properties |
|---|---|---|
| `view_storefront` | Home page loaded | Referrer, device class |
| `filter_catalogue` | Category selected | Category |
| `view_product` | Product detail or expanded product view | Product ID, category |
| `add_to_cart` | Product added | Product ID, quantity |
| `begin_checkout` | Checkout opened | Cart value, item count |
| `submit_order` | Place-order request started | Payment method, cart value |
| `order_created` | Order successfully saved | Order number should not be sent to third-party analytics unless approved |
| `email_delivery_failed` | Server-side notification failure | Provider status, no email body |
| `sign_in_started` | OAuth sign-in initiated | Entry route |
| `view_order_history` | Account history loaded | Item count, no sensitive order contents |

Success metrics should be evaluated as trends rather than isolated targets. The initial dashboard should focus on catalogue engagement, checkout initiation, order creation success, notification failure rate, and return visits from signed-in customers.

---

## 13. Acceptance Criteria

The baseline release is acceptable when all of the following are true:

1. A visitor can browse all current categories and add products to the bag.
2. The server rejects unknown product IDs and ignores client-submitted pricing.
3. The checkout validates name, email, phone, address, PIN code, payment method, policy acceptance, and line items.
4. The server calculates subtotal, delivery, and total consistently with the shared shipping rule.
5. A guest can place an order without signing in.
6. A signed-in customer can place an order that is linked to their authenticated user ID.
7. A signed-in customer can view only their own order history.
8. An unauthenticated visitor sees a sign-in state on the account route.
9. A valid production `JWT_SECRET` is required and a short secret fails startup with a clear error.
10. Session cookies are HTTP-only and secure in production.
11. OAuth state validation rejects an invalid callback state.
12. Order creation is rate limited.
13. Customer-controlled content is sanitized before persistence and escaped before email rendering.
14. An order remains saved if email delivery fails.
15. Email sending uses a bounded timeout.
16. The application has usable loading, error, empty, and success states.
17. The interface works at mobile and desktop widths.
18. Reduced-motion preferences disable non-essential motion.
19. Type checking, unit tests, formatting, and production build pass.
20. Production logs do not reveal secret values, secret length, or full sensitive customer data.

---

## 14. Risks and Mitigations

### Risk: Manual payment creates fulfilment ambiguity

**Mitigation:** Label payment as a handoff, record payment method, introduce explicit payment-pending and paid statuses, and give the operator a daily reconciliation view.

### Risk: In-memory rate limiting is weak across multiple instances

**Mitigation:** Move abuse controls to a shared store or managed edge rate limiter before significant traffic. Retain server-side validation even after adding edge controls.

### Risk: Email delivery failure is invisible to the customer

**Mitigation:** Keep order persistence independent, log delivery results, add an admin retry queue, and show the order number immediately after checkout.

### Risk: Serialized line items limit operational reporting

**Mitigation:** Keep product snapshots in the order now, then migrate to a dedicated order-items table before inventory, returns, or partial fulfilment.

### Risk: Catalogue changes require source edits

**Mitigation:** Introduce an admin catalogue model only after product volume or update frequency justifies the additional workflow. Until then, use the shared catalogue as the controlled source of truth.

### Risk: A compromised session secret invalidates trust in active sessions

**Mitigation:** Rotate the secret through the deployment platform, never commit or paste it into chat, and document the session invalidation effect of rotation.

### Risk: Handmade availability is not represented

**Mitigation:** Add availability states such as available, made-to-order, low capacity, and unavailable. Display the state consistently in product cards and checkout.

---

## 15. Release Plan

### Phase 0: Deployment readiness

Set a high-entropy production `JWT_SECRET` of at least 32 characters through the deployment environment. Configure a verified Resend sender and API key. Confirm database connectivity, OAuth configuration, secure cookie behavior, and production startup logs.

### Phase 1: Baseline storefront launch

Launch the current storefront, guest checkout, OAuth account access, order history, policy pages, order confirmation email, security controls, and responsive UI. Perform a real test order using a non-production customer address or a controlled internal workflow.

### Phase 2: Operations hardening

Add an operator order list, status transitions, email retry, payment reconciliation, customer contact actions, and structured order event logs. Add idempotency protection to order creation.

### Phase 3: Catalogue and fulfilment maturity

Move catalogue content into an admin-managed model if needed. Add availability and capacity, delivery windows, product variants, order-item normalization, and optional courier integration.

### Phase 4: Growth and retention

Add approved analytics dashboards, saved customer preferences, reorder or gifting flows, campaign landing pages, product storytelling content, and lifecycle email campaigns. Keep promotional features subordinate to the brand’s editorial experience.

---

## 16. Open Product Decisions

The following decisions should be resolved before expanding operations:

1. Will all orders remain manual-payment orders, or should UPI payment capture be integrated?
2. What is the target fulfilment window for each catalogue product?
3. Does the store accept cancellations after payment confirmation or after making begins?
4. Which courier or delivery partner will replace the PIN-code estimate at scale?
5. What operator role model is required beyond a single store owner?
6. Should guest customers receive a signed order lookup link, or should order history remain account-only?
7. What retention period applies to delivery addresses, phone numbers, order notes, and email records?
8. Which analytics provider and consent standard should be used for the production audience?
9. When should a product be marked unavailable, and can customers join a restock or custom-order request list?
10. Is the current store name and brand presentation final across policies, email sender identity, and social channels?

---

## 17. Definition of Done

The product is ready for a public launch when the customer can discover a product, understand the complete purchase terms, place a valid order, receive or otherwise access a confirmation, and later retrieve their own order history without exposing another customer’s information. The operator must be able to identify the order, verify payment, communicate fulfilment status, and recover from notification failure. The deployment must start only with secure runtime configuration, and all critical tests and production checks must pass.

---

## References

[1]: /home/ubuntu/knot-and-nest/STORE_GUIDE.md "Knot & Nest store guide"

[2]: /home/ubuntu/knot-and-nest/shared/catalogue.ts "Knot & Nest catalogue source"

[3]: /home/ubuntu/knot-and-nest/server/routers.ts "Knot & Nest tRPC order and account procedures"

[4]: /home/ubuntu/knot-and-nest/client/src/App.tsx "Knot & Nest application routes"
