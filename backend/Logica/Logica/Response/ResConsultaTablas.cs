using System;
using System.Collections.Generic;

namespace Logica.Response
{
    public class ResConsultaTablas : ResBase
    {
        public List<RegistroTabla> Registros { get; set; } = new List<RegistroTabla>();
        public EstadisticasTablas Estadisticas { get; set; } = new EstadisticasTablas();

        public class RegistroTabla
        {
            public DateTime FechaEvento { get; set; }
            public string Tabla { get; set; }
            public string Esquema { get; set; }
            public string Operacion { get; set; }
            public string SentenciaSQL { get; set; }
            public bool Exitoso { get; set; }
        }

        public class EstadisticasTablas
        {
            public int TotalOperaciones { get; set; }
            public Dictionary<string, int> PorOperacion { get; set; } = new Dictionary<string, int>();
        }
    }
}