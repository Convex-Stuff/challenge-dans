import { getHealthStatus } from "@/lib/data/health";

// Checked on every request, never prerendered at build time, when there is no
// database to reach.
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getHealthStatus();
  return Response.json(status, {
    status: status.database === "ok" ? 200 : 503,
  });
}
