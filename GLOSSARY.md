# Glossary (Repo Excerpt)

For the full glossary, see: https://github.com/instance001/Whatisthisgithub/blob/main/GLOSSARY.md

This file contains only the glossary entries for this repository. Mapping tag legends and global notes live in the full glossary.

## ecg_window
| Term | Alternate term(s) | Alt map | External map | Relation to existing terminology | What it is | What it is not | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ECG Window | activity monitor | ~ | ~ | Glanceable activity indicator | Tiny language-agnostic activity monitor that renders an ECG-style trace from normalized workload samples to show whether long-running local work is still alive | Not deep telemetry; not a full monitoring suite | ecg_window/README.md; ecg_window/docs/zero-knowledge-user-guide.md |
| Signal source | activity signal | ~ | ~ | Telemetry input | Local activity source normalized to `0..100`, with preferred order GPU activity then CPU activity then queue or worker utilization when needed | Not tied to a telemetry vendor; not required to combine many signals at once | ecg_window/README.md; ecg_window/docs/signal-sources.md; ecg_window/docs/architecture.md |
| Rolling buffer | history buffer | = | ~ | Short history queue for sparkline rendering | Fixed-length recent sample history that forms the entire graph model; recommended defaults are about 40-60 samples with roughly 1200-2000 ms polling | Not an unbounded log or time-series database | ecg_window/README.md; ecg_window/docs/architecture.md |
| ECG Window contract | canonical payload, ecg-window schema | ~ | ~ | UI/backend contract | Small payload shape exposing `supported`, `available`, `label`, `note`, `current_percent`, and `history`; canonical JSON examples use `snake_case` | Not tied to a specific transport layer, language, or telemetry vendor | ecg_window/spec/ecg-window-contract.md; ecg_window/spec/ecg-window.schema.json |
| Supported/available state model | supported, available | ~ | ~ | Availability state model | Two-flag model separating whether telemetry can exist in this environment from whether a fresh sample is currently available right now | Not interchangeable flags; `supported=false` with `available=true` is invalid | ecg_window/README.md; ecg_window/spec/ecg-window-contract.md |
