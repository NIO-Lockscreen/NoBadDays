"use client";

import Image from "next/image";
import { useRef } from "react";

const bookHref = "/Ingen-darlige-dager.pdf";

export default function Home() {
  const forewordDialog = useRef<HTMLDialogElement>(null);

  const openForeword = () => forewordDialog.current?.showModal();

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="nav-wrap" aria-label="Hovedmeny">
          <a className="wordmark" href="#top" aria-label="Ingen dårlige dager – til toppen">
            <span className="wordmark-mark" aria-hidden="true">⚓</span>
            <span>Ingen dårlige dager</span>
          </a>
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
              Hva ville skje dersom vi kunne fjerne alt som gjør vondt,
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
                    src="/assets/cover-original.jpeg"
                    alt="En lang Kiwi-kvittering festet til et kjøleskap med en rund magnet med blått anker"
                    width={1086}
                    height={1448}
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
              kunne fjerne alt som gjør vondt, uten å fjerne selve livet?
            </p>
            <p className="foreword-signoff">Jeg håper du liker svaret.</p>
          </article>
        </div>
      </dialog>
    </div>
  );
}
