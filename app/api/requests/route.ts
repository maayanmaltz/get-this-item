import { NextResponse } from "next/server";
import { getRequests, saveRequests } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const requests = getRequests();
  return NextResponse.json(requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const requests = getRequests();
  const newRequest = { ...body, id: uuidv4(), createdAt: new Date().toISOString() };
  requests.push(newRequest);
  saveRequests(requests);
  return NextResponse.json(newRequest, { status: 201 });
}
