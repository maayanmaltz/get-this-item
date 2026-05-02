import { NextResponse } from "next/server";
import { getPhotos, savePhotos } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  return NextResponse.json(getPhotos());
}

export async function POST(req: Request) {
  const body = await req.json();
  const photos = getPhotos();
  const newPhoto = { itemIds: [], ...body, id: uuidv4() };
  photos.push(newPhoto);
  savePhotos(photos);
  return NextResponse.json(newPhoto, { status: 201 });
}
