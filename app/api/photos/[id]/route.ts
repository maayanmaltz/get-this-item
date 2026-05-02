import { NextResponse } from "next/server";
import { getPhotos, savePhotos } from "@/lib/data";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const photos = getPhotos();
  const idx = photos.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  photos[idx] = { ...photos[idx], ...body };
  savePhotos(photos);
  return NextResponse.json(photos[idx]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const photos = getPhotos();
  savePhotos(photos.filter((p) => p.id !== params.id));
  return NextResponse.json({ ok: true });
}
