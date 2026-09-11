import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Siren, Ambulance, Map as MapIcon, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccidentModule } from "@/components/AccidentModule";
import { FleetModule } from "@/components/FleetModule";
import { TravelModule } from "@/components/TravelModule";
import { LANGUAGES, makeT, type LangCode } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeRoute Command — Accident Alerts & Emergency Routing" },
      {
        name: "description",
        content:
          "Detect road accidents from vehicle sensors, alert hospitals and traffic police, clear routes for ambulances, and plan trips in your own language.",
      },
      { property: "og:title", content: "SafeRoute Command — Accident Alerts & Emergency Routing" },
      {
        property: "og:description",
        content:
          "One app for accident detection, emergency vehicle routing and multilingual travel guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<LangCode>("en");
  const t = useMemo(() => makeT(lang), [lang]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <Siren className="size-4" /> live
          </p>
          <h1 className="mt-1 text-4xl font-bold uppercase sm:text-5xl">{t("appName")}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("tagline")}</p>
        </div>
        <div className="min-w-40">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Languages className="size-3.5" /> {t("langLabel")}
          </label>
          <Select value={lang} onValueChange={(v) => setLang(v as LangCode)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs defaultValue="detect" className="mt-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="detect">
            <Siren className="size-4" /> {t("tabDetect")}
          </TabsTrigger>
          <TabsTrigger value="fleet">
            <Ambulance className="size-4" /> {t("tabFleet")}
          </TabsTrigger>
          <TabsTrigger value="travel">
            <MapIcon className="size-4" /> {t("tabTravel")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detect" className="mt-6">
          <AccidentModule t={t} />
        </TabsContent>
        <TabsContent value="fleet" className="mt-6">
          <FleetModule t={t} />
        </TabsContent>
        <TabsContent value="travel" className="mt-6">
          <TravelModule t={t} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
