"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole site. Server components mark elements with
 * `data-reveal` (rise | fade | unveil | draw) and an optional `--d` delay; this
 * sets `data-shown` once each enters the viewport, and the CSS in globals.css
 * plays the entrance. It fires once per element — a folio does not re-turn its
 * pages every time you scroll past them.
 *
 * Elements already on screen at load are shown at once, so nothing above the
 * fold waits on an observer callback.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // The inline script in the layout hid marked elements before first paint
    // and will un-hide them after a few seconds unless this flag is set.
    (window as Window & { __folio?: boolean }).__folio = true;
    document.documentElement.dataset.motion = "";

    const show = (element: Element) => element.setAttribute("data-shown", "");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const watch = (scope: ParentNode) => {
      scope.querySelectorAll("[data-reveal]:not([data-shown])").forEach((element) => {
        observer.observe(element);
      });
    };

    watch(document);

    // Client navigations and streamed content add new marked elements.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]:not([data-shown])")) observer.observe(node);
          watch(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
