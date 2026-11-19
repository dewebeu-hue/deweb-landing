"use client";

import { useRef, useState, type PointerEvent } from "react";
import { FeatureIcon } from "./feature-icon";
import { Icon } from "./ui-icon";
import art from "./service-illustration.module.css";

const services = [
  { id: "web", name: "Web-stranice", goal: "Predstavite posao i primajte upite", href: "#web-stranice" },
  { id: "shop", name: "Webshopovi", goal: "Prodajte proizvode online", href: "#webshopovi" },
  { id: "tool", name: "Poslovni alati", goal: "Organizirajte posao na svoj način", href: "#interni-alati" },
] as const;

const slots = ["center", "right", "left"] as const;
type Slot = (typeof slots)[number];

function wrap(index: number) {
  return (index + services.length) % services.length;
}

function QuoteLink() {
  return <a href="#kontakt" className="button">Zatražite ponudu <Icon name="up-right" /></a>;
}

export function ServiceHero() {
  const [selection, setSelected] = useState<number | null>(null);
  const selected = selection ?? 1;
  const hoveredSlot = useRef<Slot | null>(null);

  function selectOnHover(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;

    const tile = (event.target as Element).closest<HTMLButtonElement>("[data-wheel-tile]");
    if (!tile) {
      hoveredSlot.current = null;
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    const slot = position < 0.385 ? "left" : position > 0.615 ? "right" : "center";
    // Ignore the tile that slides under the pointer until it leaves this part of the wheel.
    if (slot === hoveredSlot.current) return;
    hoveredSlot.current = slot;

    const index = services.findIndex(service => service.id === tile.dataset.wheelTile);
    if (index >= 0) setSelected(index);
  }

  return (
    <div className="frame hero-grid">
      <div className="hero-copy">
        <h1 id="hero-title">Web za kupce.<br /><span>Alati za vaš tim.</span></h1>
        <p>Pomažemo kupcima da pronađu pravu uslugu ili naruče proizvod. Poslovne alate izrađujemo prema načinu na koji vaš tim radi.</p>
        <div className="hero-actions">
          <QuoteLink />
          <a href="#radovi" className="text-link">Pogledajte radove <Icon name="down" /></a>
        </div>
      </div>
      <div className="mobile-hero-action"><QuoteLink /></div>

      <figure className="service-stage" aria-label="Interaktivni prikaz triju usluga">
        <div className={art.wheelSpace} onPointerMove={selectOnHover} onPointerLeave={() => { hoveredSlot.current = null; }}>
          <div className={art.platform} aria-hidden="true" />
          {services.map((service, index) => (
            <button key={service.id} type="button" className={art.tile} data-feature-theme={service.id}
              data-wheel-tile={service.id} data-slot={slots[wrap(index - selected)]}
              data-color-active={index === selection ? true : undefined}
              aria-label={service.name} aria-pressed={index === selected} aria-controls="wheel-caption"
              onClick={() => setSelected(index)}>
              <FeatureIcon name={service.id} />
            </button>
          ))}
        </div>
        <figcaption className="stage-caption">
          <div><span className="stage-label">Pregled usluga</span><strong id="wheel-caption" aria-live="polite">{services[selected].name}</strong></div>
          <div className="stage-controls">
            <button type="button" onClick={() => setSelected(current => wrap((current ?? 1) - 1))} aria-controls="wheel-caption" aria-label="Prethodna usluga"><Icon name="left" /></button>
            <button type="button" onClick={() => setSelected(current => wrap((current ?? 1) + 1))} aria-controls="wheel-caption" aria-label="Sljedeća usluga"><Icon name="right" /></button>
          </div>
        </figcaption>
        <noscript><style>{".service-stage { display: none }"}</style></noscript>
      </figure>

      <nav id="usluge" className="service-index" aria-label="Odaberite uslugu">
        {services.map((service, index) => (
          <a key={service.id} href={service.href} data-service-choice={service.id}
            onPointerEnter={event => { if (event.pointerType !== "touch") setSelected(index); }}
            onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setSelected(index); }}>
            <FeatureIcon name={service.id} />
            <span><strong>{service.name}</strong><small>{service.goal}</small></span>
            <Icon name="right" className="index-arrow" />
          </a>
        ))}
      </nav>
    </div>
  );
}
