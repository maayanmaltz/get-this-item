import { NextResponse } from "next/server";
import { getItems, saveItems } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  return NextResponse.json(getItems());
}

export async function POST(req: Request) {
  const body = await req.json();
  const items = getItems();
  const newItem = { ...body, id: uuidv4() };
  items.push(newItem);
  saveItems(items);
  return NextResponse.json(newItem, { status: 201 });
}
