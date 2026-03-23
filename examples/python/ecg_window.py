from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Callable, Dict, List, Optional, Tuple


Point = Tuple[float, float]


@dataclass(slots=True)
class EcgWindowPayload:
    supported: bool
    available: bool
    label: str
    note: str
    current_percent: float
    history: List[float]

    def to_dict(self) -> Dict[str, object]:
        return {
            "supported": self.supported,
            "available": self.available,
            "label": self.label,
            "note": self.note,
            "current_percent": self.current_percent,
            "history": list(self.history),
        }


class EcgWindowSampler:
    def __init__(
        self,
        read_signal: Callable[[], Optional[float]],
        probe_signal_support: Optional[Callable[[], bool]] = None,
        label: str = "ECG Window",
        max_history: int = 50,
    ) -> None:
        self._read_signal = read_signal
        self._probe_signal_support = probe_signal_support or (lambda: True)
        self._max_history = max_history
        self.label = label
        self.supported = False
        self.available = False
        self.note = "Telemetry is not available in this environment."
        self.current_percent = 0.0
        self.history: List[float] = []

    def initialize(self) -> None:
        self.supported = self._probe_signal_support()
        self.available = False
        if self.supported:
            self.note = "Waiting for first telemetry sample."
        else:
            self.note = "Telemetry is not available in this environment."

    def sample_once(self) -> None:
        if not self.supported:
            return

        sample = self._read_normalized_activity_percent()
        if sample is None:
            self.available = False
            self.note = "Telemetry temporarily unavailable."
            return

        self.available = True
        self.note = "ECG-style view of current workload activity."
        self.current_percent = sample
        self._append_sample(sample)

    def get_payload(self) -> EcgWindowPayload:
        return EcgWindowPayload(
            supported=self.supported,
            available=self.available,
            label=self.label,
            note=self.note,
            current_percent=self.current_percent,
            history=list(self.history),
        )

    @staticmethod
    def build_points(history: List[float], width: float, height: float) -> List[Point]:
        if not history:
            return []

        if len(history) == 1:
            value = EcgWindowSampler._clamp(history[0], 0.0, 100.0)
            return [(width / 2.0, height - (value / 100.0) * height)]

        step_x = width / float(len(history) - 1)
        points: List[Point] = []

        for index, value in enumerate(history):
            normalized = EcgWindowSampler._clamp(value, 0.0, 100.0)
            x = float(index) * step_x
            y = height - (normalized / 100.0) * height
            points.append((x, y))

        return points

    @staticmethod
    def build_line_path(points: List[Point]) -> str:
        if not points:
            return ""

        start_x, start_y = points[0]
        path = f"M {start_x} {start_y}"

        for x, y in points[1:]:
            path += f" L {x} {y}"

        return path

    @staticmethod
    def build_area_path(points: List[Point], height: float) -> str:
        if not points:
            return ""

        last_x, _ = points[-1]
        first_x, _ = points[0]
        path = EcgWindowSampler.build_line_path(points)
        path += f" L {last_x} {height}"
        path += f" L {first_x} {height}"
        path += " Z"
        return path

    def _read_normalized_activity_percent(self) -> Optional[float]:
        raw_signal = self._read_signal()
        if raw_signal is None or not math.isfinite(raw_signal):
            return None

        return self._clamp(raw_signal, 0.0, 100.0)

    def _append_sample(self, value: float) -> None:
        self.history.append(value)
        while len(self.history) > self._max_history:
            self.history.pop(0)

    @staticmethod
    def _clamp(value: float, min_value: float, max_value: float) -> float:
        if value < min_value:
            return min_value
        if value > max_value:
            return max_value
        return value


if __name__ == "__main__":
    sampler = EcgWindowSampler(
        label="ECG Window - Local GPU",
        probe_signal_support=lambda: True,
        read_signal=lambda: 73.0,
    )

    sampler.initialize()
    sampler.sample_once()

    payload = sampler.get_payload()
    points = sampler.build_points(payload.history, 320.0, 72.0)

    print(payload.to_dict())
    print(EcgWindowSampler.build_line_path(points))
