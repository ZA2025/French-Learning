import { createClient } from "redis";

export async function POST(req) {
  try {
    // Security check: Require admin secret in production, allow open access in development
    const adminSecret = process.env.ADMIN_SECRET;
    const isDevelopment = process.env.NODE_ENV === "development";

    const body = await req.json();
    const { key } = body;

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Key is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // In production, require password
    if (!isDevelopment) {
      const authHeader = req.headers.get("authorization");
      const providedSecret = authHeader?.replace("Bearer ", "");

      if (!adminSecret || providedSecret !== adminSecret) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return new Response(
        JSON.stringify({ error: "REDIS_URL not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = createClient({
      url: redisUrl,
    });

    await client.connect();

    let deleted = false;

    // If deleting a profile, get the profile data FIRST before deleting
    if (key.startsWith("profile:")) {
      const profileStr = await client.get(key);
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          const learnerId = profile.learnerId;
          // Delete code mapping
          await client.del(`code:${profile.code}`);
          // Delete progress
          await client.del(`progress:${learnerId}`);
          deleted = true;
        } catch (e) {
          console.error("Error parsing profile for cleanup:", e);
        }
      }
    }
    // If deleting a code, get the learnerId FIRST before deleting
    else if (key.startsWith("code:")) {
      const learnerId = await client.get(key);
      if (learnerId) {
        await client.del(`profile:${learnerId}`);
        await client.del(`progress:${learnerId}`);
        deleted = true;
      }
    }

    // Delete the key itself (works for all cases)
    await client.del(key);

    await client.disconnect();

    const message = deleted
      ? "Profile and related data deleted successfully"
      : "Key deleted successfully";

    return new Response(
      JSON.stringify({ success: true, message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting key:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete key" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

