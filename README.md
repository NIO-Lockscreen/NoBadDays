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

Ingen er påkrevd for at siden skal virke. Open Graph-bilder bruker
`VERCEL_PROJECT_PRODUCTION_URL`, som Vercel setter selv. Bruker du et eget
domene, kan du sette `NEXT_PUBLIC_SITE_URL` (f.eks.
`https://ingendarligedager.no`) slik at delingsbilder peker på riktig domene.

Sidevisningstelleren trenger en database — se under.

## Sidevisninger

Hvert besøk sender en `POST /api/views`, som øker en teller og svarer med
totaltallet. `GET /api/views` leser tallet uten å telle et besøk.

**Skjult funksjon:** trykk på ankeret ⚓ oppe til venstre **fem ganger raskt
etter hverandre**, så dukker antallet opp under det. Panelet lukkes med krysset,
med `Escape`, eller av seg selv etter åtte sekunder. Trykkene må komme i en
serie — er det mer enn 1,2 sekunder mellom to trykk, nullstilles tellingen.

### Koble på databasen

Telleren lagres i Redis. Uten database faller den tilbake på en teller i minnet
som nullstilles ved hver deploy, og panelet sier fra at tallet er midlertidig.
Slik gjør du det permanent:

1. Gå til prosjektet på Vercel → **Storage** → **Create Database** → velg en
   Redis-database (Upstash i Vercel Marketplace).
2. Koble den til prosjektet. Vercel legger inn `KV_REST_API_URL` og
   `KV_REST_API_TOKEN` automatisk.
3. Redeploy.

`UPSTASH_REDIS_REST_URL` og `UPSTASH_REDIS_REST_TOKEN` virker også, om du setter
opp Upstash direkte i stedet for via Vercel. Vil du teste lokalt, legg de samme
variablene i en `.env.local`.

Merk at telleren teller sidelastinger, ikke unike besøkende — en oppfriskning av
siden teller som en ny visning.

## Oppdatere boken

Legg den nye PDF-en over `public/Ingen-darlige-dager.pdf` — filnavnet må være
det samme, siden nedlastingslenken peker dit. Filen serveres med
`Cache-Control: must-revalidate`, så leserne får den nye utgaven med én gang i
stedet for en cachet versjon.

Stemmer ikke sidetallet lenger, oppdater `70 sider` i `app/page.tsx`.

## Struktur

```
app/
  layout.tsx        metadata, Open Graph, språk
  page.tsx          forsiden med forord-dialog og nedlastingsknapper
  globals.css       all styling
  icon.svg          favicon
  api/views/route.ts  API for sidevisninger
lib/
  views.ts          lagring av telleren (Redis, med fallback i minnet)
public/
  Ingen-darlige-dager.pdf     selve boken
  assets/cover-original.jpeg  bokomslaget
```
