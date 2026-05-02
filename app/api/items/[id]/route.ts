import { NextResponse } from "next/server";
import { getItems, saveItems, getPhotos, savePhotos } from "@/lib/data";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const items = getItems();
  const idx = items.findIndex((i) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  items[idx] = { ...items[idx], ...body };
  saveItems(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // Remove item from all photos too
  const photos = getPhotos();
  photos.forEach((p) => { p.itemIds = p.itemIds.filter((id) => id !== params.id); });
  savePhotos(photos);

  const items = getItems();
  saveItems(items.filter((i) => i.id !== params.id));
  return NextResponse.json({ ok: true });
}
