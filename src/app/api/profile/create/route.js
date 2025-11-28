import { createProfile } from "@/lib/kv";

export async function POST(req) {
  try {
    const { nickname } = await req.json();

    const profile = await createProfile(nickname || "");

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

