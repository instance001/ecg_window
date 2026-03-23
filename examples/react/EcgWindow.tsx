import type { CSSProperties } from "react";

export type EcgWindowPayload = {
  supported: boolean;
  available: boolean;
  label: string;
  note: string;
  current_percent: number;
  history: number[];
};

type EcgPoint = {
  x: number;
  y: number;
};

type EcgWindowProps = {
  payload: EcgWindowPayload;
  width?: number;
  height?: number;
  className?: string;
};

export function EcgWindow({
  payload,
  width = 320,
  height = 72,
  className,
}: EcgWindowProps) {
  if (!payload.supported) {
    return (
      <div className={className} style={unsupportedStyle}>
        <strong>{payload.label || "ECG Window"}</strong>
        <span>{payload.note}</span>
      </div>
    );
  }

  const points = buildPoints(payload.history, width, height);
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, height);
  const chartOpacity = payload.available ? 1 : 0.35;
  const percentageLabel = `${Math.round(payload.current_percent)}%`;
  const statusColor = payload.available ? "#6ee7b7" : "#fbbf24";

  return (
    <div className={className} style={panelStyle}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        aria-label={payload.note}
        style={{ display: "block", overflow: "visible" }}
      >
        <path d={areaPath} fill="rgba(52, 211, 153, 0.18)" opacity={chartOpacity} />
        <path
          d={linePath}
          fill="none"
          stroke="#34d399"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={chartOpacity}
        />
      </svg>

      <div style={metaStyle}>
        <div style={labelStyle}>{payload.label}</div>
        <div style={percentStyle}>{percentageLabel}</div>
        <div style={{ ...noteStyle, color: statusColor }}>{payload.note}</div>
      </div>
    </div>
  );
}

function buildPoints(history: readonly number[], width: number, height: number): EcgPoint[] {
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

function buildLinePath(points: readonly EcgPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    path += ` L ${points[index].x} ${points[index].y}`;
  }
  return path;
}

function buildAreaPath(points: readonly EcgPoint[], height: number): string {
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

function clamp(value: number, minValue: number, maxValue: number): number {
  if (value < minValue) {
    return minValue;
  }
  if (value > maxValue) {
    return maxValue;
  }
  return value;
}

const panelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "0.9rem",
  alignItems: "center",
  padding: "0.9rem 1rem",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #0f172a, #111827)",
  border: "1px solid #1f2937",
  color: "#f9fafb",
};

const unsupportedStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  padding: "0.9rem 1rem",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #0f172a, #111827)",
  border: "1px solid #1f2937",
  color: "#d1d5db",
};

const metaStyle: CSSProperties = {
  display: "grid",
  gap: "0.15rem",
  justifyItems: "end",
  whiteSpace: "nowrap",
};

const labelStyle: CSSProperties = {
  color: "#d1d5db",
  fontSize: "0.95rem",
  fontWeight: 600,
};

const percentStyle: CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 700,
  lineHeight: 1,
};

const noteStyle: CSSProperties = {
  fontSize: "0.82rem",
};

/*
Example usage:

<EcgWindow payload={payload} width={360} height={84} />
*/
