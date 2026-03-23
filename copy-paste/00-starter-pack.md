# Starter Pack

Purpose: give developers one end-to-end reference they can paste into their own project and adapt.

Licensing note: this repository is distributed under the GNU AGPLv3. See [`../LICENSE`](../LICENSE) before copying substantial material into another codebase.

Canonical JSON examples in this repo use `snake_case`. If your application uses `camelCase` internally, map at the edges and keep your behavior consistent.

## Minimal End-to-End Pseudocode

```text
state:
  supported = false
  available = false
  label = "ECG Window"
  note = "Telemetry is not available in this environment."
  currentPercent = 0
  history = []
  maxHistory = 50
  pollIntervalMs = 1500

function initializeEcgWindow():
  supported = probeSignalSupport()
  available = false

  if supported:
    note = "Waiting for first telemetry sample."
  else:
    note = "Telemetry is not available in this environment."

function clamp(value, minValue, maxValue):
  if value < minValue:
    return minValue
  if value > maxValue:
    return maxValue
  return value

function appendSample(history, value, maxHistory):
  history.push(value)

  while history.length > maxHistory:
    history.shift()

function readNormalizedActivityPercent():
  rawSignal = readPlatformSignal()

  if rawSignal is unavailable:
    return null

  return clamp(rawSignal, 0, 100)

function sampleOnce():
  if not supported:
    return

  sample = readNormalizedActivityPercent()

  if sample is null:
    available = false
    note = "Telemetry temporarily unavailable."
    return

  available = true
  note = "ECG-style view of current workload activity."
  currentPercent = sample
  appendSample(history, sample, maxHistory)

function getEcgWindowPayload():
  return {
    supported: supported,
    available: available,
    label: label,
    note: note,
    current_percent: currentPercent,
    history: copyOf(history)
  }

function buildPoints(history, width, height):
  if history.length == 0:
    return []

  if history.length == 1:
    return [{
      x: width / 2,
      y: height - (clamp(history[0], 0, 100) / 100) * height
    }]

  stepX = width / (history.length - 1)
  points = []

  for i from 0 to history.length - 1:
    value = clamp(history[i], 0, 100)
    x = i * stepX
    y = height - (value / 100) * height
    points.push({ x: x, y: y })

  return points

function buildLinePath(points):
  if points.length == 0:
    return ""

  path = "M " + points[0].x + " " + points[0].y

  for each point after the first:
    path = path + " L " + point.x + " " + point.y

  return path

function buildAreaPath(points, height):
  if points.length == 0:
    return ""

  path = buildLinePath(points)
  path = path + " L " + points[points.length - 1].x + " " + height
  path = path + " L " + points[0].x + " " + height
  path = path + " Z"
  return path

initializeEcgWindow()
sampleOnce()

start repeating timer every pollIntervalMs:
  sampleOnce()

on ui update:
  payload = getEcgWindowPayload()

  if not payload.supported:
    showNeutralUnavailableState(payload.note)
  else:
    points = buildPoints(payload.history, chartWidth, chartHeight)
    linePath = buildLinePath(points)
    areaPath = buildAreaPath(points, chartHeight)
    percentageLabel = round(payload.current_percent) + "%"

    if not payload.available:
      renderMutedTrace(linePath, areaPath, percentageLabel, payload.note)
    else:
      renderLiveTrace(linePath, areaPath, percentageLabel, payload.note)
```

## What You Replace

- `readPlatformSignal()` with your local telemetry source
- `probeSignalSupport()` with a simple capability check or fixed true/false decision
- `start repeating timer` with your runtime's scheduler
- `copyOf(history)` with your language's safe copy operation
- `showNeutralUnavailableState()`, `renderMutedTrace()`, and `renderLiveTrace()` with your UI toolkit
- the `linePath` and `areaPath` usage with your UI toolkit

## What You Keep

- normalized `0..100` samples
- fixed-length history
- separate `supported` and `available` states
- current payload plus recent history
- small, glanceable ECG Window UI
