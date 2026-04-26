import { useEffect, useState } from "react";
import { Sprout, MapPin, User, Globe, Check, ArrowRight, ArrowLeft, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { LANGUAGES, Lang } from "@/i18n/translations";
import { useProfile } from "@/lib/profile";

const CROP_KEYS = [
  "onb.crop.wheat", "onb.crop.rice", "onb.crop.maize", "onb.crop.cotton",
  "onb.crop.sugarcane", "onb.crop.pulses", "onb.crop.veg", "onb.crop.fruits", "onb.crop.oilseeds",
];

export function OnboardingModal() {
  const { t, lang, setLang } = useLang();
  const { onboarded, setOnboarded, setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Only show after mount (avoid SSR flicker)
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!mounted || onboarded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mounted, onboarded]);

  // Keyboard: Escape skips, Enter advances
  useEffect(() => {
    if (!mounted || onboarded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, onboarded, name, location, crops]);

  if (!mounted || onboarded) return null;

  const total = 4;

  const toggleCrop = (key: string) => {
    setCrops((prev) => prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]);
  };

  const finish = (skip = false) => {
    if (!skip) {
      setProfile({
        name: name.trim(),
        location: location.trim(),
        crops,
        language: lang,
        createdAt: Date.now(),
      });
    }
    setOnboarded(true);
  };

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 animate-fade-in-up"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
        {/* Skip button */}
        <button
          onClick={() => finish(true)}
          aria-label={t("onb.skipAll")}
          className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-primary text-primary-foreground px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sprout className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                {t("onb.step")} {step + 1} {t("onb.of")} {total}
              </p>
              <h2 id="onb-title" className="text-xl font-bold">{t("onb.title")}</h2>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">{t("onb.subtitle")}</p>
          {/* Progress */}
          <div className="mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 min-h-[260px]">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{t("onb.lang.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("onb.lang.desc")}</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code as Lang)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                      lang === l.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span>{l.label}</span>
                    {lang === l.code && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{t("onb.name.title")}</h3>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onb.name.ph")}
                aria-label={t("onb.name.title")}
                autoFocus
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{t("onb.location.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("onb.location.desc")}</p>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("onb.location.ph")}
                aria-label={t("onb.location.title")}
                autoFocus
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{t("onb.crops.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("onb.crops.desc")}</p>
              <div className="flex flex-wrap gap-2">
                {CROP_KEYS.map((k) => {
                  const active = crops.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleCrop(k)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {t(k)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 bg-muted/40">
          <button
            onClick={() => finish(true)}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("common.skip")}
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ArrowLeft className="h-4 w-4" /> {t("onb.back")}
              </button>
            )}
            {step < total - 1 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t("onb.next")} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => finish(false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t("onb.finish")} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
