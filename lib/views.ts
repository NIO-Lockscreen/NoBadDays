/**
 * Teller for sidevisninger.
 *
 * Lagres i en Redis som snakker Upstash sitt REST-API — det er formatet Vercel
 * bruker når du kobler på en Redis-database fra Marketplace. Uten gyldige
 * variabler (lokal utvikling, eller før databasen er koblet på) faller telleren
 * tilbake til en teller i minnet, slik at siden fortsatt virker. Den fallbacken
 * lever per serverinstans og nullstilles ved deploy, så den er ikke et ekte
 * totaltall — derfor rapporteres `persisted: false` sammen med en `reason`.
 */

const VIEWS_KEY = "ingen-darlige-dager:views";

/** Navnepar de ulike leverandørene bruker, i prioritert rekkefølge. */
const KNOWN_PAIRS: ReadonlyArray<readonly [urlVar: string, tokenVar: string]> = [
  ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  ["REDIS_REST_API_URL", "REDIS_REST_API_TOKEN"],
  ["STORAGE_REST_API_URL", "STORAGE_REST_API_TOKEN"],
];

type RedisConfig = { url: string; token: string; source: string };

export type ViewCount = {
  views: number;
  /** True når tallet kommer fra Redis og overlever deploys. */
  persisted: boolean;
  /** Satt når tallet ikke lagres, slik at feilsøking ikke krever serverlogger. */
  reason?: string;
};

function cleanEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

/**
 * Finner REST-legitimasjonen. Vi leter først etter de kjente navneparene, og
 * faller så tilbake til å lete etter et hvilket som helst `<PREFIX>_REST_API_URL`
 * med tilhørende `<PREFIX>_REST_API_TOKEN` – da treffer vi også leverandører
 * som bruker egne prefikser.
 */
function redisConfig(): RedisConfig | null {
  for (const [urlVar, tokenVar] of KNOWN_PAIRS) {
    const url = cleanEnv(urlVar);
    const token = cleanEnv(tokenVar);
    if (url && token) {
      return { url: url.replace(/\/+$/, ""), token, source: urlVar };
    }
  }

  for (const name of Object.keys(process.env)) {
    if (!name.endsWith("_REST_API_URL")) continue;
    const prefix = name.slice(0, -"_REST_API_URL".length);
    const url = cleanEnv(name);
    const token = cleanEnv(`${prefix}_REST_API_TOKEN`);
    if (url && token) {
      return { url: url.replace(/\/+$/, ""), token, source: name };
    }
  }

  return null;
}

/**
 * Rapporterer hvilke relevante miljøvariabler som finnes – kun navn, aldri
 * verdier. Brukes av /api/views/debug for å se hva Vercel faktisk har satt.
 */
export function diagnose(): {
  detected: string[];
  usable: string | null;
  hint: string;
} {
  const detected = Object.keys(process.env)
    .filter((name) => /^(KV_|UPSTASH_|REDIS|STORAGE_)/.test(name) || name.includes("_REST_API_"))
    .sort();

  const config = redisConfig();
  if (config) {
    return {
      detected,
      usable: config.source,
      hint: "REST-legitimasjon funnet. Er telleren likevel ikke lagret, svarer databasen med feil – se `reason` fra /api/views.",
    };
  }

  const tcpOnly = detected.some((name) =>
    /^(REDIS_URL|KV_URL|.*_URL)$/.test(name) && cleanEnv(name).startsWith("redis"),
  );

  return {
    detected,
    usable: null,
    hint: tcpOnly
      ? "Fant bare en redis://-adresse (TCP). Denne databasen har ikke REST-API. Velg Upstash i Vercel Marketplace, eller si fra så bytter jeg til en TCP-klient."
      : detected.length === 0
        ? "Ingen Redis-variabler nådde denne deployen. Sjekk at databasen er koblet til dette prosjektet, at variablene gjelder Production, og redeploy."
        : "Variabler finnes, men ingen komplett REST-par (URL + TOKEN). Se listen over.",
  };
}

let memoryViews = 0;

async function redisCommand(
  config: RedisConfig,
  path: string,
): Promise<number> {
  const response = await fetch(`${config.url}/${path}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fra ${config.source}`);
  }

  const body = (await response.json()) as { result?: number | string | null };
  const value = Number(body.result ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function fallback(reason: string, increment: boolean): ViewCount {
  if (increment) memoryViews += 1;
  return { views: memoryViews, persisted: false, reason };
}

/** Øker telleren med én og returnerer det nye totaltallet. */
export async function recordView(): Promise<ViewCount> {
  const config = redisConfig();
  if (!config) return fallback("mangler-legitimasjon", true);

  try {
    const views = await redisCommand(
      config,
      `incr/${encodeURIComponent(VIEWS_KEY)}`,
    );
    return { views, persisted: true };
  } catch (error) {
    // En nede database skal ikke ta ned forsiden — tell videre i minnet.
    console.error("Kunne ikke registrere sidevisning:", error);
    return fallback(`redis-feil: ${(error as Error).message}`, true);
  }
}

/** Leser telleren uten å øke den. */
export async function readViews(): Promise<ViewCount> {
  const config = redisConfig();
  if (!config) return fallback("mangler-legitimasjon", false);

  try {
    const views = await redisCommand(
      config,
      `get/${encodeURIComponent(VIEWS_KEY)}`,
    );
    return { views, persisted: true };
  } catch (error) {
    console.error("Kunne ikke lese sidevisninger:", error);
    return fallback(`redis-feil: ${(error as Error).message}`, false);
  }
}
