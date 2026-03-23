#[derive(Debug, Clone)]
pub struct EcgWindowPayload {
    pub supported: bool,
    pub available: bool,
    pub label: String,
    pub note: String,
    pub current_percent: f64,
    pub history: Vec<f64>,
}

#[derive(Debug, Clone, Copy)]
pub struct EcgPoint {
    pub x: f64,
    pub y: f64,
}

pub struct EcgWindowSampler<Probe, Read>
where
    Probe: Fn() -> bool,
    Read: Fn() -> Option<f64>,
{
    probe_signal_support: Probe,
    read_signal: Read,
    supported: bool,
    available: bool,
    label: String,
    note: String,
    current_percent: f64,
    history: Vec<f64>,
    max_history: usize,
}

impl<Probe, Read> EcgWindowSampler<Probe, Read>
where
    Probe: Fn() -> bool,
    Read: Fn() -> Option<f64>,
{
    pub fn new(
        read_signal: Read,
        probe_signal_support: Probe,
        label: impl Into<String>,
        max_history: usize,
    ) -> Self {
        Self {
            probe_signal_support,
            read_signal,
            supported: false,
            available: false,
            label: label.into(),
            note: "Telemetry is not available in this environment.".to_string(),
            current_percent: 0.0,
            history: Vec::new(),
            max_history,
        }
    }

    pub fn initialize(&mut self) {
        self.supported = (self.probe_signal_support)();
        self.available = false;
        self.note = if self.supported {
            "Waiting for first telemetry sample.".to_string()
        } else {
            "Telemetry is not available in this environment.".to_string()
        };
    }

    pub fn sample_once(&mut self) {
        if !self.supported {
            return;
        }

        let Some(sample) = self.read_normalized_activity_percent() else {
            self.available = false;
            self.note = "Telemetry temporarily unavailable.".to_string();
            return;
        };

        self.available = true;
        self.note = "ECG-style view of current workload activity.".to_string();
        self.current_percent = sample;
        self.append_sample(sample);
    }

    pub fn payload(&self) -> EcgWindowPayload {
        EcgWindowPayload {
            supported: self.supported,
            available: self.available,
            label: self.label.clone(),
            note: self.note.clone(),
            current_percent: self.current_percent,
            history: self.history.clone(),
        }
    }

    pub fn points(&self, width: f64, height: f64) -> Vec<EcgPoint> {
        Self::build_points(&self.history, width, height)
    }

    pub fn render_paths(&self, width: f64, height: f64) -> (String, String) {
        let points = self.points(width, height);
        (
            Self::build_line_path(&points),
            Self::build_area_path(&points, height),
        )
    }

    pub fn build_points(history: &[f64], width: f64, height: f64) -> Vec<EcgPoint> {
        if history.is_empty() {
            return Vec::new();
        }

        if history.len() == 1 {
            let value = Self::clamp(history[0], 0.0, 100.0);
            return vec![EcgPoint {
                x: width / 2.0,
                y: height - (value / 100.0) * height,
            }];
        }

        let step_x = width / (history.len() as f64 - 1.0);

        history
            .iter()
            .enumerate()
            .map(|(index, value)| {
                let normalized = Self::clamp(*value, 0.0, 100.0);
                EcgPoint {
                    x: index as f64 * step_x,
                    y: height - (normalized / 100.0) * height,
                }
            })
            .collect()
    }

    pub fn build_line_path(points: &[EcgPoint]) -> String {
        if points.is_empty() {
            return String::new();
        }

        let mut path = format!("M {} {}", points[0].x, points[0].y);
        for point in &points[1..] {
            path.push_str(&format!(" L {} {}", point.x, point.y));
        }

        path
    }

    pub fn build_area_path(points: &[EcgPoint], height: f64) -> String {
        if points.is_empty() {
            return String::new();
        }

        let mut path = Self::build_line_path(points);
        let first_point = points.first().unwrap();
        let last_point = points.last().unwrap();
        path.push_str(&format!(" L {} {}", last_point.x, height));
        path.push_str(&format!(" L {} {}", first_point.x, height));
        path.push_str(" Z");
        path
    }

    fn read_normalized_activity_percent(&self) -> Option<f64> {
        let raw_signal = (self.read_signal)()?;
        if raw_signal.is_nan() || !raw_signal.is_finite() {
            return None;
        }

        Some(Self::clamp(raw_signal, 0.0, 100.0))
    }

    fn append_sample(&mut self, value: f64) {
        self.history.push(value);

        if self.history.len() > self.max_history {
            let overflow = self.history.len() - self.max_history;
            self.history.drain(0..overflow);
        }
    }

    fn clamp(value: f64, min_value: f64, max_value: f64) -> f64 {
        if value < min_value {
            return min_value;
        }

        if value > max_value {
            return max_value;
        }

        value
    }
}

/*
Example usage:

let mut sampler = EcgWindowSampler::new(
    || Some(73.0),
    || true,
    "ECG Window - Local GPU",
    50,
);

sampler.initialize();
sampler.sample_once();

let payload = sampler.payload();
let points = sampler.points(320.0, 72.0);
let paths = sampler.render_paths(320.0, 72.0);
*/
