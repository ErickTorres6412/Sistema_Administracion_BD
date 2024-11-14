using System;
using System.Collections.Generic;

namespace Logica.Response
{
    public class ResConsultaSesiones : ResBase
    {
        public List<RegistroSesion> Registros { get; set; } = new List<RegistroSesion>();
        public EstadisticasSesiones Estadisticas { get; set; } = new EstadisticasSesiones();

        public class RegistroSesion
        {
            public DateTime FechaEvento { get; set; }
            public string TipoEvento { get; set; }
            public bool Exitoso { get; set; }
            public string DireccionIP { get; set; }
            public string Terminal { get; set; }
            public string CodigoError { get; set; }
        }

        public class EstadisticasSesiones
        {
            public int TotalConexiones { get; set; }
            public int ConexionesExitosas { get; set; }
            public int ConexionesFallidas { get; set; }
        }
    }
}