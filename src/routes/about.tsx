import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, AlertTriangle, Sparkles, Leaf, MessageSquare, Mic, Globe, Activity, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AgriSmart AI" },
      { name: "description", content: "About AgriSmart AI — an AI-based farmer advisory platform built to empower Indian farmers with smart, simple and accessible technology." },
      { property: "og:title", content: "About AgriSmart AI" },
      { property: "og:description", content: "Mission, vision and what makes our farmer support platform different." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLang();
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 md:px-6 py-14 md:py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-5">
            <Sparkles className="h-3.5 w-3.5" /> About us
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">{t("about.title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto text-balance">{t("about.lead")}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Block icon={<AlertTriangle className="h-5 w-5 text-warning" />} title={t("about.problem.title")} body={t("about.problem.desc")} />
          <Block icon={<Sparkles className="h-5 w-5 text-primary" />} title={t("about.solution.title")} body={t("about.solution.desc")} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Block accent icon={<Target className="h-5 w-5 text-primary-foreground" />} title={t("about.mission.title")} body={t("about.mission.desc")} />
          <Block accent icon={<Eye className="h-5 w-5 text-primary-foreground" />} title={t("about.vision.title")} body={t("about.vision.desc")} />
        </div>

        <h2 className="mt-16 mb-6 text-2xl md:text-3xl font-bold text-center">{t("about.features.title")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Activity, key: "f1" },
            { icon: Mic, key: "f2" },
            { icon: Globe, key: "f3" },
            { icon: MessageSquare, key: "f4" },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-5 shadow-card text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold">{t(`about.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`about.${key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-primary p-8 md:p-12 text-primary-foreground text-center">
          <Leaf className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl md:text-3xl font-bold">Smart farming starts here.</h3>
          <p className="mt-2 opacity-90 max-w-xl mx-auto">Try the assistant or open your dashboard to see what AgriSmart AI can do for your farm.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-5 py-2.5 font-semibold text-sm hover:bg-background/90">Open Dashboard <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/assistant" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 font-semibold text-sm hover:bg-white/10">Talk to AI</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Block({ icon, title, body, accent }: { icon: React.ReactNode; title: string; body: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 shadow-card ${accent ? "bg-gradient-primary text-primary-foreground" : "border border-border bg-card"}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-white/20" : "bg-primary/15"}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${accent ? "opacity-95" : "text-muted-foreground"}`}>{body}</p>
    </div>
  );
}
