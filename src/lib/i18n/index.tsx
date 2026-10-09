import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import spanish from "./es.json";

export type Language = "en" | "es";
const dictionary: Record<string, string> = spanish;
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const entries = Object.entries(dictionary).sort(([a], [b]) => b.length - a.length);
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fragments = new RegExp(`(?<![\\p{L}])(?:${entries.map(([key]) => escape(key)).join("|")})(?![\\p{L}])`, "gu");

/** Presentation-only translation: never changes stored enums, IDs, or form values. */
export function translate<T>(value: T, language: Language): T {
  if (language === "en" || typeof value !== "string") return value;
  const normalized = normalize(value);
  const translated = dictionary[normalized] ?? normalized.replace(fragments, (match) => dictionary[match] ?? match);
  if (translated === normalized) return value;
  return value.replace(normalized, translated) as T;
}

const LanguageContext = createContext({ language: "en" as Language, setLanguage: (_language: Language) => {}, t: <T,>(value: T): T => value });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => {
    const saved = localStorage.getItem("wepa-language");
    if (saved === "es" || saved === "en") setLanguageState(saved);
    const sync = (event: StorageEvent) => {
      if (event.key === "wepa-language" && (event.newValue === "en" || event.newValue === "es")) setLanguageState(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({
    language,
    setLanguage: (next: Language) => { setLanguageState(next); localStorage.setItem("wepa-language", next); },
    t: <T,>(text: T): T => translate(text, language),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);