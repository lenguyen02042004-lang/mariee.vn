import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

export function Analytics({ ga4Id, pixelId }: { ga4Id?: string | null; pixelId?: string | null }) {
  useEffect(() => {
    if (!ga4Id || typeof window === "undefined") return;
    if (document.getElementById("ga4-loader")) return;
    const s = document.createElement("script");
    s.id = "ga4-loader";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) { window.dataLayer!.push(args); }
    window.gtag = gtag as any;
    gtag("js", new Date());
    gtag("config", ga4Id, { send_page_view: true });
  }, [ga4Id]);

  useEffect(() => {
    if (!pixelId || typeof window === "undefined") return;
    if (window.fbq) return;
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      let n: any, t: HTMLScriptElement, s: HTMLScriptElement | null;
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e) as HTMLScriptElement; t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
      s?.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq!("init", pixelId);
    window.fbq!("track", "PageView");
  }, [pixelId]);

  return null;
}