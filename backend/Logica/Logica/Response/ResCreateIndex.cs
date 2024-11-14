using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResCreateIndex
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; }
        public DetallesIndice Detalles { get; set; }

        public class DetallesIndice
        {
            public string NombreIndice { get; set; }
            public string NombreTabla { get; set; }
            public List<string> Columnas { get; set; }
            public string TipoIndice { get; set; }
            public string Estado { get; set; }
            public DateTime FechaCreacion { get; set; }
            public bool EsUnico { get; set; }
        }
    }
}