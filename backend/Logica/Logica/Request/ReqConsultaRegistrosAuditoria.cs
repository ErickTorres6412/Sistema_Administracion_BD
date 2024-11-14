using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqConsultaRegistrosAuditoria
    {
        public string TipoAuditoria { get; set; }  // "SESIONES", "TABLAS", "ACCIONES"
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public bool? Exitoso { get; set; }
        public int? LimiteRegistros { get; set; }
    }
}

