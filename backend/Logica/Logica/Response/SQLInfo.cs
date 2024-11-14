using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class SQLInfo
    {
        public string sqlId { get; set; }
        public string sqlText { get; set; }
        public int executions { get; set; }
        public double cpuTime { get; set; }
        public double elapsedTime { get; set; }
        public double bufferGets { get; set; }
        public double diskReads { get; set; }
        public DateTime lastExecutionTime { get; set; }
    }
}
