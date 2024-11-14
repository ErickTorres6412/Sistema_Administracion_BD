using System;
using System.Collections.Generic;

namespace Logica.Response
{
    public class ResConsultaAcciones : ResBase
    {
        public List<RegistroAccion> Registros { get; set; } = new List<RegistroAccion>();
        public EstadisticasAcciones Estadisticas { get; set; } = new EstadisticasAcciones();

        public class RegistroAccion
        {
            public DateTime FechaEvento { get; set; }
            public string Accion { get; set; }
            public string DetallesAccion { get; set; }
            public string ObjetoAfectado { get; set; }
            public bool Exitoso { get; set; }
        }

        public class EstadisticasAcciones
        {
            public int TotalAcciones { get; set; }
            public Dictionary<string, int> PorTipoAccion { get; set; } = new Dictionary<string, int>();
        }
    }
}