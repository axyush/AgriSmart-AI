import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-card/30 mt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-bold">{t("brand.name")}</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            {t("brand.tag")} — {t("about.lead")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">{t("nav.dashboard")}</Link>
            <Link to="/assistant" className="text-muted-foreground hover:text-foreground">{t("nav.assistant")}</Link>
            <Link to="/crops" className="text-muted-foreground hover:text-foreground">{t("nav.crops")}</Link>
            <Link to="/diseases" className="text-muted-foreground hover:text-foreground">{t("nav.diseases")}</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/market" className="text-muted-foreground hover:text-foreground">{t("nav.market")}</Link>
            <Link to="/schemes" className="text-muted-foreground hover:text-foreground">{t("nav.schemes")}</Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">{t("nav.about")}</Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">{t("brand.name")}</p>
          <p>© {new Date().getFullYear()} — Built for Indian farmers.</p>
        </div>
      </div>
    </footer>
  );
}
