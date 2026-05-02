import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(req: Request) {
  const body = await req.json();
  const current = getSettings();
  const updated = { ...current, ...body };
  saveSettings(updated);
  return NextResponse.json(updated);
}
