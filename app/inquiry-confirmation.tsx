"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import { Icon } from "./ui-icon";

export function InquiryConfirmation() {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    let closed = false;
    let player: AnimationItem | undefined;

    function finish() {
      element?.parentElement?.removeAttribute("data-playing");
    }
    function motionChanged() {
      if (preference.matches) {
        closed = true;
        player?.stop();
        finish();
      }
    }
    preference.addEventListener("change", motionChanged);
    // Only an accepted inquiry needs this player. The static mark is always available.
    Promise.all([import("lottie-web/build/player/lottie_light"), import("./inquiry-check.json")])
      .then(([{ default: lottie }, { default: animationData }]) => {
        if (closed) return;
        player = lottie.loadAnimation({ container: element, renderer: "svg", loop: false, autoplay: false, animationData });
        player.addEventListener("DOMLoaded", () => {
          if (closed) return;
          element.parentElement?.setAttribute("data-playing", "true");
          player?.play();
        });
        player.addEventListener("complete", finish);
      })
      .catch(finish);

    return () => {
      closed = true;
      preference.removeEventListener("change", motionChanged);
      player?.destroy();
      finish();
    };
  }, []);

  return <span className="confirm-mark" aria-hidden="true"><Icon name="check" /><span ref={host} className="confirm-player" /></span>;
}
