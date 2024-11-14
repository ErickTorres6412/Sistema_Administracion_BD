using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResAuditoriaTablas : ResBase
    {
        public List<TablaAuditada> TablasConfiguradas { get; set; }

        public class TablaAuditada
        {
            public string NombreTabla { get; set; }
            public List<string> OperacionesAuditadas { get; set; }
        }

        public ResAuditoriaTablas()
        {
            TablasConfiguradas = new List<TablaAuditada>();
        }
    }
}