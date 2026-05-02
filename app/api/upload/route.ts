import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Convert any format (incl. HEIC) to JPEG, resize to max 1200px
  const converted = await sharp(buffer)
    .rotate() // auto-rotate based on EXIF
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const filename = `${uuidv4()}.jpg`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true }); // ensure dir exists
  await writeFile(path.join(uploadsDir, filename), converted);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
