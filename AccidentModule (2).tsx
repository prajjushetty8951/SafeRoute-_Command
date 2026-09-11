import { useEffect, useRef, useState } from "react";
import { Ambulance, ShieldAlert, Navigation, Activity, Gauge, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { assess, formatCoords, NEARBY_SERVICES, type SensorReading } from "@/lib/telemetry";
import type { makeT } from "@/lib/i18n";

type T = ReturnType<typeof makeT>;

const BASE: SensorReading = {
  impactG: 0.9,
  tiltDeg: 2,
  speedKmh: 58,
  airbag: false,
  lat: 12.97194,
  lng: 77.59369,
  at: 0,
};

function Stat({
  icon,
  label,
  value,
  pct,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <Progress value={Math.min(pct, 100)} className="mt-3 h-1.5" />
    </div>
  );
}

export function AccidentModule({ t }: { t: T }) {
  const [reading, setReading] = useState<SensorReading>({ ...BASE, at: Date.now() });
  const [prevSpeed, setPrevSpeed] = useState(BASE.speedKmh);
  const [frozen, setFrozen] = useState(false);
  const [notifyContact, setNotifyContact] = useState(true);
  const [dispatched, setDispatched] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setReading((r) => {
        if (frozen) return r;
        const speed = Math.max(0, Math.min(90, r.speedKmh + (Math.random() - 0.5) * 6));
        setPrevSpeed(r.speedKmh);
        return {
          ...r,
          impactG: 0.6 + Math.random() * 0.8,
          tiltDeg: (Math.random() - 0.5) * 6,
          speedKmh: speed,
          at: Date.now(),
        };
      });
    }, 1200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [frozen]);

  const a = assess(reading, prevSpeed);

  const trigger = (kind: "bump" | "crash") => {
    setPrevSpeed(reading.speedKmh || 62);
    setFrozen(true);
    setDispatched(kind === "crash");
    setReading((r) => ({
      ...r,
      impactG: kind === "crash" ? 8.4 : 3.6,
      tiltDeg: kind === "crash" ? 78 : 34,
      speedKmh: kind === "crash" ? 0 : 26,
      airbag: kind === "crash",
      at: Date.now(),
    }));
  };

  const reset = () => {
    setFrozen(false);
    setDispatched(false);
    setPrevSpeed(BASE.speedKmh);
    setReading({ ...BASE, at: Date.now() });
  };

  const tone =
    a.verdict === "crash" ? "text-signal" : a.verdict === "uncertain" ? "text-warn" : "text-safe";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Activity className="size-3.5" />}
          label={t("impact")}
          value={`${reading.impactG.toFixed(1)} g`}
          pct={reading.impactG * 11}
        />
        <Stat
          icon={<RotateCw className="size-3.5" />}
          label={t("tilt")}
          value={`${reading.tiltDeg.toFixed(0)}°`}
          pct={Math.abs(reading.tiltDeg)}
        />
        <Stat
          icon={<Gauge className="size-3.5" />}
          label={t("speed")}
          value={`${reading.speedKmh.toFixed(0)} km/h`}
          pct={reading.speedKmh}
        />
      </div>

      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("status")}</p>
            <p className={`text-xl font-semibold ${tone}`}>
              {a.verdict === "crash"
                ? t("crash")
                : a.verdict === "uncertain"
                  ? t("uncertain")
                  : t("normal")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {a.signals.length ? a.signals.join(" · ") : "Accelerometer, gyroscope, GPS, speed"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => trigger("bump")}>
              {t("simulateBump")}
            </Button>
            <Button variant="destructive" onClick={() => trigger("crash")}>
              {t("simulateCrash")}
            </Button>
            <Button variant="outline" onClick={reset}>
              {t("reset")}
            </Button>
          </div>
        </div>
        <Progress value={a.score} className="mt-4 h-2" />
      </div>

      {a.verdict === "uncertain" && (
        <div className="panel border-warn/50 p-5">
          <h3 className="text-lg font-semibold text-warn">{t("areYouOk")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("confirmText")}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={reset}>
              {t("imFine")}
            </Button>
            <Button variant="destructive" onClick={() => trigger("crash")}>
              {t("sendHelp")}
            </Button>
          </div>
        </div>
      )}

      {a.verdict === "crash" && (
        <div className="panel siren-pulse border-signal/60 p-5">
          <h3 className="text-xl font-bold text-signal">🚨 {t("alertTitle")}</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              [t("location"), formatCoords(reading.lat, reading.lng)],
              [t("time"), new Date(reading.at).toLocaleTimeString()],
              [t("severity"), t(a.severity === "high" ? "high" : a.severity === "medium" ? "medium" : "low")],
              [t("rollover"), a.rollover ? t("yes") : t("no")],
              [t("speedBefore"), `${prevSpeed.toFixed(0)} km/h`],
              [t("vehicle"), "KA 05 MJ 4821 · Hatchback · 4 seats"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-secondary/60 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Ambulance className="size-4 text-signal" /> {t("hospital")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {NEARBY_SERVICES.hospital.name} — {NEARBY_SERVICES.hospital.distanceKm} km ·{" "}
                {NEARBY_SERVICES.hospital.etaMin} min
              </p>
              {dispatched && <p className="mt-1 text-xs text-safe">✓ {t("notified")}</p>}
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="size-4 text-accent" /> {t("police")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {NEARBY_SERVICES.police.name} — {NEARBY_SERVICES.police.distanceKm} km ·{" "}
                {NEARBY_SERVICES.police.etaMin} min
              </p>
              {dispatched && <p className="mt-1 text-xs text-safe">✓ {t("notified")}</p>}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={notifyContact} onCheckedChange={setNotifyContact} />
              {notifyContact ? t("contactNotified") : t("notifyContact")}
            </label>
            <Button asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${reading.lat},${reading.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="size-4" /> {t("navigate")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
