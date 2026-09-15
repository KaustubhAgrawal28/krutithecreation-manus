import { useEffect, useState } from "react";

const CONSENT_KEY = "knot-and-nest-cookie-consent";
const ANALYTICS_SRC = import.meta.env.VITE_ANALYTICS_ENDPOINT ? `${import.meta.env.VITE_ANALYTICS_ENDPOINT}/umami` : "";
const ANALYTICS_WEBSITE_ID = import.meta.env.VITE_ANALYTICS_WEBSITE_ID || "";

type ConsentChoice = "accepted" | "declined";

function loadAnalytics() {
  if (!ANALYTICS_SRC || !ANALYTICS_WEBSITE_ID || document.querySelector("script[data-knot-nest-analytics]") ) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = ANALYTICS_SRC;
  script.dataset.websiteId = ANALYTICS_WEBSITE_ID;
  script.dataset.knotNestAnalytics = "true";
  document.head.appendChild(script);
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      return saved === "accepted" || saved === "declined" ? saved : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (choice === "accepted") loadAnalytics();
  }, [choice]);

  const saveChoice = (nextChoice: ConsentChoice) => {
    localStorage.setItem(CONSENT_KEY, nextChoice);
    setChoice(nextChoice);
    if (nextChoice === "accepted") loadAnalytics();
  };

  if (choice) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#2c2b28]/15 bg-[#f7f3ed] p-4 shadow-[0_-10px_30px_rgba(44,43,40,0.12)] sm:p-5" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[760px]">
          <h2 id="cookie-consent-title" className="font-serif text-xl tracking-[-0.04em]">Your cookie choice</h2>
          <p className="mt-1 text-sm leading-6 text-[#625b53]">We use essential browser storage for your cart. Optional Umami analytics is off unless you allow it. Read the <a href="/cookies" className="font-semibold text-[#8d4f38] underline underline-offset-2">Cookie policy</a>.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => saveChoice("declined")} className="min-h-11 rounded-full border border-[#2c2b28]/25 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-[#eadfd2]">Decline analytics</button>
          <button type="button" onClick={() => saveChoice("accepted")} className="min-h-11 rounded-full bg-[#2c2b28] px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f7f3ed] transition-colors hover:bg-[#8d4f38]">Allow analytics</button>
        </div>
      </div>
    </div>
  );
}
