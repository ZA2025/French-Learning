import { loadProgress } from "@/lib/kv";

export async function POST(req) {
  try {
    const { learnerId } = await req.json();

    if (!learnerId) {
      return new Response(JSON.stringify({ error: "learnerId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const progress = await loadProgress(learnerId);

    return new Response(JSON.stringify(progress), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading progress:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load progress" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

