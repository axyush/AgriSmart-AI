import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cloud, TrendingUp, MessageSquare, Sprout, Bug, BookOpen, Bell,
  Droplet, Wind, Thermometer, MapPin, Settings, Upload, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AgriSmart AI" },
      { name: "description", content: "Your farming dashboard: weather, market prices, crop recommendations and government schemes." },
      { property: "og:title", content: "Farmer Dashboard — AgriSmart AI" },
      { property: "og:description", content: "Live weather, mandi prices, AI suggestions and scheme alerts." },
    ],
  }),
  component: Dashboard,
});

type Weather = { temp: number; cond: string; humidity: number; wind: number; feels: number; loc: string };

const WEATHER_FALLBACK: Weather = { temp: 34, cond: "Partly Cloudy", humidity: 65, wind: 10.1, feels: 39.7, loc: "Ludhiana, Punjab" };

const MARKET = [
  { crop: "Wheat (Kanak)", mandi: "Azadpur Mandi, Delhi", price: 2089, change: 2.4 },
  { crop: "Wheat (Kanak)", mandi: "Vashi Market, Mumbai", price: 2119, change: 1.8 },
  { crop: "Wheat (Kanak)", mandi: "Kalyan Mandi, Maharashtra", price: 2188, change: 2.4 },
  { crop: "Wheat (Kanak)", mandi: "Ludhiana Mandi, Punjab", price: 2296, change: 3.1 },
];

const NEWS = [
  { title: "New Subsidy for Solar Pumps", time: "Today", tag: "POLICY", color: "warning" },
  { title: "Monsoon expected to be normal this year", time: "Yesterday", tag: "WEATHER", color: "info" },
  { title: "Wheat MSP increased by ₹150/q", time: "2 days ago", tag: "MARKET", color: "primary" },
];

