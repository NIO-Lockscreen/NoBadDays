"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const bookHref = "/Ingen-darlige-dager.pdf";

/** Antall trykk på ankeret som avslører tellerpanelet. */
const ANCHOR_TAPS = 5;
/** Trykkene må komme i en serie – en enslig klikk skal ikke telle med senere. */
const TAP_RESET_MS = 1200;
/** Panelet lukker seg selv igjen etter en stund. */
const PANEL_TIMEOUT_MS = 8000;

type ViewCount = { views: number; persisted: boolean };

export default function Home() {
  const forewordDialog = useRef<HTMLDialogElement>(null);
  const [viewCount, setViewCount] = useState<ViewCount | null>(null);
  const [showViews, setShowViews] = useState(false);
  const taps = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCounted = useRef(false);

  const openForeword = () => forewordDialog.current?.showModal();

  // Registrer besøket. Guarden holder mot React StrictMode, som kjører
  // effekter to ganger i utvikling og ellers ville telt hvert besøk dobbelt.
  useEffect(() => {
    if (hasCounted.current) return;
    hasCounted.current = true;

    let active = true;
    fetch("/api/views", { method: "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ViewCount | null) => {
        if (active && data) setViewCount(data);
      })
      .catch(() => {
        // Teller siden er en bonus – feiler den, skal siden være uberørt.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  // Skjult funksjon: fem trykk på ankeret viser antall sidevisninger.
  const handleAnchorTap = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (tapTimer.current) clearTimeout(tapTimer.current);
    taps.current += 1;

    if (taps.current >= ANCHOR_TAPS) {
      taps.current = 0;
      setShowViews(true);
      return;
    }

    tapTimer.current = setTimeout(() => {
      taps.current = 0;
    }, TAP_RESET_MS);
  }, []);

  useEffect(() => {
    if (!showViews) return;

    const hide = () => setShowViews(false);
    const timer = setTimeout(hide, PANEL_TIMEOUT_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showViews]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="nav-wrap" aria-label="Hovedmeny">
          <div className="wordmark-slot">
            <a className="wordmark" href="#top" aria-label="Ingen dårlige dager – til toppen">
              {/* Dekorativt for skjermlesere – og skjult snarvei til telleren. */}
              <span className="wordmark-mark" aria-hidden="true" onClick={handleAnchorTap}>
                ⚓
              </span>
              <span>Ingen dårlige dager</span>
            </a>

            {showViews && (
              <div className="views-pop" role="status">
                <p className="views-pop-label">Sidevisninger</p>
                <p className="views-pop-count">
                  {viewCount ? viewCount.views.toLocaleString("nb-NO") : "…"}
                </p>
                {viewCount && !viewCount.persisted && (
                  <p className="views-pop-note">
                    Midlertidig telling – koble til en Redis-database i Vercel.
                  </p>
                )}
                <button
                  className="views-pop-close"
                  type="button"
                  onClick={() => setShowViews(false)}
                  aria-label="Lukk sidevisninger"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="nav-links">
            <button className="nav-foreword" type="button" onClick={openForeword}>
              Forord
            </button>
            <a className="nav-download" href={bookHref} download="Ingen dårlige dager.pdf">
              Last ned boken
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="book-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> En norsk kortfortelling</p>
            <h1 id="book-title">
              Ingen
              <span>dårlige dager</span>
            </h1>
            <p className="hero-question">
              Hva ville skje dersom vi kunne fjerne alt som gjør livet vondt,
              uten å fjerne selve livet?
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={bookHref} download="Ingen dårlige dager.pdf">
                <span>Last ned gratis PDF</span>
                <span aria-hidden="true">↓</span>
              </a>
              <button className="button button-quiet" type="button" onClick={openForeword}>
                Les forordet <span aria-hidden="true">↗</span>
              </button>
            </div>
            <dl className="book-meta" aria-label="Informasjon om boken">
              <div><dt>Format</dt><dd>PDF</dd></div>
              <div><dt>Språk</dt><dd>Norsk</dd></div>
              <div><dt>Lengde</dt><dd>70 sider</dd></div>
            </dl>
          </div>

          <div className="hero-art" aria-label="Bokomslaget til Ingen dårlige dager">
            <div className="cover-frame">
              <div className="frame-bevel">
                <div className="frame-mat">
                  <Image
                    src="/assets/cover.jpg"
                    alt="Bokomslaget: tittelen Ingen dårlige dager og forfatternavnet Thomas Davis ved siden av en lang kvittering festet med en rund magnet med blått anker"
                    width={1222}
                    height={1398}
                    sizes="(max-width: 640px) 88vw, 416px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <dialog
        className="foreword-dialog"
        ref={forewordDialog}
        aria-labelledby="foreword-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) forewordDialog.current?.close();
        }}
      >
        <div className="dialog-card">
          <div className="dialog-heading">
            <div>
              <p className="dialog-kicker">Før du begynner</p>
              <h2 id="foreword-title">Forord</h2>
            </div>
            <button
              className="dialog-close"
              type="button"
              onClick={() => forewordDialog.current?.close()}
              aria-label="Lukk forordet"
            >
              ×
            </button>
          </div>
          <article className="foreword-text">
            <p>
              Dette er en historie jeg har hatt i hodet lenge. Den har ligget
              der som en idé jeg stadig har vendt tilbake til, uten helt å vite
              hvordan jeg skulle få den ned på papiret. Kanskje var det fordi
              jeg ikke bare måtte finne historien, men også forstå hvorfor jeg
              ønsket å fortelle den.
            </p>
            <p>
              Jeg har mange slike historier i hodet. Små ideer, scener og
              personer som venter på at jeg skal gjøre dem ferdige.
              Forhåpentligvis er dette bare den første av mange. Av historiene
              som foreløpig finnes der inne, er nok denne den mest personlige.
              Ikke fordi Daniels liv er mitt, men fordi noe av det han strever
              med, er gjenkjennelig.
            </p>
            <p>
              Jeg skal ikke påstå at jeg er emosjonelt ustabil. Snarere tvert
              imot. I likhet med Daniel kan jeg til tider lide av en slags
              uvanlig stabilitet. Jeg tar meg ofte i å glatte over friksjon,
              unngå ubehag og gjøre livet så enkelt og behagelig som mulig. Det
              høres kanskje ikke ut som et problem. Men noen ganger kan det å
              beskytte seg mot alt som er vanskelig, også bety at man beskytter
              seg mot det som gjør livet virkelig.
            </p>
            <p>
              Denne historien begynte med et spørsmål: Hva ville skje dersom vi
              kunne fjerne alt som gjør livet vondt, uten å fjerne selve livet?
            </p>
            <p className="foreword-signoff">Jeg håper du liker svaret.</p>
          </article>
        </div>
      </dialog>
    </div>
  );
}
