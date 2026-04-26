import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Mic, Image as ImageIcon, Lightbulb, TrendingUp,
  AlertCircle, Share2, Info, X, User, ThumbsUp, ThumbsDown, Save, Clock, WifiOff
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { streamAssistant, type ChatMsg } from "@/lib/ai-client";
import { useOnline } from "@/hooks/use-online";
import { KEYS, lsGet, pushHistory, type ChatHistoryItem } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  validateSearch: (search: Record<string, unknown>): { history?: string } => ({
    history: typeof search.history === "string" ? search.history : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Assistant — AgriSmart AI" },
      { name: "description", content: "Talk to AgriSmart AI in your language. Ask farming questions via text, voice, or image." },
      { property: "og:title", content: "AI Farming Assistant — AgriSmart AI" },
      { property: "og:description", content: "Multilingual AI advisor for crop, pest, and market questions." },
    ],
  }),
  component: Assistant,
});

interface Msg { role: "user" | "assistant"; text: string; image?: string; ts: string; }

function Assistant() {
  const { t, lang } = useLang();
  const online = useOnline();
  const navigate = useNavigate({ from: "/assistant" });
  const { history } = Route.useSearch();

  const [input, setInput] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [viewingHistory, setViewingHistory] = useState<ChatHistoryItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<any>(null);

  // Reset greeting on language change
  useEffect(() => {
    if (!history) {
      setMessages([{ role: "assistant", text: t("ai.greeting"), ts: nowTime() }]);
    }
    // eslint-disable-next-line
  }, [lang]);

  // Load chat from history
  useEffect(() => {
    if (!history) { setViewingHistory(null); return; }
    const list = lsGet<ChatHistoryItem[]>(KEYS.chatHistory, []);
    const item = list.find((x) => x.id === history);
    if (item) {
      setViewingHistory(item);
      setMessages(item.messages.map((m) => ({ ...m })));
    }
  }, [history]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const exitHistory = () => {
    setViewingHistory(null);
    setMessages([{ role: "assistant", text: t("ai.greeting"), ts: nowTime() }]);
    navigate({ search: { history: undefined } });
  };

  const saveCurrentChat = () => {
    const userMsgs = messages.filter((m) => m.role === "user");
    const aiMsgs = messages.filter((m) => m.role === "assistant" && m.text);
    if (userMsgs.length === 0) { toast.error(t("hist.empty.chats")); return; }
    const title = userMsgs[0].text.slice(0, 80);
    const preview = aiMsgs[aiMsgs.length - 1]?.text.slice(0, 140) || "";
    pushHistory<ChatHistoryItem>(KEYS.chatHistory, {
      id: crypto.randomUUID(),
      title,
      preview,
      messages: messages.map((m) => ({ role: m.role, text: m.text, image: m.image, ts: m.ts })),
      lang,
      createdAt: Date.now(),
    });
    toast.success(t("common.save"));
  };

  const onSend = async (textOverride?: string) => {
    if (viewingHistory) exitHistory();
    const text = (textOverride ?? input).trim();
    if (!text && !imageData) return;
    if (busy) return;
    if (!online) { toast.error(t("offline.aiUnavailable")); return; }

    const userMsg: Msg = { role: "user", text: text || "(image)", image: imageData ?? undefined, ts: nowTime() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    const sentImage = imageData;
    setImageData(null);
    setBusy(true);

    const aiMessages: ChatMsg[] = messages.map((m) => ({ role: m.role, content: m.text }));
    const userContent: ChatMsg["content"] = sentImage
      ? [{ type: "text", text: text || "Analyze this crop image" }, { type: "image_url", image_url: { url: sentImage } }]
      : text;
    aiMessages.push({ role: "user", content: userContent });

    let acc = "";
    setMessages((m) => [...m, { role: "assistant", text: "", ts: nowTime() }]);
    try {
      await streamAssistant({
        messages: aiMessages,
        lang,
        onDelta: (chunk) => {
          acc += chunk;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { ...copy[copy.length - 1], text: acc };
            return copy;
          });
        },
      });
    } catch (e: any) {
      setMessages((m) => m.slice(0, -1));
      const code = e?.message;
      if (code === "rate-limit") toast.error(t("ai.errorRate"));
      else if (code === "payment") toast.error(t("ai.errorPay"));
      else toast.error(t("ai.errorGeneric"));
    } finally {
      setBusy(false);
    }
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5 MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(f);
  };

  const toggleVoice = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error("Voice input not supported on this browser"); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = ({ en: "en-IN", hi: "hi-IN", pa: "pa-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN" } as any)[lang] || "en-IN";
    r.interimResults = false;
    r.onresult = (ev: any) => setInput((prev) => (prev ? prev + " " : "") + ev.results[0][0].transcript);
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8 grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-info" />
              <h3 className="font-bold">{t("ai.trending")}</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                { icon: <Lightbulb className="h-4 w-4 text-warning" />, label: t("ai.trending.organic") },
                { icon: <TrendingUp className="h-4 w-4 text-info" />, label: t("ai.trending.drip") },
                { icon: <AlertCircle className="h-4 w-4 text-destructive" />, label: t("ai.trending.pest") },
              ].map((it) => (
                <li key={it.label}>
                  <button onClick={() => onSend(it.label)} className="w-full text-start flex items-center gap-3 rounded-xl border border-transparent hover:border-border bg-background/40 p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">{it.icon}</span>
                    <span className="text-sm font-semibold">{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-bold">{t("ai.proTip")}</h3>
            </div>
            <p className="text-sm opacity-95 leading-relaxed">{t("ai.proTipText")}</p>
          </div>
        </aside>

        <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col h-[calc(100vh-7rem)] min-h-[600px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">{t("ai.title")}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-success inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
                  {online ? t("ai.online") : (<span className="text-warning inline-flex items-center gap-1"><WifiOff className="h-3 w-3" />Offline</span>)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {viewingHistory ? (
                <button onClick={exitHistory} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <X className="h-3.5 w-3.5" /> {t("hist.exit")}
                </button>
              ) : (
                <button onClick={saveCurrentChat} aria-label={t("common.save")} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <Save className="h-3.5 w-3.5" /> {t("common.save")}
                </button>
              )}
              <button aria-label="Share" className="h-9 w-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Share2 className="h-4 w-4" /></button>
              <button aria-label="Info" className="h-9 w-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Info className="h-4 w-4" /></button>
            </div>
          </div>

          {viewingHistory && (
            <div className="bg-primary/5 border-b border-primary/20 px-4 py-2 text-xs font-semibold text-primary inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> {t("hist.viewing")} • {new Date(viewingHistory.createdAt).toLocaleString()}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5" role="log" aria-live="polite" aria-label={t("ai.title")}>
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} thinking={busy && i === messages.length - 1 && m.role === "assistant" && !m.text} thinkingLabel={t("ai.thinking")} />
            ))}
            {messages.length <= 1 && !viewingHistory && (
              <div className="flex flex-wrap gap-2 pt-2">
                {[t("ai.suggested.fertilizer"), t("ai.suggested.pests"), t("ai.suggested.profit")].map((q) => (
                  <button key={q} onClick={() => onSend(q)} className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-primary/15 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 bg-background/30">
            {imageData && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-card pr-2">
                <img src={imageData} alt="attachment" className="h-12 w-12 object-cover rounded-l-lg" />
                <span className="text-xs">{t("ai.imageAttached")}</span>
                <button onClick={() => setImageData(null)} aria-label={t("common.cancel")} className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="h-11 w-11 shrink-0 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={t("ai.image")}>
                <ImageIcon className="h-4 w-4" />
              </button>
              <button onClick={toggleVoice} className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${listening ? "border-destructive bg-destructive/10 text-destructive animate-pulse-soft" : "border-border bg-card hover:bg-muted"}`} aria-label={t("ai.voice")} aria-pressed={listening}>
                <Mic className="h-4 w-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                placeholder={t("ai.placeholder")}
                aria-label={t("ai.placeholder")}
                rows={1}
                disabled={!online}
                className="flex-1 min-h-11 max-h-32 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
              <button onClick={() => onSend()} disabled={busy || !online || (!input.trim() && !imageData)} className="h-11 w-11 shrink-0 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={t("ai.send")}>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MessageBubble({ m, thinking, thinkingLabel }: { m: Msg; thinking: boolean; thinkingLabel: string }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${isUser ? "bg-info/15 text-info" : "bg-primary/15 text-primary"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-muted/60 rounded-tl-md"}`}>
          {m.image && <img src={m.image} alt="upload" className="mb-2 max-w-xs rounded-lg" />}
          {thinking ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" />
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
              </span>
              {thinkingLabel}
            </span>
          ) : m.text}
        </div>
        <div className={`flex items-center gap-2 px-2 ${isUser ? "flex-row-reverse" : ""}`}>
          {!isUser && !thinking && (
            <>
              <button aria-label="Helpful" className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"><ThumbsUp className="h-3 w-3" /></button>
              <button aria-label="Not helpful" className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"><ThumbsDown className="h-3 w-3" /></button>
            </>
          )}
          <span className="text-[10px] text-muted-foreground">{m.ts}</span>
        </div>
      </div>
    </div>
  );
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
