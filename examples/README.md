# Drop-In Examples

These examples are optional.

The repo's core contract stays language-agnostic, but these files give you a concrete starting point if you want to lift ECG Window into a specific stack quickly.

## Core Logic Examples

- [`typescript/ecg-window.ts`](typescript/ecg-window.ts)
- [`python/ecg_window.py`](python/ecg_window.py)
- [`csharp/EcgWindow.cs`](csharp/EcgWindow.cs)
- [`rust/ecg_window.rs`](rust/ecg_window.rs)

## UI Integration Examples

- [`react/EcgWindow.tsx`](react/EcgWindow.tsx)
- [`browser/ecg-window.js`](browser/ecg-window.js)
- [`browser/index.html`](browser/index.html)
- [`tauri/ecg-window.ts`](tauri/ecg-window.ts)
- [`wpf/EcgWindowControl.xaml`](wpf/EcgWindowControl.xaml)
- [`wpf/EcgWindowControl.xaml.cs`](wpf/EcgWindowControl.xaml.cs)
- [`wpf/EcgWindowPayload.cs`](wpf/EcgWindowPayload.cs)
- [`python-tkinter/ecg_window_tk.py`](python-tkinter/ecg_window_tk.py)

## What The Core Logic Examples Do

Each example includes:

- the `supported` and `available` state model
- a fixed-length history buffer
- a normalized `0..100` sampler flow
- payload generation using the repo's canonical field meanings
- point and path helpers for rendering the ECG Window trace

## What The UI Examples Do

- The React example gives you a ready-to-drop component that renders from the canonical payload.
- The browser example gives you a no-framework renderer plus a polling helper.
- The Tauri example gives you a frontend polling bridge around a Tauri command.
- The WPF example gives you a drop-in control with a `Payload` property.
- The Tkinter example gives you a small desktop widget with a `start_polling()` helper.

## What You Replace

In every example, the main thing you swap out is the signal source:

- local GPU telemetry
- CPU telemetry
- worker occupancy
- queue activity
- another truthful activity signal

If your app already has a state store or transport layer, you can keep that and just lift the ECG Window state and geometry logic.

## Compatibility Notes

- The JSON examples in this repo use `snake_case`.
- The TypeScript example keeps the JSON payload in `snake_case`.
- The Python example returns the canonical `snake_case` payload.
- The C# and Rust examples expose idiomatic in-memory types plus methods you can map to JSON however your app prefers.
- The UI examples are intentionally self-contained so you can paste one file or a small file group into an existing app.

## Use The Smallest Example That Fits

- Choose TypeScript if your app is web-first or Electron-first.
- Choose Python if you want a quick local runner or backend example.
- Choose C# if you are integrating into a Windows desktop or .NET stack.
- Choose Rust if you want a fast systems-side sampler or backend component.
- Choose React if you already have a React frontend and just need the widget.
- Choose browser JS if you want the smallest no-framework web integration.
- Choose Tauri if your desktop app uses a webview frontend and Rust backend.
- Choose WPF if your Windows UI is native .NET desktop.
- Choose Tkinter if you want a tiny Python desktop demo or utility window.
