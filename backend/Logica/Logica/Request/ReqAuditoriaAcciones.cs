using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public class ReqAuditoriaAcciones
    {
        public List<ConfiguracionAccion> Configuraciones { get; set; }

        public class ConfiguracionAccion
        {
            public string Accion { get; set; }
            public bool Auditar { get; set; }
        }
    }
}
