import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Camera, Bug, Loader2, Clock, CheckCircle2, AlertTriangle, Info, X, Sparkles, WifiOff
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { LANG_NAMES } from "@/i18n/translations";
import { callJson } from "@/lib/ai-client";
import { useOnline } from "@/hooks/use-online";
import {
  KEYS, lsGet, lsSet, pushHistory,
  type DiseaseHistoryItem,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/diseases")({
  validateSearch: (search: Record<string, unknown>): { history?: string } => ({
    history: typeof search.history === "string" ? search.history : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Disease Detection — AgriSmart AI" },
      { name: "description", content: "AI crop diagnostic tool — upload a leaf photo and get instant disease identification with treatment recommendations." },
      { property: "og:title", content: "AI Crop Diagnostic Tool — AgriSmart AI" },
      { property: "og:description", content: "Identify 100+ crop diseases and pests from a photo." },
    ],
  }),
  component: DiseasesPage,
});

interface Diagnosis {
  healthy: boolean;
  crop: string;
  disease: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  causes: string[];
  treatment: string[];
  prevention: string[];
}

interface CachedScan {
  thumbnail: string;
  result: Diagnosis;
  savedAt: number;
}

// Downscale a data URL image to a small thumbnail for compact storage.
async function makeThumbnail(dataUrl: string, max = 320): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(c.toDataURL("image/jpeg", 0.7)); } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function DiseasesPage() {
  const { t, lang } = useLang();
  const online = useOnline();
  const navigate = useNavigate({ from: "/diseases" });
  const { history } = Route.useSearch();

  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [recent, setRecent] = useState<DiseaseHistoryItem[]>([]);
  const [cached, setCached] = useState<CachedScan | null>(null);
  const [viewingHistory, setViewingHistory] = useState<DiseaseHistoryItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Mount: load cache + recent
  useEffect(() => {
    setCached(lsGet<CachedScan | null>(KEYS.diseaseLast, null));
    setRecent(lsGet<DiseaseHistoryItem[]>(KEYS.diseaseHistory, []).slice(0, 4));
  }, []);

  // History deep-link
  useEffect(() => {
    if (!history) { setViewingHistory(null); return; }
    const list = lsGet<DiseaseHistoryItem[]>(KEYS.diseaseHistory, []);
    const item = list.find((x) => x.id === history);
    if (item) {
      setViewingHistory(item);
      setImage(item.thumbnail);
      setResult(item.result);
    }
  }, [history]);

  const exitHistory = () => {
    setViewingHistory(null);
    setImage(null); setResult(null);
    navigate({ search: { history: undefined } });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5 MB)"); return; }
    const r = new FileReader();
    r.onload = () => { setImage(r.result as string); setResult(null); setViewingHistory(null); };
    r.readAsDataURL(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImage(r.result as string); setResult(null); setViewingHistory(null); };
    r.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!image) return;
    if (!online) { toast.error(t("offline.aiUnavailable")); return; }
    setBusy(true); setResult(null);
    try {
      const d = await callJson<Diagnosis>("disease-detect", { image, language: LANG_NAMES[lang] });
      setResult(d);
      const thumb = await makeThumbnail(image);
      // Cache last
      const cache: CachedScan = { thumbnail: thumb, result: d, savedAt: Date.now() };
      lsSet(KEYS.diseaseLast, cache);
      setCached(cache);
      // History
      const next = pushHistory<DiseaseHistoryItem>(KEYS.diseaseHistory, {
        id: crypto.randomUUID(),
        thumbnail: thumb,
        result: d,
        lang,
        createdAt: Date.now(),
      });
      setRecent(next.slice(0, 4));
    } catch (e: any) {
      const code = e?.message;
      if (code === "rate-limit") toast.error(t("ai.errorRate"));
      else if (code === "payment") toast.error(t("ai.errorPay"));
      else toast.error(t("ai.errorGeneric"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("dis.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-3xl">{t("dis.subtitle")}</p>
        </header>

        {viewingHistory && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
            <p className="inline-flex items-center gap-2 text-sm text-primary font-semibold">
              <Clock className="h-4 w-4" /> {t("hist.viewing")} • {new Date(viewingHistory.createdAt).toLocaleString()}
            </p>
            <button
              onClick={exitHistory}
              className="inline-flex items-center gap-1 text-sm font-semibold rounded-lg px-3 py-1.5 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="h-3.5 w-3.5" /> {t("hist.exit")}
            </button>
          </div>
        )}

        {!online && (
          <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
            <WifiOff className="h-4 w-4" />
            <span className="text-foreground/90">
              {cached ? t("offline.banner") : t("offline.noCache")}
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_320px]">
          {/* Upload */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div
              onClick={() => !viewingHistory && fileRef.current?.click()}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !viewingHistory) { e.preventDefault(); fileRef.current?.click(); } }}
              role="button"
              tabIndex={0}
              aria-label={t("dis.upload")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center text-center p-10 min-h-[360px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {image ? (
                <div className="relative w-full">
                  <img src={image} alt="leaf" className="max-h-72 w-full object-contain rounded-xl" />
                  {!viewingHistory && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                      aria-label={t("common.cancel")}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                    <Camera className="h-7 w-7" aria-hidden />
                  </div>
                  <p className="font-bold">{t("dis.upload")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("dis.uploadHint")}</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            </div>
            <button
              onClick={analyze}
              disabled={!image || busy || !online || !!viewingHistory}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {busy ? t("dis.analyzing") : t("dis.analyze")}
            </button>
          </div>

          {/* Result */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card min-h-[420px]">
            {!result && !busy && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                  <Bug className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="font-bold">{t("dis.ready")}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">{t("dis.readyDesc")}</p>
              </div>
            )}
            {busy && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" aria-hidden />
                <p className="font-bold">{t("dis.analyzing")}</p>
              </div>
            )}
            {result && (
              <div className="space-y-4 animate-fade-in-up">
                {result.healthy ? (
                  <div className="rounded-xl bg-success/10 border border-success/20 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-bold">{t("dis.healthy")}</p>
                      <p className="text-xs text-muted-foreground">{result.crop} • {result.confidence}% {t("dis.confidence")}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-border bg-background/50 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{result.crop} • {t("dis.disease")}</p>
                      <h3 className="text-xl font-bold mt-1">{result.disease}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Pill color="info">{result.confidence}% {t("dis.confidence")}</Pill>
                        <Pill color={result.severity === "High" ? "destructive" : result.severity === "Moderate" ? "warning" : "success"}>
                          {t("dis.severity")}: {result.severity}
                        </Pill>
                      </div>
                    </div>
                    <Section icon={<AlertTriangle className="h-4 w-4 text-warning" />} title={t("dis.causes")} items={result.causes} />
                    <Section icon={<CheckCircle2 className="h-4 w-4 text-success" />} title={t("dis.treatment")} items={result.treatment} numbered />
                    <Section icon={<Info className="h-4 w-4 text-info" />} title={t("dis.prevention")} items={result.prevention} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{t("dis.recent")}</h3>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm italic text-muted-foreground py-6 text-center">{t("dis.noRecent")}</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => navigate({ search: { history: s.id } })}
                        className="w-full text-start flex items-center gap-3 rounded-lg border border-border p-2 hover:border-primary hover:bg-primary/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <img src={s.thumbnail} alt="scan" className="h-10 w-10 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{s.result.healthy ? t("dis.healthy") : s.result.disease}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl bg-foreground text-background p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary-glow" />
                <h3 className="font-bold">{t("dis.best")}</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[t("dis.tip1"), t("dis.tip2"), t("dis.tip3")].map((x) => (
                  <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-glow shrink-0" /><span className="opacity-90">{x}</span></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ icon, title, items, numbered }: { icon: React.ReactNode; title: string; items: string[]; numbered?: boolean }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 font-bold text-sm mb-2">{icon}{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            {numbered ? (
              <span className="h-5 w-5 shrink-0 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
            ) : (
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
            )}
            <span className="text-muted-foreground leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
function Pill({ children, color }: { children: React.ReactNode; color: "info" | "warning" | "destructive" | "success" }) {
  const map = {
    info: "bg-info/15 text-info",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${map[color]}`}>{children}</span>;
}
