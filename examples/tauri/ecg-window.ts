import { invoke } from "@tauri-apps/api/core";

export type EcgWindowPayload = {
  supported: boolean;
  available: boolean;
  label: string;
  note: string;
  current_percent: number;
  history: number[];
};

type StartTauriEcgWindowOptions = {
  container: HTMLElement;
  commandName?: string;
  intervalMs?: number;
  width?: number;
  height?: number;
};

export function startTauriEcgWindow({
  container,
  commandName = "get_ecg_window",
  intervalMs = 1500,
  width = 320,
  height = 72,
}: StartTauriEcgWindowOptions) {
  let stopped = false;
  let timerId: number | null = null;

  async function tick() {
    if (stopped) {
      return;
    }

    const payload = await invoke<EcgWindowPayload>(commandName);
    renderEcgWindow(container, payload, { width, height });
    timerId = window.setTimeout(tick, intervalMs);
  }

  void tick();

  return () => {
    stopped = true;
    if (timerId != null) {
      window.clearTimeout(timerId);
    }
  };
}

function renderEcgWindow(
  container: HTMLElement,
  payload: EcgWindowPayload,
  options: { width: number; height: number },
) {
  const { width, height } = options;

  if (!payload.supported) {
    container.innerHTML = `
      <div style="${panelStyle()}; gap:0.35rem; color:#d1d5db;">
        <strong>${escapeHtml(payload.label || "ECG Window")}</strong>
        <span>${escapeHtml(payload.note)}</span>
      </div>
    `;
    return;
  }

  const points = buildPoints(payload.history, width, height);
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, height);
  const chartOpacity = payload.available ? 1 : 0.35;
  const statusColor = payload.available ? "#6ee7b7" : "#fbbf24";

  container.innerHTML = `
    <div style="${panelStyle()}">
      <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-label="${escapeHtml(payload.note)}" style="display:block; overflow:visible;">
        <path d="${areaPath}" fill="rgba(52, 211, 153, 0.18)" opacity="${chartOpacity}"></path>
        <path d="${linePath}" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="${chartOpacity}"></path>
      </svg>
      <div style="display:grid; gap:0.15rem; justify-items:end; white-space:nowrap;">
        <div style="color:#d1d5db; font-size:0.95rem; font-weight:600;">${escapeHtml(payload.label)}</div>
        <div style="font-size:1.8rem; font-weight:700; line-height:1; color:#f9fafb;">${Math.round(payload.current_percent)}%</div>
        <div style="font-size:0.82rem; color:${statusColor};">${escapeHtml(payload.note)}</div>
      </div>
    </div>
  `;
}

function buildPoints(history: readonly number[], width: number, height: number) {
  if (history.length === 0) {
    return [];
  }

  if (history.length === 1) {
    return [{
      x: width / 2,
      y: height - (clamp(history[0], 0, 100) / 100) * height,
    }];
  }

  const stepX = width / (history.length - 1);

  return history.map((value, index) => ({
    x: index * stepX,
    y: height - (clamp(value, 0, 100) / 100) * height,
  }));
}

function buildLinePath(points: ReadonlyArray<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    path += ` L ${points[index].x} ${points[index].y}`;
  }
  return path;
}

function buildAreaPath(points: ReadonlyArray<{ x: number; y: number }>, height: number) {
  if (points.length === 0) {
    return "";
  }

  const last = points[points.length - 1];
  const first = points[0];
  let path = buildLinePath(points);
  path += ` L ${last.x} ${height}`;
  path += ` L ${first.x} ${height}`;
  path += " Z";
  return path;
}

function clamp(value: number, minValue: number, maxValue: number) {
  if (value < minValue) {
    return minValue;
  }
  if (value > maxValue) {
    return maxValue;
  }
  return value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function panelStyle() {
  return [
    "display:grid",
    "grid-template-columns:minmax(0, 1fr) auto",
    "gap:0.9rem",
    "align-items:center",
    "padding:0.9rem 1rem",
    "border-radius:16px",
    "background:linear-gradient(135deg, #0f172a, #111827)",
    "border:1px solid #1f2937",
  ].join("; ");
}

/*
Frontend usage:

import { startTauriEcgWindow } from "./ecg-window";

startTauriEcgWindow({
  container: document.getElementById("ecg-window")!,
  commandName: "get_ecg_window",
});

Backend note:
Create a Tauri command named "get_ecg_window" that returns the canonical ECG Window payload.
*/
