import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Sprout, Sun, Droplets, Crop, Loader2, TrendingUp, WifiOff, Clock, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { LANG_NAMES } from "@/i18n/translations";
import { callJson } from "@/lib/ai-client";
import { useOnline } from "@/hooks/use-online";
import { useProfile } from "@/lib/profile";
import {
  KEYS, lsGet, lsSet, pushHistory,
  type CropHistoryItem,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/crops")({
  validateSearch: (search: Record<string, unknown>): { history?: string } => ({
    history: typeof search.history === "string" ? search.history : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Crop Recommendation — AgriSmart AI" },
      { name: "description", content: "Get AI-powered crop recommendations based on your soil, season, water and location." },
      { property: "og:title", content: "Crop Recommendation System — AgriSmart AI" },
      { property: "og:description", content: "Personalized crop suggestions for maximum yield and profit." },
    ],
  }),
  component: CropsPage,
});

interface CropResult {
  name: string;
  variety: string;
  yield: string;
  profit: string;
  demand: "High" | "Medium" | "Low";
  confidence: number;
  tips: string;
}

interface CachedResult {
  form: { location: string; soil: string; season: string; water: string; area: string };
  results: CropResult[];
  savedAt: number;
}

function CropsPage() {
  const { t, lang } = useLang();
  const online = useOnline();
  const { profile } = useProfile();
  const navigate = useNavigate({ from: "/crops" });
  const { history } = Route.useSearch();

  const [form, setForm] = useState({ location: "", soil: "", season: "", water: "", area: "1" });
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<CropResult[]>([]);
  const [cached, setCached] = useState<CachedResult | null>(null);
  const [viewingHistory, setViewingHistory] = useState<CropHistoryItem | null>(null);

  // Initial mount: load cache + prefill from profile
  useEffect(() => {
    const last = lsGet<CachedResult | null>(KEYS.cropLast, null);
    setCached(last);
    if (profile?.location && !form.location) {
      setForm((f) => ({ ...f, location: profile.location }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // If ?history=ID, load that history item
  useEffect(() => {
    if (!history) { setViewingHistory(null); return; }
    const list = lsGet<CropHistoryItem[]>(KEYS.cropHistory, []);
    const item = list.find((x) => x.id === history);
    if (item) {
      setViewingHistory(item);
      setForm(item.form);
      setResults(item.results);
    }
  }, [history]);

  const exitHistory = () => {
    setViewingHistory(null);
    setResults([]);
    navigate({ search: { history: undefined } });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location || !form.soil || !form.season || !form.water) {
      toast.error("Please fill all fields");
      return;
    }
    if (!online) {
      toast.error(t("offline.aiUnavailable"));
      return;
    }
    setBusy(true);
    setResults([]);
    setViewingHistory(null);
    try {
      const res = await callJson<{ crops: CropResult[] }>("crop-recommend", { ...form, language: LANG_NAMES[lang] });
      const list = res.crops || [];
      setResults(list);

      // Save to cache + history
      const cache: CachedResult = { form: { ...form }, results: list, savedAt: Date.now() };
      lsSet(KEYS.cropLast, cache);
      setCached(cache);
      pushHistory<CropHistoryItem>(KEYS.cropHistory, {
        id: crypto.randomUUID(),
        form: { ...form },
        results: list,
        lang,
        createdAt: Date.now(),
      });
    } catch (e: any) {
      const code = e?.message;
      if (code === "rate-limit") toast.error(t("ai.errorRate"));
      else if (code === "payment") toast.error(t("ai.errorPay"));
      else toast.error(t("ai.errorGeneric"));

      // If we have cache and no new results, surface it
      if (cached && results.length === 0) {
        setResults(cached.results);
        toast.message(t("offline.cached") + " " + new Date(cached.savedAt).toLocaleTimeString());
      }
    } finally {
      setBusy(false);
    }
  };

  // When offline and no fresh results, show cached automatically
  useEffect(() => {
    if (!online && cached && results.length === 0 && !viewingHistory) {
      setForm(cached.form);
      setResults(cached.results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, cached]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("crops.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{t("crops.subtitle")}</p>
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

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5 h-fit" aria-label={t("crops.title")}>
            <Field icon={<MapPin className="h-4 w-4 text-primary" />} label={t("crops.location")}>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder={t("crops.locationPh")}
                aria-label={t("crops.location")}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>

            <Field icon={<Sprout className="h-4 w-4 text-primary" />} label={t("crops.soil")}>
              <Select value={form.soil} onChange={(v) => setForm({ ...form, soil: v })} placeholder={t("crops.soilPh")} ariaLabel={t("crops.soil")} options={[
                t("crops.soil.alluvial"), t("crops.soil.black"), t("crops.soil.red"),
                t("crops.soil.laterite"), t("crops.soil.sandy"), t("crops.soil.clay"), t("crops.soil.loamy"),
              ]} />
            </Field>

            <Field icon={<Sun className="h-4 w-4 text-warning" />} label={t("crops.season")}>
              <Select value={form.season} onChange={(v) => setForm({ ...form, season: v })} placeholder={t("crops.seasonPh")} ariaLabel={t("crops.season")} options={[
                t("crops.season.kharif"), t("crops.season.rabi"), t("crops.season.zaid"),
              ]} />
            </Field>

            <Field icon={<Droplets className="h-4 w-4 text-info" />} label={t("crops.water")}>
              <Select value={form.water} onChange={(v) => setForm({ ...form, water: v })} placeholder={t("crops.waterPh")} ariaLabel={t("crops.water")} options={[
                t("crops.water.low"), t("crops.water.medium"), t("crops.water.high"),
              ]} />
            </Field>

            <Field icon={<Crop className="h-4 w-4 text-primary" />} label={t("crops.area")}>
              <input
                type="number" min="0.1" step="0.1"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                aria-label={t("crops.area")}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>

            <button
              type="submit"
              disabled={busy || !online}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sprout className="h-4 w-4" aria-hidden />}
              {t("crops.submit")}
            </button>
          </form>

          {/* Results */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card min-h-[400px]">
            {busy ? (
              <EmptyState>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" aria-hidden />
                <p className="font-bold">{t("crops.analyzing")}</p>
              </EmptyState>
            ) : results.length === 0 ? (
              <EmptyState>
                <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                  <Sprout className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="font-bold text-lg">{t("crops.empty.title")}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t("crops.empty.desc")}</p>
              </EmptyState>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg inline-flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />{t("crops.results")}
                  </h3>
                  {!viewingHistory && cached && !online && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t("offline.cached")} {new Date(cached.savedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {results.map((c, i) => (
                    <article key={i} className="rounded-2xl border border-border bg-background/50 p-5 hover:border-primary/40 hover:shadow-card transition-all animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-bold text-base">{c.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.variety}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-bold">
                          {c.confidence}% {t("crops.confidence")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <Stat label={t("crops.yield")} value={c.yield} />
                        <Stat label={t("crops.profit")} value={c.profit} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          c.demand === "High" ? "bg-success/15 text-success" :
                          c.demand === "Medium" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
                        }`}>
                          <TrendingUp className="h-3 w-3" aria-hidden />{t("crops.demand")}: {c.demand}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3 leading-relaxed">{c.tips}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold mb-2">{icon}{label}</label>
      {children}
    </div>
  );
}
function Select({ value, onChange, placeholder, options, ariaLabel }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[]; ariaLabel?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] py-12">{children}</div>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
}
