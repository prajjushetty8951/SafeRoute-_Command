export type SensorReading = {
  impactG: number; // accelerometer peak, g
  tiltDeg: number; // gyroscope derived roll angle
  speedKmh: number;
  airbag: boolean;
  lat: number;
  lng: number;
  at: number;
};

export type Verdict = "normal" | "uncertain" | "crash";

export type Assessment = {
  verdict: Verdict;
  score: number;
  rollover: boolean;
  severity: "low" | "medium" | "high";
  signals: string[];
};

/**
 * Multi-signal fusion: no single sensor decides. Each contributing signal adds
 * weight; only a combined score crosses the emergency threshold.
 */
export function assess(current: SensorReading, previousSpeed: number): Assessment {
  const signals: string[] = [];
  let score = 0;

  if (current.impactG >= 6) {
    score += 45;
    signals.push("High impact force");
  } else if (current.impactG >= 3) {
    score += 20;
    signals.push("Moderate impact force");
  }

  const drop = previousSpeed - current.speedKmh;
  if (drop >= 40) {
    score += 30;
    signals.push("Sudden loss of speed");
  } else if (drop >= 20) {
    score += 15;
    signals.push("Rapid braking");
  }

  const rollover = Math.abs(current.tiltDeg) >= 60;
  if (rollover) {
    score += 35;
    signals.push("Vehicle rollover angle");
  } else if (Math.abs(current.tiltDeg) >= 30) {
    score += 12;
    signals.push("Abnormal tilt");
  }

  if (current.airbag) {
    score += 40;
    signals.push("Airbag / crash line triggered");
  }

  const verdict: Verdict = score >= 70 ? "crash" : score >= 35 ? "uncertain" : "normal";
  const severity = score >= 90 ? "high" : score >= 60 ? "medium" : "low";

  return { verdict, score: Math.min(score, 100), rollover, severity, signals };
}

export const NEARBY_SERVICES = {
  hospital: { name: "City General Hospital — Trauma Unit", distanceKm: 2.4, etaMin: 6 },
  police: { name: "Central Traffic Control Post", distanceKm: 1.1, etaMin: 4 },
};

export function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