function Dashboard() {
  const { t } = useLang();
  const [w, setW] = useState<Weather>(WEATHER_FALLBACK);

  // Real-time weather via Open-Meteo (no key required)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.9&longitude=75.85&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code");
        const d = await r.json();
        if (d?.current) {
          setW({
            temp: Math.round(d.current.temperature_2m),
            cond: weatherCode(d.current.weather_code),
            humidity: Math.round(d.current.relative_humidity_2m),
            wind: Number(d.current.wind_speed_10m.toFixed(1)),
            feels: Number(d.current.apparent_temperature.toFixed(1)),
            loc: "Ludhiana, Punjab",
          });
        }
      } catch { /* keep fallback */ }
    })();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <header className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("dash.title")}</h1>
            <p className="mt-1.5 text-muted-foreground">{t("dash.welcome")}</p>
          </div>
          <button className="h-10 w-10 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
        </header>

        {/* Row 1 */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Weather */}
          <Card>
            <CardHeader icon={<Cloud className="h-5 w-5" />} iconBg="bg-info" title={t("dash.weather")} />
            <div className="mt-4 flex items-start justify-between">
              <div>
                <p className="text-5xl font-extrabold tracking-tight">{w.temp}°C</p>
                <p className="mt-1 text-sm text-muted-foreground">{w.cond}</p>
              </div>
              <div className="text-right text-sm">
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {w.loc}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Updated just now</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat icon={<Droplet className="h-4 w-4 text-info" />} label={t("dash.humidity")} value={`${w.humidity}%`} />
              <Stat icon={<Wind className="h-4 w-4 text-info" />} label={t("dash.wind")} value={`${w.wind} km/h`} />
              <Stat icon={<Thermometer className="h-4 w-4 text-warning" />} label={t("dash.heat")} value={`${w.feels}°C`} />
            </div>
            <Sparkline className="mt-5" />
          </Card>

          {/* Market */}
          <Card>
            <CardHeader icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-primary" title={t("dash.market")} action={<Link to="/market" className="text-sm font-semibold text-primary">{t("dash.viewAll")}</Link>} />
            <ul className="mt-4 space-y-2.5">
              {MARKET.map((m, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sprout className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{m.crop}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{m.mandi}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">₹{m.price}<span className="text-muted-foreground font-normal">/q</span></p>
                    <p className="text-[11px] font-semibold text-success inline-flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" /> +{m.change}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Ask AI */}
          <Card>
            <CardHeader icon={<MessageSquare className="h-5 w-5" />} iconBg="bg-info" title={t("dash.askAi")} action={<Link to="/assistant" className="text-sm font-semibold text-primary">{t("dash.viewAll")}</Link>} />
            <div className="mt-4 rounded-xl bg-info/10 p-4 text-sm italic">
              "Which crop should I grow this season in Ludhiana for maximum profit?"
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("dash.suggested")}</p>
            <div className="mt-2 space-y-2">
              {[t("ai.suggested.fertilizer"), t("ai.suggested.pests"), t("ai.suggested.profit")].map((q) => (
                <Link key={q} to="/assistant" className="block rounded-lg border border-border bg-background/50 px-3 py-2 text-sm hover:border-primary hover:bg-primary/5 transition-colors">
                  {q}
                </Link>
              ))}
            </div>
            <Link to="/assistant" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              {t("dash.startChat")}
            </Link>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader icon={<Sprout className="h-5 w-5" />} iconBg="bg-primary" title={t("dash.crop")} action={<Link to="/crops" className="text-sm font-semibold text-primary">{t("dash.viewAll")}</Link>} />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground">75% {t("dash.complete")}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: "75%" }} />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("dash.basedOn")} <span className="font-bold text-foreground">Basmati Rice</span> {t("dash.thisSeason")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("dash.estYield")}</p>
                <p className="mt-1 font-bold text-primary">25–30 q/acre</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("dash.demand")}</p>
                <p className="mt-1 font-bold text-success">{t("dash.high")}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Bug className="h-5 w-5" />} iconBg="bg-warning" title={t("dash.disease")} action={<Link to="/diseases" className="text-sm font-semibold text-primary">{t("dash.viewAll")}</Link>} />
            <Link to="/diseases" className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/30 p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-semibold">{t("dash.upload")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("dash.uploadDesc")}</p>
            </Link>
          </Card>

          <Card>
            <CardHeader icon={<BookOpen className="h-5 w-5" />} iconBg="bg-destructive" title={t("dash.schemes")} action={<Link to="/schemes" className="text-sm font-semibold text-primary">{t("dash.viewAll")}</Link>} />
            <div className="mt-4 space-y-3">
              <SchemeMini name="PM-KISAN" desc="Direct income support of ₹6,000/year in three equal installments to landholding farmer families." />
              <SchemeMini name="PMFBY" desc="Comprehensive crop insurance scheme to provide financial support to farmers suffering from crop losses." />
            </div>
          </Card>
        </div>

        {/* Row 3 — News */}
        <div className="mt-5">
          <Card>
            <CardHeader icon={<Bell className="h-5 w-5" />} iconBg="bg-warning" title={t("dash.news")} />
            <ul className="mt-4 divide-y divide-border">
              {NEWS.map((n) => (
                <li key={n.title} className="py-3 flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.time} <span className="ml-2 inline-flex items-center rounded-full bg-warning/15 text-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{n.tag}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-card">{children}</div>;
}
function CardHeader({ icon, iconBg, title, action }: { icon: React.ReactNode; iconBg: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`h-9 w-9 rounded-xl ${iconBg} text-white flex items-center justify-center`}>{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      {action}
    </div>
  );
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
function SchemeMini({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
      <p className="font-bold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
      <Link to="/schemes" className="text-xs font-bold text-destructive mt-2 inline-block">LEARN MORE →</Link>
    </div>
  );
}
function Sparkline({ className = "" }: { className?: string }) {
  // simple smooth sparkline
  return (
    <svg viewBox="0 0 200 50" className={`w-full h-12 ${className}`}>
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.17 148)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.62 0.17 148)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 35 C 20 30, 35 28, 50 30 S 85 22, 100 25 S 140 18, 160 12 S 185 8, 200 5 L 200 50 L 0 50 Z" fill="url(#spark)" />
      <path d="M0 35 C 20 30, 35 28, 50 30 S 85 22, 100 25 S 140 18, 160 12 S 185 8, 200 5" fill="none" stroke="oklch(0.62 0.17 148)" strokeWidth="2" />
    </svg>
  );
}

function weatherCode(code: number): string {
  if ([0].includes(code)) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}
