# Backend Contract

Purpose: expose a tiny, stable payload that any frontend can render.

Canonical JSON examples in this repo use `snake_case`. If your application uses `camelCase` internally, map at the edges.

```text
function getEcgWindowPayload():
  return {
    supported: supported,
    available: available,
    label: label,
    note: note,
    current_percent: currentPercent,
    history: copyOf(history)
  }
```

Example response:

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

Keep the semantic fields the same:

- support state
- availability state
- human-friendly label
- short note
- current percentage
- ordered history array
