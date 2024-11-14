using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResAnalisisConsulta
    {
        public List<string> Errores { get; set; }
        public bool Resultado { get; set; }
        public string PlanEjecucion { get; set; }
        public Dictionary<string, double> Estadisticas { get; set; }
        public List<string> RecomendacionesOptimizacion { get; set; }
    }
}
