import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink, IndianRupee, Shield, Tractor, Sun, Sprout, Droplets } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — AgriSmart AI" },
      { name: "description", content: "Discover and apply for Indian government agricultural subsidies and insurance schemes including PM-KISAN, PMFBY and more." },
      { property: "og:title", content: "Government Schemes — AgriSmart AI" },
      { property: "og:description", content: "Subsidies, insurance and welfare programs for farmers." },
    ],
  }),
  component: SchemesPage,
});

const SCHEMES = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    icon: IndianRupee,
    color: "primary",
    desc: "Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across the country.",
    benefits: ["₹6,000/year direct transfer", "3 equal installments of ₹2,000", "Direct to bank account"],
    eligibility: "All landholding farmer families (subject to exclusions).",
    apply: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    icon: Shield,
    color: "info",
    desc: "Comprehensive crop insurance scheme to provide financial support to farmers suffering from crop losses due to natural calamities, pests, and diseases.",
    benefits: ["Premium of just 2% (Kharif), 1.5% (Rabi)", "Coverage from sowing to post-harvest", "Quick claim settlement"],
    eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops.",
    apply: "https://pmfby.gov.in/",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    icon: Tractor,
    color: "warning",
    desc: "Easy and timely credit access to farmers for cultivation, post-harvest expenses, and consumption requirements at concessional interest rates.",
    benefits: ["Loans up to ₹3 lakh at 4% effective rate", "Flexible repayment", "Interest subvention available"],
    eligibility: "All farmers — individual / joint borrowers who are owner cultivators.",
    apply: "https://www.india.gov.in/spotlight/kisan-credit-card-kcc",
  },
  {
    id: "pmksy",
    name: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)",
    icon: Droplets,
    color: "info",
    desc: "Improved water-use efficiency through micro-irrigation — drip and sprinkler systems with up to 55% subsidy for marginal farmers.",
    benefits: ["Up to 55% subsidy on drip/sprinkler", "Per-drop-more-crop focus", "Solar pumps under PM-KUSUM"],
    eligibility: "All farmers; higher subsidy for SC/ST and small/marginal farmers.",
    apply: "https://pmksy.gov.in/",
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    icon: Sprout,
    color: "primary",
    desc: "Free soil testing and personalized recommendations on nutrients and fertilizers to improve productivity and soil health.",
    benefits: ["Free soil test every 2 years", "Crop-wise nutrient recommendations", "Reduces input cost"],
    eligibility: "All farmers with cultivable land.",
    apply: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "kusum",
    name: "PM-KUSUM (Solar Pumps)",
    icon: Sun,
    color: "warning",
    desc: "Installation of solar pumps and grid-connected solar plants to make farming energy-secure and create additional income.",
    benefits: ["Up to 60% subsidy on solar pumps", "30% loan facility", "Sell surplus power to grid"],
    eligibility: "Individual farmers, FPOs, cooperatives, panchayats.",
    apply: "https://pmkusum.mnre.gov.in/",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  info: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
};

function SchemesPage() {
  const { t } = useLang();
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            Government of India
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("sch.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-3xl">{t("sch.subtitle")}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {SCHEMES.map((s, i) => {
            const c = colorMap[s.color];
            const Icon = s.icon;
            return (
              <article key={s.id} className={`rounded-2xl border ${c.border} ${c.bg} p-6 shadow-card hover:shadow-elevated transition-all animate-fade-in-up`} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 border ${c.border}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg ${c.text}`}>{s.name}</h3>
                    <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">{t("sch.benefits")}</p>
                    <ul className="space-y-1">
                      {s.benefits.map((b) => (
                        <li key={b} className="flex gap-2 text-sm">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${c.text.replace("text-", "bg-")}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{t("sch.eligibility")}</p>
                    <p className="text-sm text-foreground/80">{s.eligibility}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <a href={s.apply} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold ${c.text.replace("text-", "bg-")} text-white hover:opacity-90 transition-opacity`}>
                    {t("sch.apply")} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
