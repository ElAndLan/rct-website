
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidateTag("hero-slides", "max");
  revalidateTag("shows", "max"); 
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
