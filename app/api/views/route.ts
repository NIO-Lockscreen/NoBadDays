import { NextResponse } from "next/server";

import { readViews, recordView } from "@/lib/views";

// Telleren må aldri prerendres eller caches.
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

/** Registrerer en ny sidevisning og svarer med det nye totaltallet. */
export async function POST() {
  const count = await recordView();
  return NextResponse.json(count, { headers: NO_STORE });
}

/** Leser totaltallet uten å telle en visning. */
export async function GET() {
  const count = await readViews();
  return NextResponse.json(count, { headers: NO_STORE });
}
