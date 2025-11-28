import { saveProgress } from "@/lib/kv";

export async function POST(req) {
  try {
    const { learnerId, progress } = await req.json();

    if (!learnerId) {
      return new Response(JSON.stringify({ error: "learnerId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!progress) {
      return new Response(JSON.stringify({ error: "progress is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await saveProgress(learnerId, progress);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save progress" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

