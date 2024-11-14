using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public class ReqQueryPlan
    {
        public string ConsultaSQL { get; set; }
        public string NombreTabla { get; set; }  // Opcional, por si queremos filtrar por tabla
    }
}
