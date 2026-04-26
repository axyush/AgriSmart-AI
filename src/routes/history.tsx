import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History as HistoryIcon, MessageSquare, Sprout, Bug, Trash2, ArrowRight, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import {
  KEYS, lsGet, lsSet, deleteHistory,
  type ChatHistoryItem, type CropHistoryItem, type DiseaseHistoryItem,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AgriSmart AI" },
      { name: "description", content: "Revisit your past AI chats, crop recommendation searches and disease scans anytime." },
      { property: "og:title", content: "My History — AgriSmart AI" },
      { property: "og:description", content: "Saved chats, crop searches and disease scans." },
    ],
  }),
  component: HistoryPage,
});

type Tab = "chats" | "crops" | "diseases";

function HistoryPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("chats");
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [crops, setCrops] = useState<CropHistoryItem[]>([]);
  const [diseases, setDiseases] = useState<DiseaseHistoryItem[]>([]);

  const reload = () => {
    setChats(lsGet<ChatHistoryItem[]>(KEYS.chatHistory, []));
    setCrops(lsGet<CropHistoryItem[]>(KEYS.cropHistory, []));
    setDiseases(lsGet<DiseaseHistoryItem[]>(KEYS.diseaseHistory, []));
  };

  useEffect(() => { reload(); }, []);

  const removeOne = (key: string, id: string) => {
    if (!window.confirm(t("hist.confirmDelete"))) return;
    deleteHistory(key, id);
    reload();
    toast.success(t("common.delete"));
  };

  const clearAll = (key: string) => {
    if (!window.confirm(t("hist.confirmClear"))) return;
    lsSet(key, []);
    reload();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "chats", label: t("hist.tab.chats"), icon: <MessageSquare className="h-4 w-4" />, count: chats.length },
    { id: "crops", label: t("hist.tab.crops"), icon: <Sprout className="h-4 w-4" />, count: crops.length },
    { id: "diseases", label: t("hist.tab.diseases"), icon: <Bug className="h-4 w-4" />, count: diseases.length },
  ];

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            <HistoryIcon className="h-3.5 w-3.5" /> {t("nav.history")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("hist.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t("hist.subtitle")}</p>
        </header>

        {/* Tabs */}
        <div role="tablist" aria-label={t("hist.title")} className="flex flex-wrap items-center gap-2 border-b border-border mb-6">
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${tb.id}`}
                id={`tab-${tb.id}`}
                onClick={() => setTab(tb.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tb.icon}
                {tb.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {tb.count}
                </span>
              </button>
            );
          })}
          <div className="ms-auto">
            {((tab === "chats" && chats.length > 0) ||
              (tab === "crops" && crops.length > 0) ||
              (tab === "diseases" && diseases.length > 0)) && (
              <button
                onClick={() => clearAll(
                  tab === "chats" ? KEYS.chatHistory : tab === "crops" ? KEYS.cropHistory : KEYS.diseaseHistory
                )}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t("common.clearAll")}
              </button>
            )}
          </div>
        </div>

        {/* Panels */}
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "chats" && (
            chats.length === 0 ? (
              <Empty icon={<MessageSquare className="h-7 w-7 text-muted-foreground" />} text={t("hist.empty.chats")} />
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {chats.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {t("hist.savedAt")} • {formatDate(c.createdAt)}
                        </p>
                        <h3 className="mt-1 font-bold line-clamp-1">{c.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.preview}</p>
                      </div>
                      <button
                        onClick={() => removeOne(KEYS.chatHistory, c.id)}
                        aria-label={t("common.delete")}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Link
                      to="/assistant"
                      search={{ history: c.id }}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      <Eye className="h-4 w-4" /> {t("hist.open")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "crops" && (
            crops.length === 0 ? (
              <Empty icon={<Sprout className="h-7 w-7 text-muted-foreground" />} text={t("hist.empty.crops")} />
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {crops.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      {formatDate(c.createdAt)}
                    </p>
                    <h3 className="mt-1 font-bold line-clamp-1">{c.form.location || "—"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.form.soil} • {c.form.season} • {c.form.area} acre
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.results.slice(0, 3).map((r: any, i: number) => (
                        <span key={i} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-bold">
                          {r.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to="/crops"
                        search={{ history: c.id }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                      >
                        <Eye className="h-4 w-4" /> {t("hist.open")}
                      </Link>
                      <button
                        onClick={() => removeOne(KEYS.cropHistory, c.id)}
                        aria-label={t("common.delete")}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "diseases" && (
            diseases.length === 0 ? (
              <Empty icon={<Bug className="h-7 w-7 text-muted-foreground" />} text={t("hist.empty.diseases")} />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {diseases.map((d) => (
                  <li key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                    <div className="flex gap-3">
                      <img src={d.thumbnail} alt="scan" className="h-20 w-20 rounded-xl object-cover border border-border" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {formatDate(d.createdAt)}
                        </p>
                        <h3 className="mt-1 font-bold line-clamp-1">
                          {d.result?.healthy ? t("dis.healthy") : (d.result?.disease ?? "—")}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {d.result?.crop} • {d.result?.confidence}% {t("dis.confidence")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Link
                        to="/diseases"
                        search={{ history: d.id }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                      >
                        <Eye className="h-4 w-4" /> {t("hist.open")}
                      </Link>
                      <button
                        onClick={() => removeOne(KEYS.diseaseHistory, d.id)}
                        aria-label={t("common.delete")}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{text}</p>
    </div>
  );
}
