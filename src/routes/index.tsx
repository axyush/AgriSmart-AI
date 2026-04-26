import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare, Sprout, Bug, TrendingUp, BookOpen, BarChart3,
  ArrowRight, CheckCircle2, Sparkles
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import heroImg from "@/assets/hero-field.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriSmart AI — Smart Farming with AI" },
      { name: "description", content: "AI-powered farmer support platform — crop recommendations, disease detection, market intelligence, and government schemes in one place." },
      { property: "og:title", content: "AgriSmart AI — Smart Farming with AI" },
      { property: "og:description", content: "AI-powered farmer support platform for Indian agriculture." },
    ],
  }),
  component: HomePage,
});

const FEATURES = [
  { icon: MessageSquare, key: "assistant", to: "/assistant", color: "info" },
  { icon: Sprout, key: "crop", to: "/crops", color: "primary" },
  { icon: Bug, key: "disease", to: "/diseases", color: "warning" },
  { icon: TrendingUp, key: "market", to: "/market", color: "purple" },
  { icon: BookOpen, key: "schemes", to: "/schemes", color: "destructive" },
  { icon: BarChart3, key: "simulate", to: "/dashboard", color: "info" },
] as const;

const colorMap: Record<string, string> = {
  info: "bg-info/15 text-info",
  primary: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  purple: "bg-purple/15 text-purple",
  destructive: "bg-destructive/15 text-destructive",
};

function HomePage() {
  const { t } = useLang();

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-soft pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.hero.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
              {t("home.hero.title")}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl text-balance">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02]"
              >
                {t("home.hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                {t("home.hero.secondary")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 6 Indian languages</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Voice + Image input</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Real-time data</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border/50">
              <img src={heroImg} alt="Indian wheat field at golden hour" className="w-full h-[420px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 hidden md:block bg-card border border-border rounded-2xl shadow-card p-4 w-56">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recommended</p>
                  <p className="font-semibold text-sm">Basmati Rice</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 hidden md:block bg-card border border-border rounded-2xl shadow-card p-4 w-52">
              <p className="text-xs text-muted-foreground">Wheat • Ludhiana</p>
              <p className="text-xl font-bold mt-1">₹2,296<span className="text-sm font-normal text-muted-foreground">/q</span></p>
              <p className="text-xs text-success font-semibold mt-0.5">↑ +2.4%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("feat.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("feat.subtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.key}
                to={f.to}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[f.color]} mb-4`}>
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <h3 className="text-lg font-bold mb-2">{t(`feat.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`feat.${f.key}.desc`)}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  {t("feat.cta")} <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 text-primary-foreground">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Ready to grow smarter?</h3>
              <p className="mt-2 opacity-90 max-w-md">Join thousands of farmers using AgriSmart AI to make better decisions every season.</p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-6 py-3 text-sm font-semibold hover:bg-background/90 transition-colors">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
