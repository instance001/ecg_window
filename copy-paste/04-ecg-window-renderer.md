# ECG Window Renderer

Purpose: convert history values into points for a line chart with no axes.

```text
function buildPoints(history, width, height):
  if history.length == 0:
    return []

  if history.length == 1:
    x = width / 2
    y = height - (clamp(history[0], 0, 100) / 100) * height
    return [{ x: x, y: y }]

  stepX = width / (history.length - 1)
  points = []

  for i from 0 to history.length - 1:
    value = clamp(history[i], 0, 100)
    x = i * stepX
    y = height - (value / 100) * height
    points.push({ x: x, y: y })

  return points
```

Line path shape:

```text
function buildLinePath(points):
  if points.length == 0:
    return ""

  path = "M " + points[0].x + " " + points[0].y

  for each point after the first:
    path = path + " L " + point.x + " " + point.y

  return path
```

Optional filled area:

```text
function buildAreaPath(points, height):
  if points.length == 0:
    return ""

  path = buildLinePath(points)
  path = path + " L " + points[points.length - 1].x + " " + height
  path = path + " L " + points[0].x + " " + height
  path = path + " Z"
  return path
```

UI update:

```text
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
