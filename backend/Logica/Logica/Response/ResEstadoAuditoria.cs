using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResEstadoAuditoria : ResBase
    {
        public string ValorAuditTrail { get; set; }
        public bool AuditoriaHabilitada { get; set; }
        public bool RequiereReinicio { get; set; }
        public List<string> ObjetosAuditados { get; set; }
        public int RegistrosUltimas24Horas { get; set; }

        public ResEstadoAuditoria()
        {
            ObjetosAuditados = new List<string>();
        }
    }
}