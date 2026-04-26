import { WifiOff } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useOnline } from "@/hooks/use-online";

export function OfflineBanner() {
  const online = useOnline();
  const { t } = useLang();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-16 z-40 w-full bg-warning/15 text-warning-foreground border-b border-warning/30"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center gap-2 text-sm font-semibold text-warning">
        <WifiOff className="h-4 w-4" />
        <span className="text-foreground/90">{t("offline.banner")}</span>
      </div>
    </div>
  );
}
