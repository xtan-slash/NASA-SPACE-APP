import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HI } from "./hi";
import { KN } from "./kn";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
];

const TABLES = { hi: HI, kn: KN };
const LOCALES = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
const STORAGE_KEY = "terrashift.language";

const LanguageContext = createContext(null);

function translate(text, lang, vars) {
  if (text == null) return text;
  const table = TABLES[lang];
  let out = (table && table[text]) || text;
  if (vars) {
    out = out.replace(/\{(\w+)\}/g, (match, key) => (vars[key] != null ? String(vars[key]) : match));
  }
  return out;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || TABLES[saved]) setLangState(saved);
    } catch {
      /* storage unavailable — stay on English */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((text, vars) => translate(text, lang, vars), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t, locale: LOCALES[lang] || "en-IN" }),
    [lang, setLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  return { lang: "en", setLang: () => {}, t: (text) => text, locale: "en-IN" };
}