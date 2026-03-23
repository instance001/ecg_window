# Failure Handling

Purpose: keep the ECG Window honest and gentle when telemetry is missing.

## Rules

- Do not crash the host application.
- Do not block the actual workload.
- Do not fake activity to make the UI feel alive.
- Prefer neutral wording.

## Recommended Behavior

If telemetry is permanently unsupported:

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

If telemetry is usually supported but temporarily unavailable:

- keep the feature visible if that fits your product
- keep `supported = true`
- set `available = false`
- use a note such as `Telemetry temporarily unavailable`
- recommended default: freeze the last known `current_percent` and `history`
- alternative: clear them if that better fits your product
- resume normal updates as soon as samples return

Choose one temporary-failure behavior and keep it consistent.
