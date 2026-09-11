import { useState } from "react";
import { Ambulance, Flame, ShieldAlert, TriangleAlert, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { makeT } from "@/lib/i18n";

type T = ReturnType<typeof makeT>;

type RouteOption = {
  id: string;
  name: string;
  etaMin: number;
  km: number;
  traffic: "light" | "moderate" | "heavy";
  note: string;
};

const ROUTES: RouteOption[] = [
  {
    id: "a",
    name: "Ring Road → Trauma Gate",
    etaMin: 7,
    km: 4.2,
    traffic: "moderate",
    note: "Two signals, bus lane usable",
  },
  {
    id: "b",
    name: "Market Street shortcut",
    etaMin: 6,
    km: 3.4,
    traffic: "heavy",
    note: "Narrow, market crowd after 6 pm",
  },
  {
    id: "c",
    name: "Flyover bypass",
    etaMin: 9,
    km: 6.1,
    traffic: "light",
    note: "No junctions, road works cleared",
  },
];

const VEHICLES = [
  { key: "ambulance", icon: Ambulance },
  { key: "fire", icon: Flame },
  { key: "policeVeh", icon: ShieldAlert },
] as const;

export function FleetModule({ t }: { t: T }) {
  const [vehicle, setVehicle] = useState<(typeof VEHICLES)[number]["key"]>("ambulance");
  const [destination, setDestination] = useState("City General Hospital — Trauma Unit");
  const [selected, setSelected] = useState("a");
  const [stuck, setStuck] = useState(false);
  const [sent, setSent] = useState(false);

  const options = stuck
    ? ROUTES.map((r) => (r.id === selected ? { ...r, etaMin: r.etaMin + 11, traffic: "heavy" as const } : r))
    : ROUTES;
  const best = [...options].sort((x, y) => x.etaMin - y.etaMin)[0]!;
  const noAlternative = stuck && best.id === selected;

  const trafficTone = (x: RouteOption["traffic"]) =>
    x === "heavy" ? "text-signal" : x === "moderate" ? "text-warn" : "text-safe";

  return (
    <div className="space-y-6">
      <div className="panel space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {VEHICLES.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              variant={vehicle === key ? "default" : "secondary"}
              onClick={() => setVehicle(key)}
            >
              <Icon className="size-4" /> {t(key)}
            </Button>
          ))}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("destination")}
          </label>
          <Input
            className="mt-1"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={stuck ? "destructive" : "outline"} onClick={() => setStuck(!stuck)}>
            <TriangleAlert className="size-4" /> {t("stuck")}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("routes")}</h3>
        {options.map((r) => (
          <div
            key={r.id}
            className={`panel flex flex-wrap items-center justify-between gap-4 p-4 ${
              selected === r.id ? "border-primary/70" : ""
            }`}
          >
            <div>
              <p className="flex items-center gap-2 font-medium">
                <RouteIcon className="size-4 text-primary" /> {r.name}
                {best.id === r.id && <Badge>{t("fastest")}</Badge>}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold tabular-nums">
                {r.etaMin} min <span className="text-sm text-muted-foreground">· {r.km} km</span>
              </p>
              <p className={`text-xs uppercase tracking-wider ${trafficTone(r.traffic)}`}>
                {t("traffic")}: {r.traffic}
              </p>
            </div>
            <Button variant={selected === r.id ? "default" : "secondary"} onClick={() => setSelected(r.id)}>
              {t("chooseRoute")}
            </Button>
          </div>
        ))}
      </div>

      {noAlternative && (
        <div className="panel siren-pulse border-signal/60 p-5">
          <h3 className="text-lg font-bold text-signal">🚨 {t("clearanceTitle")}</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              [t("vehicleType"), t(vehicle)],
              [t("location"), "Market Street · 12.97412, 77.60122"],
              [t("destination"), destination],
              [t("direction"), "North-bound"],
              [t("traffic"), "Heavy"],
              [t("clearanceArea"), "Market Street junction → Ring Road entry (600 m)"],
              [t("reason"), t("reasonText")],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-secondary/60 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">{t("clearanceNote")}</p>
          <Button className="mt-4" variant="destructive" onClick={() => setSent(true)} disabled={sent}>
            {sent ? `✓ ${t("clearanceSent")}` : t("clearanceSent")}
          </Button>
        </div>
      )}
    </div>
  );
}
