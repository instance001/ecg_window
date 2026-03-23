using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace EcgWindow.Examples.Wpf
{
    public partial class EcgWindowControl : UserControl, INotifyPropertyChanged
    {
        private const double ChartWidth = 320.0;
        private const double ChartHeight = 72.0;

        public static readonly DependencyProperty PayloadProperty =
            DependencyProperty.Register(
                nameof(Payload),
                typeof(EcgWindowPayload),
                typeof(EcgWindowControl),
                new PropertyMetadata(null, OnPayloadChanged));

        private Geometry _lineGeometry = Geometry.Empty;
        private Geometry _areaGeometry = Geometry.Empty;
        private string _labelText = "ECG Window";
        private string _percentText = string.Empty;
        private string _noteText = "Telemetry is not available in this environment.";
        private Brush _noteBrush = Brushes.LightGray;
        private double _chartOpacity = 1.0;
        private Visibility _chartVisibility = Visibility.Visible;
        private Visibility _unsupportedVisibility = Visibility.Collapsed;

        public EcgWindowControl()
        {
            InitializeComponent();
            DataContext = this;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public EcgWindowPayload Payload
        {
            get { return (EcgWindowPayload)GetValue(PayloadProperty); }
            set { SetValue(PayloadProperty, value); }
        }

        public Geometry LineGeometry
        {
            get { return _lineGeometry; }
            private set { _lineGeometry = value; OnPropertyChanged(nameof(LineGeometry)); }
        }

        public Geometry AreaGeometry
        {
            get { return _areaGeometry; }
            private set { _areaGeometry = value; OnPropertyChanged(nameof(AreaGeometry)); }
        }

        public string LabelText
        {
            get { return _labelText; }
            private set { _labelText = value; OnPropertyChanged(nameof(LabelText)); }
        }

        public string PercentText
        {
            get { return _percentText; }
            private set { _percentText = value; OnPropertyChanged(nameof(PercentText)); }
        }

        public string NoteText
        {
            get { return _noteText; }
            private set { _noteText = value; OnPropertyChanged(nameof(NoteText)); }
        }

        public Brush NoteBrush
        {
            get { return _noteBrush; }
            private set { _noteBrush = value; OnPropertyChanged(nameof(NoteBrush)); }
        }

        public double ChartOpacity
        {
            get { return _chartOpacity; }
            private set { _chartOpacity = value; OnPropertyChanged(nameof(ChartOpacity)); }
        }

        public Visibility ChartVisibility
        {
            get { return _chartVisibility; }
            private set { _chartVisibility = value; OnPropertyChanged(nameof(ChartVisibility)); }
        }

        public Visibility UnsupportedVisibility
        {
            get { return _unsupportedVisibility; }
            private set { _unsupportedVisibility = value; OnPropertyChanged(nameof(UnsupportedVisibility)); }
        }

        private static void OnPayloadChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var control = (EcgWindowControl)d;
            control.ApplyPayload(e.NewValue as EcgWindowPayload);
        }

        private void ApplyPayload(EcgWindowPayload payload)
        {
            payload = payload ?? new EcgWindowPayload
            {
                Supported = false,
                Available = false,
                Label = "ECG Window",
                Note = "Telemetry is not available in this environment.",
                CurrentPercent = 0,
                History = new double[0],
            };

            LabelText = payload.Label;
            NoteText = payload.Note;

            if (!payload.Supported)
            {
                PercentText = string.Empty;
                NoteBrush = Brushes.LightGray;
                ChartOpacity = 0.0;
                ChartVisibility = Visibility.Collapsed;
                UnsupportedVisibility = Visibility.Visible;
                LineGeometry = Geometry.Empty;
                AreaGeometry = Geometry.Empty;
                return;
            }

            UnsupportedVisibility = Visibility.Collapsed;
            ChartVisibility = Visibility.Visible;
            ChartOpacity = payload.Available ? 1.0 : 0.35;
            NoteBrush = (Brush)new BrushConverter().ConvertFromString(payload.Available ? "#6EE7B7" : "#FBBF24");
            PercentText = Math.Round(payload.CurrentPercent) + "%";

            var points = BuildPoints(payload.History, ChartWidth, ChartHeight);
            LineGeometry = ParseGeometry(BuildLinePath(points));
            AreaGeometry = ParseGeometry(BuildAreaPath(points, ChartHeight));
        }

        private static Geometry ParseGeometry(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return Geometry.Empty;
            }

            return Geometry.Parse(path);
        }

        private static IReadOnlyList<Point> BuildPoints(IReadOnlyList<double> history, double width, double height)
        {
            var points = new List<Point>();

            if (history == null || history.Count == 0)
            {
                return points;
            }

            if (history.Count == 1)
            {
                var only = Clamp(history[0], 0.0, 100.0);
                points.Add(new Point(width / 2.0, height - (only / 100.0) * height));
                return points;
            }

            var stepX = width / (history.Count - 1);

            for (var index = 0; index < history.Count; index++)
            {
                var value = Clamp(history[index], 0.0, 100.0);
                var x = index * stepX;
                var y = height - (value / 100.0) * height;
                points.Add(new Point(x, y));
            }

            return points;
        }

        private static string BuildLinePath(IReadOnlyList<Point> points)
        {
            if (points.Count == 0)
            {
                return string.Empty;
            }

            var path = $"M {points[0].X} {points[0].Y}";

            for (var index = 1; index < points.Count; index++)
            {
                path += $" L {points[index].X} {points[index].Y}";
            }

            return path;
        }

        private static string BuildAreaPath(IReadOnlyList<Point> points, double height)
        {
            if (points.Count == 0)
            {
                return string.Empty;
            }

            var first = points[0];
            var last = points[points.Count - 1];
            var path = BuildLinePath(points);
            path += $" L {last.X} {height}";
            path += $" L {first.X} {height}";
            path += " Z";
            return path;
        }

        private static double Clamp(double value, double minValue, double maxValue)
        {
            if (value < minValue)
            {
                return minValue;
            }

            if (value > maxValue)
            {
                return maxValue;
            }

            return value;
        }

        private void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
