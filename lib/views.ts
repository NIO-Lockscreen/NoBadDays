/**
 * Teller for sidevisninger.
 *
 * Lagres i en Upstash-kompatibel Redis over REST-APIet — det er miljøvariablene
 * Vercel injiserer når du kobler en Redis-database til prosjektet. Uten dem
 * (lokal utvikling, eller før databasen er koblet på) faller telleren tilbake
 * til en teller i minnet, slik at siden fortsatt virker. Den fallbacken lever
 * per serverinstans og nullstilles ved deploy, så den er ikke et ekte totaltall
 * — derfor rapporteres `persisted: false` sammen med tallet.
 */

const VIEWS_KEY = "ingen-darlige-dager:views";

type RedisConfig = { url: string; token: string };

export type ViewCount = {
  views: number;
  /** True når tallet kommer fra Redis og overlever deploys. */
  persisted: boolean;
};

function redisConfig(): RedisConfig | null {
  // Vercel-integrasjonen setter KV_*; Upstash direkte setter UPSTASH_*.
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
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
    throw new Error(`Redis-kall ${path} feilet med ${response.status}`);
  }

  const body = (await response.json()) as { result?: number | string | null };
  const value = Number(body.result ?? 0);
  return Number.isFinite(value) ? value : 0;
}

/** Øker telleren med én og returnerer det nye totaltallet. */
export async function recordView(): Promise<ViewCount> {
  const config = redisConfig();
  if (!config) {
    memoryViews += 1;
    return { views: memoryViews, persisted: false };
  }

  try {
    const views = await redisCommand(config, `incr/${encodeURIComponent(VIEWS_KEY)}`);
    return { views, persisted: true };
  } catch (error) {
    // En nede database skal ikke ta ned forsiden — tell videre i minnet.
    console.error("Kunne ikke registrere sidevisning:", error);
    memoryViews += 1;
    return { views: memoryViews, persisted: false };
  }
}

/** Leser telleren uten å øke den. */
export async function readViews(): Promise<ViewCount> {
  const config = redisConfig();
  if (!config) {
    return { views: memoryViews, persisted: false };
  }

  try {
    const views = await redisCommand(config, `get/${encodeURIComponent(VIEWS_KEY)}`);
    return { views, persisted: true };
  } catch (error) {
    console.error("Kunne ikke lese sidevisninger:", error);
    return { views: memoryViews, persisted: false };
  }
}
