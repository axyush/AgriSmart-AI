// Crop recommendation via tool calling
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { location, soil, season, water, area, language } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const lang = language || "English";

    const userPrompt = `Recommend the best 4 crops for an Indian farmer with these conditions:
- Location: ${location}
- Soil type: ${soil}
- Season: ${season}
- Water availability: ${water}
- Farm area: ${area || 1} acre(s)

Consider local climate, market demand, and profitability. Respond in ${lang}.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are an expert agronomist for Indian farming. Always respond in ${lang}.` },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_crops",
            description: "Return crop recommendations for the farmer.",
            parameters: {
              type: "object",
              properties: {
                crops: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Crop name in the requested language" },
                      variety: { type: "string", description: "Recommended variety" },
                      yield: { type: "string", description: "Expected yield e.g. '25-30 q/acre'" },
                      profit: { type: "string", description: "Estimated profit per acre in INR e.g. '₹45,000-60,000'" },
                      demand: { type: "string", enum: ["High", "Medium", "Low"] },
                      confidence: { type: "number", description: "Match score 0-100" },
                      tips: { type: "string", description: "One short cultivation tip" },
                    },
                    required: ["name", "variety", "yield", "profit", "demand", "confidence", "tips"],
                  },
                },
              },
              required: ["crops"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_crops" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "rate-limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "payment" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      console.error("gateway error", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "gateway" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return new Response(JSON.stringify({ crops: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("crop-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
