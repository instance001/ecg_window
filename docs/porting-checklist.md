# Porting Checklist

Use this list when lifting the ECG Window into another codebase.

## Backend or Local State

1. Choose a signal source.
2. Convert the raw value into a percentage from `0` to `100`.
3. Poll at a steady interval.
4. Keep a fixed-length history array.
5. Distinguish between `supported` and `available`.
6. Expose the canonical payload shape.

## Frontend or Renderer

1. Read `history`.
2. Convert each sample into an `(x, y)` point.
3. Draw a line path.
4. Optionally draw a filled area under the line.
5. Show `current_percent` as a label.
6. Show a neutral fallback when data is unavailable.

## Product Rules

1. Keep the widget visually small.
2. Avoid advanced charts, legends, axes, and config overload.
3. Use language that reassures users.
4. Tell the truth. Do not fake activity just to make the UI feel alive.

## Vendor Notes

- Prefer GPU activity when the workload is GPU-bound.
- Use CPU activity as a fallback if GPU telemetry is hard to obtain.
- Use app-level workload signals when hardware telemetry is awkward or fragmented.
- If multiple devices exist, pick the one most responsible for active work.
- If a platform cannot provide telemetry, the feature should quietly opt out.
