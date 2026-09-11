import { useState } from "react";
import { Mic, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { makeT } from "@/lib/i18n";

type T = ReturnType<typeof makeT>;

type Plan = { label: string; etaMin: number; cost: string; mode: string; steps: string[] };

function buildPlans(from: string, to: string): Plan[] {
  return [
    {
      label: "fastest",
      etaMin: 24,
      cost: "₹210",
      mode: "Cab via Outer Ring Road",
      steps: [
        `Start at ${from}`,
        "Head east for 1.2 km to the main road",
        "Take the Outer Ring Road ramp, stay right",
        "Exit at Junction 4, two signals ahead",
        `Arrive at ${to}`,
      ],
    },
    {
      label: "cheapest",
      etaMin: 41,
      cost: "₹35",
      mode: "Metro Blue Line + 900 m walk",
      steps: [
        `Walk 6 min from ${from} to Central Metro`,
        "Blue Line towards Airport, 7 stops",
        "Get down at Green Park",
        `Walk 11 min to ${to}`,
      ],
    },
    {
      label: "safest",
      etaMin: 31,
      cost: "₹90",
      mode: "Bus 500D, well-lit route",
      steps: [
        `Board Bus 500D near ${from}`,
        "Lit main-road corridor, CCTV stops",
        "Get down at Hospital Gate",
        `Short 4 min walk to ${to}`,
      ],
    },
  ];
}

export function TravelModule({ t }: { t: T }) {
  const [from, setFrom] = useState("My current location");
  const [to, setTo] = useState("");
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [listening, setListening] = useState(false);
  const [active, setActive] = useState(0);

  const speak = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setTo("City General Hospital");
    }, 1400);
  };

  return (
    <div className="space-y-6">
      <div className="panel space-y-4 p-5">
        <h3 className="text-lg font-semibold">{t("travelTitle")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("from")}
            </label>
            <div className="mt-1 flex gap-2">
              <Input value={from} onChange={(e) => setFrom(e.target.value)} />
              <Button variant="secondary" onClick={() => setFrom("My current location")}>
                <MapPin className="size-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("destination")}
            </label>
            <div className="mt-1 flex gap-2">
              <Input
                value={to}
                placeholder={t("travelPlaceholder")}
                onChange={(e) => setTo(e.target.value)}
              />
              <Button variant={listening ? "destructive" : "secondary"} onClick={speak}>
                <Mic className="size-4" />
              </Button>
            </div>
            {listening && <p className="mt-1 text-xs text-warn">{t("listening")}</p>}
          </div>
        </div>
        <Button onClick={() => setPlans(buildPlans(from, to || "your destination"))}>
          <Search className="size-4" /> {t("plan")}
        </Button>
      </div>

      {plans && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setActive(i)}
                className={`panel p-4 text-left transition-colors ${
                  active === i ? "border-primary/70" : "hover:border-primary/40"
                }`}
              >
                <Badge variant="secondary">{t(p.label as "fastest")}</Badge>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{p.etaMin} min</p>
                <p className="text-sm text-muted-foreground">
                  {p.mode} · {p.cost}
                </p>
              </button>
            ))}
          </div>

          <div className="panel p-5">
            <h4 className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-primary" /> {t("steps")}
            </h4>
            <ol className="mt-3 space-y-2 text-sm">
              {(plans[active] ?? plans[0]!).steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
