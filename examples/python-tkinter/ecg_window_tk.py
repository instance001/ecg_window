from __future__ import annotations

import tkinter as tk
from tkinter import ttk
from typing import Callable, Dict, List


Payload = Dict[str, object]


class EcgWindow(ttk.Frame):
    def __init__(self, master: tk.Misc, width: int = 320, height: int = 72) -> None:
        super().__init__(master, padding=12)
        self._chart_width = width
        self._chart_height = height

        self.columnconfigure(0, weight=1)
        self.columnconfigure(1, weight=0)

        self.canvas = tk.Canvas(
            self,
            width=width,
            height=height,
            bg="#07111F",
            highlightthickness=1,
            highlightbackground="#1F2937",
        )
        self.canvas.grid(row=0, column=0, rowspan=3, sticky="nsew", padx=(0, 12))

        self.label_var = tk.StringVar(value="ECG Window")
        self.percent_var = tk.StringVar(value="")
        self.note_var = tk.StringVar(value="Telemetry is not available in this environment.")

        ttk.Label(self, textvariable=self.label_var).grid(row=0, column=1, sticky="e")
        ttk.Label(self, textvariable=self.percent_var, font=("Segoe UI", 20, "bold")).grid(row=1, column=1, sticky="e")
        self.note_label = ttk.Label(self, textvariable=self.note_var, wraplength=220, justify="right")
        self.note_label.grid(row=2, column=1, sticky="e")

    def update_payload(self, payload: Payload) -> None:
        supported = bool(payload.get("supported", False))
        available = bool(payload.get("available", False))
        label = str(payload.get("label", "ECG Window"))
        note = str(payload.get("note", "Telemetry is not available in this environment."))
        current_percent = float(payload.get("current_percent", 0))
        history = [float(value) for value in payload.get("history", [])]

        self.label_var.set(label)
        self.note_var.set(note)
        self.note_label.configure(foreground="#6EE7B7" if available else "#FBBF24")

        self.canvas.delete("all")

        if not supported:
            self.percent_var.set("")
            self.canvas.create_text(
                self._chart_width / 2,
                self._chart_height / 2,
                text=note,
                fill="#D1D5DB",
                font=("Segoe UI", 11, "bold"),
            )
            return

        self.percent_var.set(f"{round(current_percent)}%")

        points = build_points(history, self._chart_width, self._chart_height)
        if not points:
            return

        flat_points = [coordinate for point in points for coordinate in point]
        fill_points = flat_points + [points[-1][0], self._chart_height, points[0][0], self._chart_height]
        line_color = "#34D399" if available else "#6B7280"

        self.canvas.create_polygon(*fill_points, fill="#1C8F69", outline="")
        self.canvas.create_line(*flat_points, fill=line_color, width=3)

    def start_polling(self, fetch_payload: Callable[[], Payload], interval_ms: int = 1500) -> None:
        def tick() -> None:
            self.update_payload(fetch_payload())
            self.after(interval_ms, tick)

        tick()


def build_points(history: List[float], width: int, height: int) -> List[tuple[float, float]]:
    if not history:
        return []

    if len(history) == 1:
        return [(width / 2.0, height - (clamp(history[0], 0.0, 100.0) / 100.0) * height)]

    step_x = width / float(len(history) - 1)
    points = []

    for index, value in enumerate(history):
        normalized = clamp(value, 0.0, 100.0)
        x = float(index) * step_x
        y = height - (normalized / 100.0) * height
        points.append((x, y))

    return points


def clamp(value: float, min_value: float, max_value: float) -> float:
    if value < min_value:
        return min_value
    if value > max_value:
        return max_value
    return value


if __name__ == "__main__":
    demo_samples = [8, 12, 18, 72, 61, 89, 44, 36, 77, 28, 14]
    index = {"value": 0}

    def fetch_demo_payload() -> Payload:
        current_index = index["value"]
        index["value"] = (current_index + 1) % len(demo_samples)
        history = [demo_samples[(current_index + offset) % len(demo_samples)] for offset in range(18)]

        return {
            "supported": True,
            "available": True,
            "label": "ECG Window - Tk Demo",
            "note": "ECG-style view of current workload activity.",
            "current_percent": demo_samples[current_index],
            "history": history,
        }

    root = tk.Tk()
    root.title("ECG Window Tkinter Example")
    root.configure(bg="#020617")

    style = ttk.Style(root)
    style.theme_use("clam")
    style.configure("TFrame", background="#111827")
    style.configure("TLabel", background="#111827", foreground="#F9FAFB")

    widget = EcgWindow(root, width=360, height=88)
    widget.pack(padx=20, pady=20)
    widget.start_polling(fetch_demo_payload, interval_ms=1200)

    root.mainloop()
