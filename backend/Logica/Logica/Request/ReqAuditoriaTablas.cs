using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public class ReqAuditoriaTablas
    {
        public string NombreTabla { get; set; }
        public List<ConfiguracionAuditoria> Configuraciones { get; set; }
        public class ConfiguracionAuditoria
        {
            public string Accion { get; set; }
            public bool Auditar { get; set; }
        }
    }
}
