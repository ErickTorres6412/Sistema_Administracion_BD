using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResAuditoriaConexiones : ResBase
    {
        public bool AuditoriaHabilitada { get; set; }
        public bool AuditandoExitosas { get; set; }
        public bool AuditandoFallidas { get; set; }
        public List<string> ObjetosAuditados { get; set; }
        public EstadisticasConexiones Estadisticas { get; set; }

        public class EstadisticasConexiones
        {
            public int TotalConexiones { get; set; }
            public int ConexionesExitosas { get; set; }
            public int ConexionesFallidas { get; set; }
            public DateTime? UltimaConexionExitosa { get; set; }
            public DateTime? UltimaConexionFallida { get; set; }
        }

        public ResAuditoriaConexiones()
        {
            ObjetosAuditados = new List<string>();
            Estadisticas = new EstadisticasConexiones();
        }
    }
}