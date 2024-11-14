using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class EspacioTablespace
    {
        public string nombre { get; set; }
        public double espacioTotal { get; set; }
        public double espacioUsado { get; set; }
        public double porcentajeUsado { get; set; }
        public bool autoextend { get; set; }
    }
}
