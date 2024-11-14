using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResConsultaRegistrosAuditoria : ResBase
    {
        public List<RegistroAuditoria> Registros { get; set; } = new List<RegistroAuditoria>();
        public Estadisticas EstadisticasAuditoria { get; set; } = new Estadisticas();

        public class RegistroAuditoria
        {
            public DateTime FechaEvento { get; set; }
            // Campos para sesiones
            public string TipoEvento { get; set; }
            public bool Exitoso { get; set; }
            public string DireccionIP { get; set; }
            public string Terminal { get; set; }
            public string CodigoError { get; set; }
            // Campos para tablas
            public string Tabla { get; set; }
            public string Esquema { get; set; }
            public string Operacion { get; set; }
            public string SentenciaSQL { get; set; }
            // Campos para acciones
            public string Accion { get; set; }
            public string DetallesAccion { get; set; }
            public string ObjetoAfectado { get; set; }
        }

        public class Estadisticas
        {
            // Para sesiones
            public int TotalConexiones { get; set; }
            public int ConexionesExitosas { get; set; }
            public int ConexionesFallidas { get; set; }
            // Para tablas
            public int TotalOperaciones { get; set; }
            public Dictionary<string, int> PorOperacion { get; set; } = new Dictionary<string, int>();
            // Para acciones
            public int TotalAcciones { get; set; }
            public Dictionary<string, int> PorTipoAccion { get; set; } = new Dictionary<string, int>();
        }
    }
}