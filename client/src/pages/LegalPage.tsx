import type { ReactNode } from "react";
import { Link } from "wouter";

type LegalPageKind = "privacy" | "terms" | "cookies" | "refunds";

const LAST_UPDATED = "14 September 2026";
const CONTACT_EMAIL = "kaustubhagrawal28@gmail.com";

function PolicyShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#2c2b28]">
      <header className="border-b border-[#2c2b28]/10 bg-[#f7f3ed]/95 px-5 py-5 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-[980px] items-center justify-between gap-4">
          <Link href="/" className="font-serif text-2xl tracking-[-0.05em]" aria-label="Knot & Nest home">Knot &amp; Nest</Link>
          <Link href="/" className="rounded-full border border-[#2c2b28]/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-[#eadfd2]">Back to shop</Link>
        </div>
      </header>
      <main className="mx-auto max-w-[980px] px-5 py-14 lg:px-10 lg:py-20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8d4f38]">{eyebrow}</p>
        <h1 className="mt-4 max-w-[760px] font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.07em]">{title}</h1>
        <p className="mt-5 text-sm text-[#625b53]">Last updated: {LAST_UPDATED}</p>
        <article className="prose prose-stone mt-12 max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-[-0.04em] prose-p:text-[#5f584f] prose-p:leading-7 prose-li:text-[#5f584f] prose-strong:text-[#2c2b28] prose-a:text-[#8d4f38]">
          {children}
        </article>
        <div className="mt-14 rounded-2xl border border-[#a45e42]/30 bg-[#f1e5d9] p-5 text-sm leading-6 text-[#5f584f]">
          <strong className="text-[#2c2b28]">Seller details still needed before launch.</strong> The site currently identifies the business as Knot &amp; Nest and provides {CONTACT_EMAIL}. Add the owner’s legal name, full correspondence address, customer-care contact, grievance-officer name and contact, and GSTIN if applicable before accepting orders at scale. Do not treat this page as legal advice.
        </div>
      </main>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <PolicyShell title="Privacy, plainly put." eyebrow="Privacy policy">
      <p>This policy explains how Knot &amp; Nest handles information when you browse the shop or place an order. It is written for the current site implementation and should be reviewed by the business owner for the places where a legal name, address, retention schedule, and grievance contact are still missing.</p>
      <h2>Information we collect</h2>
      <p>To process an order, the checkout asks for your name, email address, phone or WhatsApp number, delivery address, PIN code, selected items, payment preference, and any optional order note. The cart is stored in your browser so that your selection survives a page refresh. We do not ask for an account, password, date of birth, government ID, or marketing profile.</p>
      <h2>Why we use it</h2>
      <p>We use order information to calculate delivery, confirm and fulfil the order, contact you about delivery or payment, handle customer support, prevent misuse, keep business records, and meet legal or accounting obligations. Optional notes should contain only information needed to fulfil the order; do not include health, financial-account, password, or other sensitive information.</p>
      <h2>Who receives it</h2>
      <p>Order data is stored in the site’s database and may be sent to the configured email provider, Resend, to deliver an order confirmation. The business may also use delivery, payment, or WhatsApp services to complete an order. Those services may process information under their own terms and privacy notices. No third-party advertising or social-media embed is intentionally loaded by this site.</p>
      <h2>Analytics and consent</h2>
      <p>Umami analytics is not loaded unless you choose “Allow analytics” in the cookie banner. If you decline, the site keeps analytics disabled. To change your choice later, clear this site’s browser storage and revisit the site. Essential browser storage used for the cart is not used to build an advertising profile.</p>
      <h2>Retention and rights</h2>
      <p>We keep information for as long as needed to complete the transaction, provide support, resolve disputes, maintain accounting or tax records, and comply with law. The current implementation does not yet provide an automated deletion request workflow or a published retention schedule. To ask about access, correction, deletion, withdrawal of consent, or a complaint, contact {CONTACT_EMAIL}; the business owner must add a formal grievance contact before launch.</p>
      <h2>Security and children</h2>
      <p>Orders are transmitted over the site’s secure connection and access to the order database should be restricted to authorised operators. No service can promise absolute security. The shop is not directed at children, and we do not knowingly collect children’s personal data.</p>
      <h2>Changes</h2>
      <p>We may update this policy when the site, service providers, or applicable law changes. The latest version will be posted on this page with its revision date.</p>
    </PolicyShell>
  );
}

