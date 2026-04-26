// Disease detection from image (vision + structured output)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, language } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
    if (!image) throw new Error("image required");

    const lang = language || "English";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert plant pathologist for Indian agriculture. Analyze crop leaf images and identify diseases or pests. If healthy, say so. Always respond in ${lang}.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this crop image and identify any disease or pest. Respond in ${lang}.` },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_diagnosis",
            description: "Report the diagnosis from the leaf image.",
            parameters: {
              type: "object",
              properties: {
                healthy: { type: "boolean" },
                crop: { type: "string", description: "Detected crop e.g. Rice, Wheat, Tomato" },
                disease: { type: "string", description: "Disease name (empty if healthy)" },
                confidence: { type: "number", description: "0-100" },
                severity: { type: "string", enum: ["Low", "Moderate", "High"] },
                causes: { type: "array", items: { type: "string" }, description: "2-3 short bullet points" },
                treatment: { type: "array", items: { type: "string" }, description: "3-5 actionable steps" },
                prevention: { type: "array", items: { type: "string" }, description: "2-3 prevention tips" },
              },
              required: ["healthy", "crop", "disease", "confidence", "severity", "causes", "treatment", "prevention"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_diagnosis" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "rate-limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "payment" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      console.error("gateway error", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "gateway" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) return new Response(JSON.stringify({ error: "no result" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const args = JSON.parse(tc.function.arguments);
    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("disease-detect error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
