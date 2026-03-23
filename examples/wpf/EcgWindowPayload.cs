using System.Collections.Generic;

namespace EcgWindow.Examples.Wpf
{
    public sealed class EcgWindowPayload
    {
        public bool Supported { get; set; }
        public bool Available { get; set; }
        public string Label { get; set; } = "ECG Window";
        public string Note { get; set; } = string.Empty;
        public double CurrentPercent { get; set; }
        public IReadOnlyList<double> History { get; set; } = new double[0];
    }
}
