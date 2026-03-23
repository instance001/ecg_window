# Zero-Knowledge User Guide

This guide assumes you are starting from zero.

You do not need to already know:

- GPU telemetry
- performance counters
- chart rendering
- signal processing
- platform-specific hardware APIs

You only need to understand one idea:

> The ECG Window is a tiny visual sign that a machine is still actively working.

## What This Thing Is

The ECG Window is a very small activity monitor for long-running jobs.

It is designed to answer a simple human question:

> Is the machine alive and doing something right now?

Instead of showing raw logs or complex hardware panels, it shows:

- a moving ECG-style graph
- a current activity percentage
- a short note or label

When the line moves, users feel confident the job is alive.
When the line stays low or flat, users can tell the machine is idle or in a quiet phase.

## Why Developers Add It

Many local workloads look frozen even when they are healthy.

Examples:

- image generation
- video generation
- LLM inference
- model loading
- shader compilation
- file encoding

The ECG Window helps developers reduce user anxiety without building a full monitoring dashboard.

## What It Is Not

The ECG Window is not:

- a full system monitor
- a replacement for Task Manager
- a deep hardware debugging tool
- an excuse to fake activity

Its whole job is reassurance, not analysis.

## What Users See

In the finished product, a user should see something small and easy to scan:

- a line that rises and falls with activity
- a percentage like `73%`
- a short label like `ECG Window - Local GPU`

That is enough.

If you add too much detail, the feature stops being calming and starts becoming a dashboard.

## What You Need To Provide

To adopt this in your own app, you only need four ingredients:

1. A signal source
2. A rolling history buffer
3. A tiny payload or state object
4. A small renderer

### 1. A Signal Source

Your app needs some way to estimate whether the machine is busy.

Best options:

- GPU utilization
- CPU utilization
- worker occupancy
- queue activity

The exact source does not matter as much as honesty does.

If the signal can be normalized to a percentage from `0` to `100`, it can work.

### 2. A Rolling History Buffer

You do not need to store lots of telemetry.

You only need a short recent history, usually around `40` to `60` samples.

That recent history is what creates the moving ECG-style trace.

### 3. A Tiny Payload

The frontend only needs a very small amount of data:

```json
{
  "supported": true,
  "available": true,
  "label": "ECG Window - Local GPU",
  "note": "ECG-style view of the busiest local compute signal.",
  "current_percent": 73.0,
  "history": [12.0, 31.0, 78.0, 64.0, 81.0]
}
```

What each field means:

- `supported`: whether this machine or environment supports ECG Window telemetry at all
- `available`: whether a fresh telemetry sample is currently available
- `label`: the human-friendly name shown in the UI
- `note`: a short explanation or fallback message
- `current_percent`: the most recent normalized activity sample
- `history`: recent samples in order from oldest to newest

### 4. A Small Renderer

The renderer takes the `history` values and draws them as a line.

That renderer can live in:

- a web app
- a desktop app
- Electron
- Tauri
- a game tool
- an in-app debug panel

The technology does not matter. The pattern does.

## How It Works In Plain English

The flow is simple:

1. Read an activity value every second or two.
2. Clamp it to `0..100`.
3. Add it to a short fixed-length history list.
4. Expose the latest value plus that history.
5. Draw the graph.

That is the whole feature.

## What "Supported" Means

Some machines or operating systems cannot provide the telemetry you want.

That should not break the app.

The simple rule is:

- `supported` answers "can this integration do ECG Window telemetry here at all?"
- `available` answers "do we have a fresh sample right now?"

If telemetry is unavailable:

- keep the main workload working
- show a neutral note
- hide the ECG Window or show a calm unavailable state

Good fallback example:

```json
{
  "supported": false,
  "available": false,
  "label": "ECG Window",
  "note": "Telemetry is not available in this environment.",
  "current_percent": 0,
  "history": []
}
```

## Good Defaults

If you do not know what to choose, start here:

- poll every `1500ms`
- keep `50` samples
- clamp every sample to `0..100`
- make the UI small
- use GPU as the signal if possible
- use CPU if GPU telemetry is too hard

## Common Mistakes

- Building a full telemetry suite instead of a tiny reassurance widget
- Using several metrics at once instead of one honest signal
- Showing hardware jargon to non-technical users
- Crashing or warning loudly when telemetry is unavailable
- Animating fake movement when the machine is actually idle
- Mixing up "unsupported forever" with "temporarily unavailable right now"

## If You Want The Fastest Path

Start here:

1. Read [`../copy-paste/00-starter-pack.md`](../copy-paste/00-starter-pack.md).
2. Use [`../spec/ecg-window.schema.json`](../spec/ecg-window.schema.json) as your contract.
3. Replace the placeholder signal reader with your own platform telemetry.
4. Render the ECG Window trace in whatever UI stack your app already uses.

## Short Version

The ECG Window is a tiny, honest "machine is alive" indicator.

If your app can produce a truthful activity percentage from `0` to `100`, this repo gives you the shape needed to turn that into a reusable ECG Window.
