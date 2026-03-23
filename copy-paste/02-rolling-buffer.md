# Rolling Buffer

Purpose: keep only the most recent samples needed for the ECG Window graph.

```text
function appendSample(history, value, maxHistory):
  history.push(value)

  while history.length > maxHistory:
    history.shift()
```

If `shift()` is too expensive in your environment, use a ring buffer instead:

```text
state:
  samples = array with size maxHistory
  count = 0
  writeIndex = 0

function appendSample(value):
  samples[writeIndex] = value
  writeIndex = (writeIndex + 1) mod maxHistory

  if count < maxHistory:
    count = count + 1

function getHistoryOldestToNewest():
  history = []

  for offset from 0 to count - 1:
    index = (writeIndex - count + offset + maxHistory) mod maxHistory
    history.push(samples[index])

  return history
```
