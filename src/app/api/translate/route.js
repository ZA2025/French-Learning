export async function POST(req) {
    try {
      const { text } = await req.json();
  
      if (!text) {
        return new Response(JSON.stringify({ error: "No text provided" }), {
          status: 400,
        });
      }
  
      const key = process.env.GOOGLE_TRANSLATE_KEY;
  
      const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
  
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "fr",
          target: "en",
          format: "text",
        }),
      });
  
      const data = await response.json();
  
      const translated =
        data?.data?.translations?.[0]?.translatedText || text;
  
      return new Response(JSON.stringify({ translation: translated }), {
        status: 200,
      });
    } catch (err) {
      console.error("Translation API error:", err);
      return new Response(JSON.stringify({ translation: text }), {
        status: 200,
      });
    }
  }