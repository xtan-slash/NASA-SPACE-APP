import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { HI } from "./hi";
import { KN } from "./kn";
import { translateInterfaceBatch } from "@/lib/server-fns";
import { useAuth } from "@/lib/AuthContext";

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
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const { isAuthenticated } = useAuth();
  const runTranslation = useServerFn(translateInterfaceBatch);
  const pendingRef = useRef(new Set());
  const timerRef = useRef(null);
  const activeLangRef = useRef(lang);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || TABLES[saved]) setLangState(saved);
    } catch {
      /* storage unavailable — stay on English */
    }
  }, []);

  useEffect(() => {
    activeLangRef.current = lang;
    pendingRef.current.clear();
    try {
      const cached = JSON.parse(window.localStorage.getItem(`terrashift.translations.${lang}`) || "{}");
      setDynamicTranslations(cached && typeof cached === "object" ? cached : {});
    } catch {
      setDynamicTranslations({});
    }
  }, [lang]);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const setLang = useCallback((code) => {
    if (!["en", "hi", "kn"].includes(code)) return;
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const flushTranslations = useCallback(async () => {
    timerRef.current = null;
    if (!isAuthenticated || !["hi", "kn"].includes(activeLangRef.current)) return;
    const targetLanguage = activeLangRef.current;
    const texts = [...pendingRef.current].slice(0, 12);
    texts.forEach((text) => pendingRef.current.delete(text));
    if (!texts.length) return;

    try {
      const response = await runTranslation({ data: { targetLanguage, texts } });
      if (response?.ok && activeLangRef.current === targetLanguage) {
        setDynamicTranslations((previous) => {
          const next = { ...previous, ...response.translations };
          try {
            window.localStorage.setItem(`terrashift.translations.${targetLanguage}`, JSON.stringify(next));
          } catch {
            /* translation cache is optional */
          }
          return next;
        });
      }
    } catch {
      // Keep the English fallback if the user is signed out or the service is unavailable.
    }

    if (pendingRef.current.size && activeLangRef.current === targetLanguage) {
      timerRef.current = window.setTimeout(flushTranslations, 120);
    }
  }, [isAuthenticated, runTranslation]);

  const t = useCallback((text, vars) => {
    if (text == null) return text;
    const local = translate(text, lang, vars);
    if (local !== text || lang === "en") return local;

    const cached = dynamicTranslations[text];
    if (cached) {
      return vars ? cached.replace(/\{(\w+)\}/g, (match, key) => (vars[key] != null ? String(vars[key]) : match)) : cached;
    }

    if (isAuthenticated && text.length <= 1800) {
      pendingRef.current.add(text);
      if (!timerRef.current) timerRef.current = window.setTimeout(flushTranslations, 80);
    }
    return local;
  }, [lang, dynamicTranslations, isAuthenticated, flushTranslations]);

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