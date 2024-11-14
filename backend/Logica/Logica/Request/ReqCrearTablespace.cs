using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqCrearTablespace
    {
        public string nombreTablespace { get; set; }
        public string ubicacionArchivo { get; set; }
        public int tamanioInicial { get; set; } // En MB
        public int tamanioMaximo { get; set; } // En MB
        public bool autoextend { get; set; } = false;
        public int? incrementoSize { get; set; }
    }
}
