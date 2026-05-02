import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(_: Request, { params }: { params: { filename: string } }) {
  try {
    const filePath = path.join(process.cwd(), "data", "uploads", params.filename);
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
