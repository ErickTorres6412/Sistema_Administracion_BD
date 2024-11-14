using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class EstadisticasGenerales
    {
        public double dbCPUUsage { get; set; }
        public double dbMemoryUsage { get; set; }
        public int activeConnections { get; set; }
        public double bufferCacheHitRatio { get; set; }
        public List<EspacioTablespace> tablespaces { get; set; }
        public List<SesionActiva> sesionesActivas { get; set; }
    }
}
