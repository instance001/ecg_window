# Architecture

The ECG Window has five moving parts:

## 1. Signal Source

Read a local activity signal that reflects whether meaningful work is happening.

Examples:

- Windows GPU engine utilization
- Linux GPU or CPU utilization
- macOS system or GPU activity
- queue depth or worker occupancy in a custom app

The repo does not hard-code a telemetry vendor. The contract is the stable part.

If you want the least-friction signal choice by platform, read [`signal-sources.md`](signal-sources.md).

## 2. Normalizer

Whatever raw telemetry you collect, convert it into a single percentage:

- minimum `0`
- maximum `100`
- same meaning every time

If several raw signals are available, choose the one that best represents active work. For GPU-heavy tools, that is often the busiest engine or busiest compute-related signal.

## 3. Rolling Buffer

Store a short history of recent values. This is the entire graph model.

Recommended defaults:

- `max_history = 50`
- append every `1200ms` to `2000ms`
- drop the oldest value when the buffer is full

## 4. Delivery Layer

Expose the current state through one of these patterns:

- local HTTP endpoint
- websocket payload
- app state store
- desktop IPC
- direct in-process state access

The delivery mechanism is replaceable. The payload shape should stay simple.

The recommended state model is:

- `supported`: can this integration support ECG Window telemetry here at all
- `available`: do we currently have a fresh usable sample

## 5. Renderer

The UI only needs to do three things:

1. draw a line from the history values
2. optionally fill the area under the line
3. show the current percentage and a short label

That is enough to communicate life, activity, and stillness.

## Data Flow

```text
raw telemetry
  -> normalize to 0..100
  -> append to fixed-length history
  -> expose current payload
  -> render ECG Window trace + label
```

## Failure Model

If telemetry is unavailable:

- do not crash the host application
- mark support or availability clearly
- keep the rest of the job flow working
- use neutral messaging

Good telemetry UI should degrade quietly.
