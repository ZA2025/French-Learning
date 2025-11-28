import { createClient } from "redis";

export async function GET(req) {
  try {
    // Security check: Require admin secret in production, allow open access in development
    const adminSecret = process.env.ADMIN_SECRET;
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // In development, allow access without password
    if (!isDevelopment) {
      // Production mode: require password
      const authHeader = req.headers.get("authorization");
      const url = new URL(req.url);
      const secretParam = url.searchParams.get("secret");
      
      const providedSecret = authHeader?.replace("Bearer ", "") || secretParam;
      
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

    // Get all keys (you can filter by pattern if needed)
    const allKeys = await client.keys("*");

    // Optionally, get values for each key
    const keysWithValues = await Promise.all(
      allKeys.map(async (key) => {
        const value = await client.get(key);
        let parsedValue = value;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // If it's not JSON, keep as string
        }
        return {
          key,
          value: parsedValue,
          type: typeof parsedValue,
        };
      })
    );

    await client.disconnect();

    return new Response(
      JSON.stringify({
        total: allKeys.length,
        keys: keysWithValues,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching keys:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch keys" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

