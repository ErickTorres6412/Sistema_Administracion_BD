using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class SesionActiva
    {
        public string sid { get; set; }
        public string usuario { get; set; }
        public string programa { get; set; }
        public string estado { get; set; }
        public DateTime tiempoInicio { get; set; }
        public string sql { get; set; }
    }
}
