import type { NextRequest } from "next/server";

// Deprecated endpoint kept to maintain backward compatibility with older clients.
// Use /api/upload instead.
export async function POST(_req: NextRequest) {
  return new Response(
    JSON.stringify({ error: "Deprecated endpoint. Use /api/upload instead." }),
    {
      status: 410,
      headers: { "content-type": "application/json" },
    }
  );
}

export async function GET() {
  return new Response("Not Found", { status: 404 });
}
