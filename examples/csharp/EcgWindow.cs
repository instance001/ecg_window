using System;
using System.Collections.Generic;
using System.Globalization;

namespace EcgWindow
{

public sealed class EcgWindowPayload
{
    public bool Supported { get; set; }
    public bool Available { get; set; }
    public string Label { get; set; } = "ECG Window";
    public string Note { get; set; } = string.Empty;
    public double CurrentPercent { get; set; }
    public IReadOnlyList<double> History { get; set; } = Array.Empty<double>();
}

public readonly struct EcgPoint
{
    public EcgPoint(double x, double y)
    {
        X = x;
        Y = y;
    }

    public double X { get; }
    public double Y { get; }
}

public sealed class EcgWindowSampler
{
    private readonly Func<bool> _probeSignalSupport;
    private readonly Func<double?> _readSignal;
    private readonly List<double> _history = new List<double>();

    public EcgWindowSampler(
        Func<double?> readSignal,
        Func<bool> probeSignalSupport = null,
        string label = "ECG Window",
        int maxHistory = 50)
    {
        _readSignal = readSignal;
        _probeSignalSupport = probeSignalSupport ?? (() => true);
        Label = label;
        MaxHistory = maxHistory;
        Note = "Telemetry is not available in this environment.";
    }

    public string Label { get; }
    public string Note { get; private set; }
    public bool Supported { get; private set; }
    public bool Available { get; private set; }
    public double CurrentPercent { get; private set; }
    public int MaxHistory { get; }

    public void Initialize()
    {
        Supported = _probeSignalSupport();
        Available = false;
        Note = Supported
            ? "Waiting for first telemetry sample."
            : "Telemetry is not available in this environment.";
    }

    public void SampleOnce()
    {
        if (!Supported)
        {
            return;
        }

        var sample = ReadNormalizedActivityPercent();
        if (sample is null)
        {
            Available = false;
            Note = "Telemetry temporarily unavailable.";
            return;
        }

        Available = true;
        Note = "ECG-style view of current workload activity.";
        CurrentPercent = sample.Value;
        AppendSample(sample.Value);
    }

    public EcgWindowPayload GetPayload()
    {
        return new EcgWindowPayload
        {
            Supported = Supported,
            Available = Available,
            Label = Label,
            Note = Note,
            CurrentPercent = CurrentPercent,
            History = _history.ToArray(),
        };
    }

    public (string LinePath, string AreaPath) GetPaths(double width, double height)
    {
        var points = BuildPoints(_history, width, height);
        return (BuildLinePath(points), BuildAreaPath(points, height));
    }

    public static IReadOnlyList<EcgPoint> BuildPoints(IReadOnlyList<double> history, double width, double height)
    {
        if (history.Count == 0)
        {
            return Array.Empty<EcgPoint>();
        }

        if (history.Count == 1)
        {
            var only = Clamp(history[0], 0.0, 100.0);
            return new[] { new EcgPoint(width / 2.0, height - (only / 100.0) * height) };
        }

        var points = new List<EcgPoint>(history.Count);
        var stepX = width / (history.Count - 1);

        for (var index = 0; index < history.Count; index++)
        {
            var value = Clamp(history[index], 0.0, 100.0);
            var x = index * stepX;
            var y = height - (value / 100.0) * height;
            points.Add(new EcgPoint(x, y));
        }

        return points;
    }

    public static string BuildLinePath(IReadOnlyList<EcgPoint> points)
    {
        if (points.Count == 0)
        {
            return string.Empty;
        }

        var path = string.Format(
            CultureInfo.InvariantCulture,
            "M {0} {1}",
            points[0].X,
            points[0].Y);

        for (var index = 1; index < points.Count; index++)
        {
            path += string.Format(
                CultureInfo.InvariantCulture,
                " L {0} {1}",
                points[index].X,
                points[index].Y);
        }

        return path;
    }

    public static string BuildAreaPath(IReadOnlyList<EcgPoint> points, double height)
    {
        if (points.Count == 0)
        {
            return string.Empty;
        }

        var path = BuildLinePath(points);
        var lastPoint = points[points.Count - 1];
        var firstPoint = points[0];
        path += string.Format(CultureInfo.InvariantCulture, " L {0} {1}", lastPoint.X, height);
        path += string.Format(CultureInfo.InvariantCulture, " L {0} {1}", firstPoint.X, height);
        path += " Z";
        return path;
    }

    private double? ReadNormalizedActivityPercent()
    {
        var rawSignal = _readSignal();
        if (rawSignal is null || double.IsNaN(rawSignal.Value) || double.IsInfinity(rawSignal.Value))
        {
            return null;
        }

        return Clamp(rawSignal.Value, 0.0, 100.0);
    }

    private void AppendSample(double value)
    {
        _history.Add(value);

        while (_history.Count > MaxHistory)
        {
            _history.RemoveAt(0);
        }
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
}

/*
Example usage:

var sampler = new EcgWindowSampler(
    readSignal: () => 73.0,
    probeSignalSupport: () => true,
    label: "ECG Window - Local GPU");

sampler.Initialize();
sampler.SampleOnce();

var payload = sampler.GetPayload();
var paths = sampler.GetPaths(320.0, 72.0);
*/
}
