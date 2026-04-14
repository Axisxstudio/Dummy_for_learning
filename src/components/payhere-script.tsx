"use client";

import { useEffect } from "react";

/**
 * Loads PayHere JS SDK for modal checkout (sandbox vs live from public env).
 */
export function PayHereScript() {
  useEffect(() => {
    if (document.querySelector(`script[data-payhere-sdk="true"]`)) return;
    const sandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true";
    const sources = sandbox
      ? [
          "https://sandbox.payhere.lk/lib/payhere.js",
          "https://www.payhere.lk/lib/payhere.js"
        ]
      : [
          "https://www.payhere.lk/lib/payhere.js",
          "https://sandbox.payhere.lk/lib/payhere.js"
        ];

    const tryLoad = (index: number) => {
      if (index >= sources.length) return;
      const script = document.createElement("script");
      script.src = sources[index];
      script.async = true;
      script.dataset.payhereSdk = "true";
      script.onload = () => {
        // loaded
      };
      script.onerror = () => {
        script.remove();
        tryLoad(index + 1);
      };
      document.body.appendChild(script);
    };

    tryLoad(0);
  }, []);

  return null;
}
