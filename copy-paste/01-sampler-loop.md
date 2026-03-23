# Sampler Loop

Purpose: poll a local activity signal and turn it into normalized ECG Window samples.

```text
state:
  supported = false
  available = false
  label = "ECG Window"
  note = "Telemetry is not available in this environment."
  currentPercent = 0
  history = []
  pollIntervalMs = 1500
  maxHistory = 50

function initializeEcgWindow():
  supported = probeSignalSupport()
  available = false

  if supported:
    note = "Waiting for first telemetry sample."
  else:
    note = "Telemetry is not available in this environment."

function readNormalizedActivityPercent():
  rawSignal = readPlatformSignal()

  if rawSignal is unavailable:
    return null

  percent = clamp(rawSignal, 0, 100)
  return roundToOneDecimal(percent)

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

initializeEcgWindow()
sampleOnce()

start repeating timer every pollIntervalMs:
  sampleOnce()
```

If your platform exposes several candidate signals, sample the one that best matches real work. For generation tools, that is often the busiest GPU engine or compute-related path.
