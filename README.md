# Ingen dårlige dager

Nettsiden for den norske kortfortellingen *Ingen dårlige dager*. Besøkende kan
lese forordet og laste ned hele boken som gratis PDF.

Bygget med [Next.js](https://nextjs.org) (App Router) og klar for hosting på
[Vercel](https://vercel.com) uten ekstra konfigurasjon.

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Siden kjører da på http://localhost:3000.

## Kommandoer

| Kommando        | Hva den gjør                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Utviklingsserver med hot reload               |
| `npm run build` | Produksjonsbygg                               |
| `npm start`     | Kjører produksjonsbygget lokalt               |
| `npm run lint`  | ESLint                                        |

## Publisere på Vercel

1. Importer dette repoet på [vercel.com/new](https://vercel.com/new).
2. Vercel oppdager Next.js automatisk — la Framework Preset, byggkommando og
   output-katalog stå på standardverdiene.
3. Trykk **Deploy**.

Hver push til `main` gir en ny produksjonsdeploy, og hver pull request får sin
egen forhåndsvisning.

### Miljøvariabler

Ingen er påkrevd. Open Graph-bilder bruker `VERCEL_PROJECT_PRODUCTION_URL`, som
Vercel setter selv. Bruker du et eget domene, kan du sette
`NEXT_PUBLIC_SITE_URL` (f.eks. `https://ingendarligedager.no`) slik at delings-
bilder peker på riktig domene.

## Oppdatere boken

Legg den nye PDF-en over `public/Ingen-darlige-dager.pdf` — filnavnet må være
det samme, siden nedlastingslenken peker dit. Filen serveres med
`Cache-Control: must-revalidate`, så leserne får den nye utgaven med én gang i
stedet for en cachet versjon.

Stemmer ikke sidetallet lenger, oppdater `70 sider` i `app/page.tsx`.

## Struktur

```
app/
  layout.tsx      metadata, Open Graph, språk
  page.tsx        forsiden med forord-dialog og nedlastingsknapper
  globals.css     all styling
  icon.svg        favicon
public/
  Ingen-darlige-dager.pdf     selve boken
  assets/cover-original.jpeg  bokomslaget
```
