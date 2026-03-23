# ECG Window Contract

This document defines the meaning of the ECG Window payload fields.

If you want machine validation, use [`ecg-window.schema.json`](ecg-window.schema.json).
If you want to understand the contract quickly, read this file first.

## Canonical JSON Shape

The canonical JSON examples in this repo use `snake_case`.

If your application uses `camelCase` internally, that is fine. Map to and from your local style at the edges if needed.

```json
{
  "supported": true,
  "available": true,
  "label": "ECG Window - Local GPU",
  "note": "ECG-style view of the busiest local compute signal.",
  "current_percent": 68.4,
  "history": [11.2, 14.8, 62.1, 75.0, 68.4]
}
```

## Field Meanings

### `supported`

Whether this environment and this integration support ECG Window telemetry at all.

Examples:

- `false` on a platform where you chose not to implement telemetry
- `false` when the host environment cannot provide the signal you need
- `true` when the feature is implemented and should be able to work here

### `available`

Whether a fresh usable telemetry sample is currently available.

Examples:

- `false` during a temporary telemetry outage
- `false` before the first successful sample arrives
- `true` when the latest data is fresh enough to display as live

### `label`

Human-friendly name for the signal source shown to the user.

Examples:

- `ECG Window - Local GPU`
- `ECG Window - CPU Activity`
- `ECG Window - Render Queue`

### `note`

Short explanation of the current state.

Examples:

- `ECG-style view of the busiest local compute signal.`
- `Telemetry temporarily unavailable.`
- `Telemetry is not available in this environment.`

### `current_percent`

Latest known normalized activity sample from `0` to `100`.

When `available` is `false`, this may be:

- the last known value, if you freeze on temporary outage
- `0`, if you prefer to clear on temporary outage

Choose one behavior and keep it consistent.

### `history`

Recent normalized activity samples in order from oldest to newest.

When `available` is `false`, this may be:

- the last known history, if you freeze on temporary outage
- an empty array, if you prefer to clear on temporary outage

The recommended default is to freeze the last known history during short outages.

## Valid State Combinations

### Unsupported

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

### Temporarily Unavailable

```json
{
  "supported": true,
  "available": false,
  "label": "ECG Window - Local GPU",
  "note": "Telemetry temporarily unavailable.",
  "current_percent": 68.4,
  "history": [11.2, 14.8, 62.1, 75.0, 68.4]
}
```

### Live

```json
{
  "supported": true,
  "available": true,
  "label": "ECG Window - Local GPU",
  "note": "ECG-style view of the busiest local compute signal.",
  "current_percent": 68.4,
  "history": [11.2, 14.8, 62.1, 75.0, 68.4]
}
```

## Invalid State

This is not valid:

```json
{
  "supported": false,
  "available": true
}
```

If telemetry is unsupported, it cannot also be currently available.
