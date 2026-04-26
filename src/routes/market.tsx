import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, MapPin, ArrowDownRight, ArrowUpRight, Share2, Download, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market Intelligence — AgriSmart AI" },
      { name: "description", content: "Live mandi prices, market trends, and buyer sentiment for major Indian crops." },
      { property: "og:title", content: "Market Intelligence — AgriSmart AI" },
      { property: "og:description", content: "Real-time mandi prices and market sentiment across India." },
    ],
  }),
  component: MarketPage,
});

interface Crop {
  id: string;
  name: string;
  variety: string;
  mandi: string;
  price: number;
  range: [number, number];
  change: number;
  arrivals: number;
  sentiment: { buyer: number; supply: number };
  forecast: number[];
}

const CROPS: Crop[] = [
  { id: "wheat-ldh", name: "Wheat", variety: "Kanak — HD-2967", mandi: "Ludhiana, Punjab", price: 2296, range: [2200, 2350], change: 3.1, arrivals: 458, sentiment: { buyer: 85, supply: 55 }, forecast: [2150, 2180, 2200, 2250, 2270, 2296, 2330] },
  { id: "rice-bsm", name: "Basmati Rice", variety: "Pusa-1121", mandi: "Karnal, Haryana", price: 4520, range: [4400, 4700], change: -1.2, arrivals: 312, sentiment: { buyer: 70, supply: 65 }, forecast: [4600, 4570, 4540, 4530, 4500, 4520, 4480] },
  { id: "cotton-mh", name: "Cotton", variety: "Bt Hybrid", mandi: "Akola, Maharashtra", price: 7185, range: [7000, 7400], change: 1.8, arrivals: 220, sentiment: { buyer: 75, supply: 60 }, forecast: [7000, 7050, 7100, 7080, 7150, 7185, 7220] },
  { id: "soy-mp", name: "Soybean", variety: "JS-335", mandi: "Indore, MP", price: 4380, range: [4250, 4500], change: 0.9, arrivals: 380, sentiment: { buyer: 65, supply: 70 }, forecast: [4300, 4320, 4350, 4340, 4360, 4380, 4400] },
  { id: "maize-bh", name: "Maize", variety: "Yellow", mandi: "Patna, Bihar", price: 1985, range: [1900, 2050], change: -0.5, arrivals: 510, sentiment: { buyer: 60, supply: 80 }, forecast: [2010, 2000, 1995, 1990, 1985, 1985, 1970] },
  { id: "mustard-rj", name: "Mustard", variety: "RH-749", mandi: "Sri Ganganagar, RJ", price: 5640, range: [5500, 5800], change: 2.7, arrivals: 195, sentiment: { buyer: 88, supply: 50 }, forecast: [5400, 5450, 5500, 5550, 5580, 5640, 5700] },
];

function MarketPage() {
  const { t } = useLang();
  const [selected, setSelected] = useState<Crop>(CROPS[0]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("mkt.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("mkt.subtitle")}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CROPS.map((c) => {
              const active = c.id === selected.id;
              const positive = c.change >= 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`text-left rounded-2xl border p-5 transition-all ${active ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40 shadow-card"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {positive ? "+" : ""}{c.change}%
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{c.name} <span className="text-sm font-normal text-muted-foreground">({c.variety})</span></h3>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{c.mandi}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mkt.live")}</p>
                      <p className="text-2xl font-extrabold">₹{c.price}<span className="text-xs font-normal text-muted-foreground">/q</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mkt.range")}</p>
                      <p className="text-xs font-bold">₹{c.range[0]} – ₹{c.range[1]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{t("mkt.forecast")}</h3>
                <div className="flex gap-1">
                  <button className="h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Share2 className="h-3.5 w-3.5" /></button>
                  <button className="h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Download className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{selected.name} • {selected.mandi}</p>
              <ForecastChart data={selected.forecast} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mkt.arrivals")}</p>
                  <p className="font-bold mt-0.5">{selected.arrivals} t</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("mkt.variety")}</p>
                  <p className="font-bold mt-0.5 truncate">{selected.variety}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-foreground text-background p-5 shadow-card">
              <h3 className="font-bold mb-4">{t("mkt.sentiment")}</h3>
              <SentimentBar label={t("mkt.buyer")} value={selected.sentiment.buyer} valueLabel={selected.sentiment.buyer >= 80 ? t("mkt.veryHigh") : t("mkt.moderate")} color="success" />
              <div className="h-3" />
              <SentimentBar label={t("mkt.supply")} value={selected.sentiment.supply} valueLabel={selected.sentiment.supply >= 70 ? t("mkt.veryHigh") : t("mkt.moderate")} color="warning" />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ForecastChart({ data }: { data: number[] }) {
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 200},${50 - ((v - min) / range) * 40 - 5}`).join(" ");
  return (
    <svg viewBox="0 0 200 60" className="w-full h-32">
      <defs>
        <linearGradient id="mktArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.17 148)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.62 0.17 148)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,60 ${pts} 200,60`} fill="url(#mktArea)" />
      <polyline points={pts} fill="none" stroke="oklch(0.62 0.17 148)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * 200} cy={50 - ((v - min) / range) * 40 - 5} r="1.8" fill="oklch(0.62 0.17 148)" />
      ))}
    </svg>
  );
}
function SentimentBar({ label, value, valueLabel, color }: { label: string; value: number; valueLabel: string; color: "success" | "warning" }) {
  const bg = color === "success" ? "bg-success" : "bg-warning";
  const text = color === "success" ? "text-success" : "text-warning";
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-90">
        <span>{label}</span>
        <span className={text}>{valueLabel}</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
