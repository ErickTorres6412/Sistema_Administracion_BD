using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class EventoEspera
    {
        public string nombre { get; set; }
        public long totalEsperas { get; set; }
        public long totalTimeouts { get; set; }
        public double tiempoEspera { get; set; }
        public double promedioEspera { get; set; }
    }
}
