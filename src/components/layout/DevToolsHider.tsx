"use client";

import { useEffect } from "react";

export default function DevToolsHider() {
  useEffect(() => {
    // 1. Inject aggressive CSS
    const style = document.createElement("style");
    style.innerHTML = `
      nextjs-portal,
      #nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      .nextjs-toast-errors-parent,
      div:where([class*="nextjs-toast"]),
      div:where([data-nextjs-toast]),
      div:where([data-nextjs-dialog-overlay]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
    document.body.appendChild(style);

    // 2. Poll to remove the element from DOM
    const interval = setInterval(() => {
      const selectors = [
        "nextjs-portal",
        "#nextjs-portal", 
        "[data-nextjs-toast]",
        "div[class*='nextjs-toast']"
      ];
      
      selectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => el.remove());
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
