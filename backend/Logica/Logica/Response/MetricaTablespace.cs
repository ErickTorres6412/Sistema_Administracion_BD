using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class MetricaTablespace
    {
        public string tablespace { get; set; }
        public double readTime { get; set; }
        public double writeTime { get; set; }
        public long physicalReads { get; set; }
        public long physicalWrites { get; set; }
        public double readThroughput { get; set; }
        public double writeThroughput { get; set; }
    }
}
