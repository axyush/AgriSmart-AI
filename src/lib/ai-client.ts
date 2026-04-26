import { Lang, LANG_NAMES } from "@/i18n/translations";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type ChatMsg = {
  role: "user" | "assistant";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

export async function streamAssistant(opts: {
  messages: ChatMsg[];
  lang: Lang;
  onDelta: (chunk: string) => void;
}): Promise<void> {
  const resp = await fetch(`${FN_BASE}/agri-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify({
      messages: opts.messages,
      language: LANG_NAMES[opts.lang],
    }),
  });

  if (resp.status === 429) throw new Error("rate-limit");
  if (resp.status === 402) throw new Error("payment");
  if (!resp.ok || !resp.body) throw new Error("server");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line || line.startsWith(":")) continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) opts.onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
}

export async function callJson<T>(endpoint: string, payload: unknown): Promise<T> {
  const resp = await fetch(`${FN_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify(payload),
  });
  if (resp.status === 429) throw new Error("rate-limit");
  if (resp.status === 402) throw new Error("payment");
  if (!resp.ok) throw new Error("server");
  return resp.json() as Promise<T>;
}
