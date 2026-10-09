import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-md border p-0.5",
        dark
          ? "border-ocean-foreground/30 bg-ocean text-ocean-foreground"
          : "border-border bg-background text-foreground",
      )}
    >
      <Languages aria-hidden className="mx-1 size-3.5" />
      {(
        [
          ["en", "English"],
          ["es", "Español"],
        ] as const
      ).map(([id, label]) => (
        <Button
          key={id}
          size="sm"
          variant={language === id ? "default" : "ghost"}
          aria-pressed={language === id}
          onClick={() => setLanguage(id as Language)}
          className={cn(
            "h-7 px-2 text-xs",
            dark &&
              language !== id &&
              "text-ocean-foreground hover:bg-ocean-foreground/10 hover:text-ocean-foreground",
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
