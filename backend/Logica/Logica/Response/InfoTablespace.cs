using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class InfoTablespace
    {
        public string nombreTablespace { get; set; }
        public string estado { get; set; }
        public string ubicacionArchivo { get; set; }
        public decimal tamanioActual { get; set; }
        public decimal espacioLibre { get; set; }
        public bool autoextend { get; set; }
        public decimal tamanioMaximo { get; set; }
    }
}
