"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Icon } from "./ui-icon";
import art from "./service-illustration.module.css";

const services = [
  { id: "web", name: "Web-stranice", goal: "Predstavite posao i primajte upite", href: "#web-stranice", angle: 180, icon: "web" },
  { id: "shop", name: "Webshopovi", goal: "Prodajte proizvode online", href: "#webshopovi", angle: 60, icon: "bag" },
  { id: "tool", name: "Poslovni alati", goal: "Smanjite ručni rad u timu", href: "#interni-alati", angle: -60, icon: "tool" },
] as const;

type Wheel = { index: number | null; angle: number };

function turn(wheel: Wheel, index: number): Wheel {
  if (index === wheel.index) return wheel;
  const destination = services[index].angle;
  const difference = ((destination - wheel.angle) % 360 + 540) % 360 - 180;
  return { index, angle: wheel.angle + difference };
}

export function ServiceHero({ startingPrice }: { startingPrice: string }) {
  const [wheel, setWheel] = useState<Wheel>({ index: null, angle: 0 });
  const active = wheel.index === null ? null : services[wheel.index];

  function step(direction: number) {
    setWheel(current => {
      const from = current.index ?? (direction > 0 ? -1 : 0);
      return turn(current, (from + direction + services.length) % services.length);
    });
  }

  return (
    <div className={"frame hero-grid " + art.art} data-active={active?.id}
      style={{ "--deweb-wheel-angle": wheel.angle + "deg" } as CSSProperties}>
      <div className="hero-copy">
        <h1 id="hero-title">Web za kupce.<br />Alati za vaš tim.</h1>
        <p>Izrađujemo web-stranice <a href="#web-stranice">od {startingPrice} €</a>, webshopove i poslovne alate po mjeri. O projektu razgovarate izravno s Dinkom Vukovićem.</p>
        <div className="hero-actions">
          <a href="#kontakt" className="button">Zatražite ponudu <Icon name="up-right" /></a>
          <a href="#radovi" className="text-link">Pogledajte radove <Icon name="down" /></a>
        </div>
      </div>

      <figure className="service-stage" aria-label="Interaktivni prikaz triju usluga">
        <div className="stage-space" aria-hidden="true">
          <div className="stage-model">
            <div className={art.platform} />
            <div className={art.piece + " " + art.web}>
              <div className={art.browser}>
                <div className={art.browserBar}>
                  <span className={art.browserControls} />
                  <span className={art.browserAddress}>www.</span>
                </div>
                <div className={art.browserPage}>
                  <div className={art.browserNav} />
                  <div className={art.browserCopy}><span /><span /><span /></div>
                  <div className={art.browserImage} />
                </div>
              </div>
            </div>
            <div className={art.piece + " " + art.shop}>
              <Image src="/deweb-usluge.webp" alt="" fill loading="eager" sizes="(min-width: 850px) 450px, 320px" className={art.texture} />
            </div>
            <div className={art.piece + " " + art.tool}><div className={art.toolTile} /></div>
          </div>
        </div>
        <figcaption className="stage-caption">
          <span id="wheel-caption" aria-live="polite">{active?.name ?? "Pregled usluga"}</span>
          <div className="stage-controls">
            <button type="button" onClick={() => step(-1)} aria-controls="wheel-caption" aria-label="Prethodna usluga"><Icon name="left" /></button>
            <button type="button" onClick={() => step(1)} aria-controls="wheel-caption" aria-label="Sljedeća usluga"><Icon name="right" /></button>
          </div>
        </figcaption>
        <noscript><style>{".stage-controls { display: none }"}</style></noscript>
      </figure>

      <nav id="usluge" className="service-index" aria-label="Odaberite uslugu">
        {services.map((service, i) => (
          <a key={service.id} href={service.href} data-service-choice={service.id}
            onPointerEnter={event => { if (event.pointerType !== "touch") setWheel(current => turn(current, i)); }}
            onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setWheel(current => turn(current, i)); }}>
            <Icon name={service.icon} className="service-icon" />
            <span><strong>{service.name}</strong><small>{service.goal}</small></span>
            <Icon name="right" className="index-arrow" />
          </a>
        ))}
      </nav>
    </div>
  );
}
