import { NextResponse } from "next/server";

import { diagnose } from "@/lib/views";

export const dynamic = "force-dynamic";

/**
 * Feilsøkingsendepunkt for tellerens databaseoppsett. Rapporterer kun *navnene*
 * på relevante miljøvariabler — aldri verdiene — så det er trygt å åpne i
 * nettleseren. Kan fjernes når telleren virker.
 */
export async function GET() {
  return NextResponse.json(diagnose(), {
    headers: { "cache-control": "no-store" },
  });
}
