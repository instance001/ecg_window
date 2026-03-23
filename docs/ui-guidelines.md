# UI Guidelines

The ECG Window works best when it behaves like a tiny instrument panel.

## Visual Priorities

- the line graph is the primary signal
- the percentage label is secondary
- the note is tertiary

## Size

Recommended target size:

- width: `220px` to `420px`
- height: `48px` to `96px`

It should feel quick to scan, not like a dashboard module.

## Chart Rules

- map `0` to the bottom edge
- map `100` to the top edge
- use the full available width
- keep line thickness readable
- optionally fill the area under the line with a subtle tint

## Text Rules

- use a human-friendly label such as `ECG Window`
- keep notes short
- avoid raw telemetry jargon unless your audience is technical

## States

### Active

- moving line
- fresh percentage
- normal note

### Idle

- low or flat line
- low percentage
- no warning styling needed

### Unavailable

- hide the chart or show a neutral placeholder
- if you keep the last known trace, visually de-emphasize it
- use wording like `Telemetry temporarily unavailable`
- never show an error that suggests the workload itself failed

## What To Avoid

- axes, gridlines, and chart chrome
- multiple series
- alert colors by default
- noisy animation unrelated to real samples
- pretending the machine is active when it is not
