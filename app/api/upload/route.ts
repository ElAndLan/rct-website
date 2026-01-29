import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is missing");
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is missing from server environment" },
      { status: 500 },
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN, // Explicitly pass the token
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // console.log("Generating token for:", pathname);
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
          tokenPayload: JSON.stringify({
            // optional payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: Save to database here if you want to track uploads immediately
        // console.log('blob uploaded', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in /api/upload:", error);
    // Return the specific error message to help debugging
    return NextResponse.json(
      { error: (error as Error).message, stack: (error as Error).stack },
      { status: 400 },
    );
  }
}
