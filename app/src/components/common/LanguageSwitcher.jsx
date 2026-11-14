import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className, compact = false }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Languages className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <Select value={lang} onValueChange={setLang}>
        <SelectTrigger
          aria-label={t("Choose language")}
          className={cn(
            "h-8 border-border/80 bg-card/70 text-[12px]",
            compact ? "w-[104px]" : "w-full"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}