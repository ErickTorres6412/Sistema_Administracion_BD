using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public abstract class ReqConsultaAuditoriaBase
    {
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public bool? Exitoso { get; set; }
        public int? LimiteRegistros { get; set; }
    }
}