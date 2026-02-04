import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("hero-slides", "max");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
