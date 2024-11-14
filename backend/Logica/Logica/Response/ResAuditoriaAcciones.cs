using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResAuditoriaAcciones : ResBase
    {
        public List<AccionAuditada> AccionesConfiguradas { get; set; }

        public class AccionAuditada
        {
            public string Accion { get; set; }
            public bool Auditada { get; set; }
        }
    }
}
