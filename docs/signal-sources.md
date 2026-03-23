# Signal Sources

This is the most important practical choice in the whole repo.

If you pick a clean, honest signal, the rest of the ECG Window is easy.

## Least-Pain Rule

If you want the fastest path:

1. Use GPU activity if your platform already exposes a clean local percentage.
2. If not, use CPU activity.
3. If OS telemetry is messy, use an honest app-level signal such as worker occupancy or queue activity.

Truth matters more than technical purity.

An honest app-level signal is better than a misleading fake GPU graph.

## Start Simple, Upgrade Later

You do not need to begin with the fanciest signal source.

A very reasonable rollout path is:

1. ship with CPU or app-level workload activity
2. prove the ECG Window is useful in your product
3. upgrade to GPU telemetry later if it is worth the effort

That path is often faster and safer than blocking release on platform-specific hardware work.

## Fast Decision Table

| Environment | First choice | Easy fallback | Last-resort truthful fallback |
| --- | --- | --- | --- |
| Windows | GPU engine or compute activity from the local system telemetry your users would expect to match Task Manager-style activity | CPU utilization | Worker occupancy, queue depth, active jobs, tokens or frames in flight |
| Linux | Vendor or system GPU utilization if your target environment exposes it cleanly | CPU utilization from standard system stats | Worker occupancy, queue depth, active jobs, tokens or frames in flight |
| macOS | A GPU or workload signal you already trust in your app environment | CPU or general system activity | Worker occupancy, queue depth, active jobs, tokens or frames in flight |
| Browser-only app | Backend-provided activity signal | Backend-provided CPU or worker signal | Queue depth, active requests, job heartbeat mapped honestly to `0..100` |

## Windows

Recommended order:

1. GPU activity
2. CPU activity
3. App-level workload activity

Windows is often the easiest place to do GPU-first ECG Window telemetry because many local AI tools already rely on the same general activity picture users compare against in Task Manager.

Use GPU activity when:

- your workload is clearly GPU-bound
- users expect the graph to reflect hardware work
- you already have access to local machine telemetry

Use CPU instead when:

- the job is mostly CPU-bound
- you want the simplest implementation path
- GPU telemetry is possible but annoying enough to slow shipping

## Linux

Recommended order:

1. GPU activity if your target distro and hardware stack expose it cleanly
2. CPU activity
3. App-level workload activity

Linux is powerful but fragmented. The "best" GPU source can vary by vendor, driver stack, and deployment target.

That means the least-friction path is often:

- use GPU telemetry if you already know your target environment
- otherwise default to CPU or app-level workload truth

If you are shipping to many Linux environments, portability usually matters more than chasing the most technically pure GPU metric.

## macOS

Recommended order:

1. A workload signal you can trust
2. CPU activity
3. GPU activity if your app already has a clean way to obtain it

For many teams, macOS is the place where "just use GPU telemetry" stops being the simplest advice.

If your app already has a reliable GPU-side signal, great.
If not, use CPU or a truthful app-level workload signal and keep moving.

The ECG Window is about visible life, not about winning a hardware telemetry purity contest.

## App-Level Signals Are Legit

You do not have to use hardware telemetry.

These are perfectly valid ECG Window inputs when they honestly reflect active work:

- worker occupancy
- queued items in flight
- active denoising steps
- active frame generation
- tokens per second mapped into a sensible percentage band
- active jobs divided by max parallel jobs

If users mainly care whether the process is alive, these signals can be more useful than vendor-specific hardware counters.

## Choosing Between GPU, CPU, And App-Level Signals

Use GPU when:

- your users naturally think of the workload as GPU-heavy
- the signal is available with low friction
- you want the graph to align with hardware activity

Use CPU when:

- implementation simplicity matters more than hardware specificity
- the job really is CPU-heavy
- GPU telemetry is fragmented or brittle

Use app-level activity when:

- you want the most portable option
- you control the job runner
- you want the graph to reflect meaningful work even when hardware counters are awkward

## One Signal Is Better Than Many

Do not combine lots of metrics into a complicated dashboard score.

Pick one signal that best answers:

> Is the machine meaningfully doing work right now?

That is enough for an ECG Window.
