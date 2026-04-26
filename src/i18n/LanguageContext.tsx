import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Lang, LANG_DIR, translate } from "./translations";

interface Ctx {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("agri-lang") : null;
    if (stored && ["en", "hi", "pa", "ta", "te", "bn"].includes(stored)) {
      setLangState(stored as Lang);
    }
  }, []);

  // Reflect language + direction on the <html> element so screen readers,
  // browser hyphenation, and RTL CSS logical properties work correctly.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", LANG_DIR[lang]);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("agri-lang", l);
  };

  const t = (key: string) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, dir: LANG_DIR[lang], setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
