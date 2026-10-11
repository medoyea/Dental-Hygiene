const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const apiKey = request.headers.get("apikey");
  if (!authorization || !apiKey) return json({ error: "Sign in to translate content." }, 401);

  // Edge Function JWT verification accepts the project's anon token too, so also
  // confirm this bearer token maps to a real signed-in Supabase user.
  const userResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: apiKey },
  });
  if (!userResponse.ok) return json({ error: "A signed-in staff account is required." }, 401);

  const deepLKey = Deno.env.get("DEEPL_AUTH_KEY");
  if (!deepLKey) return json({ error: "Translation is not configured." }, 503);

  let body: { texts?: unknown; target_language?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const texts = body.texts;
  const target = body.target_language;
  if (!Array.isArray(texts) || texts.length < 1 || texts.length > 50 ||
      !texts.every((text) => typeof text === "string" && text.trim().length > 0 && text.length <= 12000) ||
      (target !== "ar" && target !== "en")) {
    return json({ error: "Provide 1–50 non-empty text fields and target_language 'ar' or 'en'." }, 400);
  }

  // This project is configured for DeepL API Free. Switch this URL only if the
  // account is later upgraded to the separate API Pro plan.
  const endpoint = "https://api-free.deepl.com/v2/translate";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${deepLKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts, target_lang: target === "ar" ? "AR" : "EN-US" }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("DeepL translation error", response.status, result);
      return json({ error: response.status === 456 ? "Monthly translation quota exceeded." : "Translation provider rejected the request." }, response.status === 456 ? 429 : 502);
    }
    return json({ translations: result.translations?.map((entry: { text: string }) => entry.text) ?? [] });
  } catch (error) {
    console.error("DeepL request failed", error);
    return json({ error: "Could not reach the translation provider." }, 502);
  }
});
