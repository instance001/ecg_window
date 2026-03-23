export type EcgWindowPayload = {
  supported: boolean;
  available: boolean;
  label: string;
  note: string;
  current_percent: number;
  history: number[];
};

export type EcgPoint = {
  x: number;
  y: number;
};

export type EcgWindowPaths = {
  linePath: string;
  areaPath: string;
};

export type ReadSignal = () => number | null | undefined;
export type ProbeSignalSupport = () => boolean;

export type EcgWindowOptions = {
  label?: string;
  maxHistory?: number;
  probeSignalSupport?: ProbeSignalSupport;
  readSignal: ReadSignal;
};

export class EcgWindowSampler {
  private supported = false;
  private available = false;
  private note = "Telemetry is not available in this environment.";
  private currentPercent = 0;
  private readonly history: number[] = [];
  private readonly label: string;
  private readonly maxHistory: number;
  private readonly probeSignalSupport: ProbeSignalSupport;
  private readonly readSignal: ReadSignal;

  constructor(options: EcgWindowOptions) {
    this.label = options.label ?? "ECG Window";
    this.maxHistory = options.maxHistory ?? 50;
    this.probeSignalSupport = options.probeSignalSupport ?? (() => true);
    this.readSignal = options.readSignal;
  }

  initialize(): void {
    this.supported = this.probeSignalSupport();
    this.available = false;
    this.note = this.supported
      ? "Waiting for first telemetry sample."
      : "Telemetry is not available in this environment.";
  }

  sampleOnce(): void {
    if (!this.supported) {
      return;
    }

    const sample = this.readNormalizedActivityPercent();
    if (sample == null) {
      this.available = false;
      this.note = "Telemetry temporarily unavailable.";
      return;
    }

    this.available = true;
    this.note = "ECG-style view of current workload activity.";
    this.currentPercent = sample;
    this.appendSample(sample);
  }

  getPayload(): EcgWindowPayload {
    return {
      supported: this.supported,
      available: this.available,
      label: this.label,
      note: this.note,
      current_percent: this.currentPercent,
      history: [...this.history],
    };
  }

  getPaths(width: number, height: number): EcgWindowPaths {
    const points = EcgWindowSampler.buildPoints(this.history, width, height);
    return {
      linePath: EcgWindowSampler.buildLinePath(points),
      areaPath: EcgWindowSampler.buildAreaPath(points, height),
    };
  }

  static buildPoints(history: readonly number[], width: number, height: number): EcgPoint[] {
    if (history.length === 0) {
      return [];
    }

    if (history.length === 1) {
      return [{
        x: width / 2,
        y: height - (EcgWindowSampler.clamp(history[0], 0, 100) / 100) * height,
      }];
    }

    const stepX = width / (history.length - 1);

    return history.map((value, index) => ({
      x: index * stepX,
      y: height - (EcgWindowSampler.clamp(value, 0, 100) / 100) * height,
    }));
  }

  static buildLinePath(points: readonly EcgPoint[]): string {
    if (points.length === 0) {
      return "";
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
      path += ` L ${points[index].x} ${points[index].y}`;
    }

    return path;
  }

  static buildAreaPath(points: readonly EcgPoint[], height: number): string {
    if (points.length === 0) {
      return "";
    }

    let path = EcgWindowSampler.buildLinePath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    path += ` L ${lastPoint.x} ${height}`;
    path += ` L ${firstPoint.x} ${height}`;
    path += " Z";
    return path;
  }

  private readNormalizedActivityPercent(): number | null {
    const rawSignal = this.readSignal();
    if (rawSignal == null || Number.isNaN(rawSignal) || !Number.isFinite(rawSignal)) {
      return null;
    }

    return EcgWindowSampler.clamp(rawSignal, 0, 100);
  }

  private appendSample(value: number): void {
    this.history.push(value);

    while (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  private static clamp(value: number, minValue: number, maxValue: number): number {
    if (value < minValue) {
      return minValue;
    }

    if (value > maxValue) {
      return maxValue;
    }

    return value;
  }
}

/*
Example usage:

const ecg = new EcgWindowSampler({
  label: "ECG Window - Local GPU",
  probeSignalSupport: () => true,
  readSignal: () => 73,
});

ecg.initialize();
ecg.sampleOnce();

const payload = ecg.getPayload();
const paths = ecg.getPaths(320, 72);
*/