function Terms() {
  return (
    <PolicyShell title="The simple terms." eyebrow="Terms & conditions">
      <p>These terms apply to browsing and ordering from Knot &amp; Nest. They are intended as an India-focused baseline and must be completed with the seller’s legal identity, address, grievance contact, and final governing-law details before launch.</p>
      <h2>Products and orders</h2>
      <p>Product descriptions, dimensions, materials, prices, and availability are shown on the product page. Handmade pieces can have small variations. An order request is not accepted until Knot &amp; Nest confirms it. If an item or price cannot be honoured, we will contact you and refund any amount already received for that item.</p>
      <h2>Prices, delivery, and payment</h2>
      <p>Prices are shown in Indian rupees. Delivery is calculated from the PIN code and the cart value and is shown before submission when a valid PIN code is entered. Payment is arranged after the order request through the selected UPI or WhatsApp handoff. Do not send card numbers, banking passwords, or one-time passwords through the order note or WhatsApp.</p>
      <h2>Customer responsibilities</h2>
      <p>Provide accurate contact and delivery information and tell us promptly if anything changes. You are responsible for checking that the delivery address and phone number are correct. You must not misuse the site, attempt unauthorised access, or submit another person’s information without permission.</p>
      <h2>Intellectual property</h2>
      <p>Site text, branding, layout, and original product photography belong to Knot &amp; Nest or their respective licensors. You may view the site for personal shopping purposes. Do not copy, sell, or reuse site assets without permission. The owner should keep source records or licences for every image used.</p>
      <h2>Liability and lawful rights</h2>
      <p>Nothing in these terms removes rights that cannot lawfully be excluded. Subject to applicable law, Knot &amp; Nest is not responsible for losses caused by incorrect customer information, third-party service outages, or events outside reasonable control. Product-specific remedies and cancellations are described in the Refund policy.</p>
      <h2>Contact and complaints</h2>
      <p>For order questions or complaints, contact {CONTACT_EMAIL}. The business owner must publish the legal seller name, full address, grievance officer, response process, and final governing-law and jurisdiction wording before launch.</p>
    </PolicyShell>
  );
}

function CookiePolicy() {
  return (
    <PolicyShell title="A small, clear cookie note." eyebrow="Cookie policy">
      <p>This site uses limited browser storage. We aim to use only what is needed for the shop to work, and we do not load optional analytics until you opt in.</p>
      <h2>Essential storage</h2>
      <p>The cart is stored in local browser storage under a site-specific key so your selection remains available after a refresh. This is functional storage, not an advertising cookie. If you clear site data, the cart may be lost.</p>
      <h2>Optional analytics</h2>
      <p>If you select “Allow analytics”, the site loads the configured Umami analytics script. It may create analytics-related browser storage or process technical usage information according to the configured endpoint’s documentation. If you select “Decline”, the script is not loaded. To change your choice later, clear this site’s browser storage and revisit the site.</p>
      <h2>Third-party content</h2>
      <p>The site links to Instagram and WhatsApp but does not intentionally embed their content on the storefront. Opening those services takes you to a third-party site that may use its own cookies and tracking. Google Fonts are requested from Google to render the site typography; the owner should self-host fonts if reducing third-party requests is a priority.</p>
      <h2>Questions</h2>
      <p>For cookie or privacy questions, contact {CONTACT_EMAIL}. This policy should be updated if the site adds advertising, pixels, embedded media, payment widgets, chat tools, or other non-essential technologies.</p>
    </PolicyShell>
  );
}

function RefundPolicy() {
  return (
    <PolicyShell title="A fair way to make it right." eyebrow="Refund & cancellation policy">
      <p>This policy applies to orders placed through Knot &amp; Nest. It is subject to consumer rights that cannot be excluded under applicable law. Because pieces are handmade and may be made to order, please contact us as soon as possible if you need to cancel or report a problem.</p>
      <h2>Before production or confirmation</h2>
      <p>You may request cancellation by emailing {CONTACT_EMAIL} with your order number. If the order has not been confirmed or production has not started, we will normally cancel it and refund any amount received.</p>
      <h2>Made-to-order and customised pieces</h2>
      <p>Once production has started, cancellation or change-of-mind requests may not be possible for a made-to-order or customised piece, except where applicable law provides a different right. We will tell you if a product is customised or subject to a special restriction before accepting the order.</p>
      <h2>Damaged, incorrect, or materially defective items</h2>
      <p>Contact {CONTACT_EMAIL} within 48 hours of delivery with your order number and clear photographs of the packaging and item. We may offer repair, replacement, or a refund after reviewing the issue. This process does not limit remedies available under applicable law.</p>
      <h2>Refund timing</h2>
      <p>Approved refunds are returned through the original payment route where possible. Processing time depends on the payment provider and bank. Delivery charges are refundable where required by law or where the issue is attributable to us.</p>
      <h2>How to contact us</h2>
      <p>Please include the order number, the issue, and the remedy you are requesting. The business owner must add a full legal seller identity, address, grievance officer, and final consumer-law process before launch.</p>
    </PolicyShell>
  );
}

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  if (kind === "privacy") return <PrivacyPolicy />;
  if (kind === "terms") return <Terms />;
  if (kind === "cookies") return <CookiePolicy />;
  return <RefundPolicy />;
}
