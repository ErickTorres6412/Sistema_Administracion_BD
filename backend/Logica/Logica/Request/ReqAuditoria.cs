using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public class ReqAuditoria
    {
        // Configuración general de auditoría
        public bool HabilitarAuditoria { get; set; }

        // Auditoría de conexiones
        public class ConfiguracionConexiones
        {
            public bool RegistrarExitosos { get; set; }
            public bool RegistrarFallidos { get; set; }
        }

        // Auditoría de acciones
        public class ConfiguracionAcciones
        {
            public bool AuditarDDL { get; set; }
            public bool AuditarDML { get; set; }
            public bool AuditarSelect { get; set; }
        }

        // Auditoría de tablas específicas
        public class ConfiguracionTabla
        {
            public string NombreTabla { get; set; }
            public bool AuditarSelect { get; set; }
            public bool AuditarInsert { get; set; }
            public bool AuditarUpdate { get; set; }
            public bool AuditarDelete { get; set; }
        }

        // Filtros para consultas de auditoría
        public class FiltrosConsulta
        {
            public DateTime? FechaInicio { get; set; }
            public DateTime? FechaFin { get; set; }
            public string Usuario { get; set; }
            public string ObjetoAccedido { get; set; }
            public string TipoAccion { get; set; }
            public bool? Exitoso { get; set; }
        }

        // Propiedades principales de configuración en ReqAuditoria
        public ConfiguracionConexiones ConfigConexiones { get; set; }
        public ConfiguracionAcciones ConfigAcciones { get; set; }
        public List<ConfiguracionTabla> ConfiguracionTablas { get; set; }
        public FiltrosConsulta Filtros { get; set; }
    }
}
