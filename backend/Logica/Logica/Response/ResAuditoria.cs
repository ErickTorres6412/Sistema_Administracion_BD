using System;
using System.Collections.Generic;

namespace Logica.Response
{
    public class ResAuditoria
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; }

        // Estado general de la auditoría
        public class EstadoAuditoria
        {
            public string ValorAuditTrail { get; set; }
            public bool AuditoriaHabilitada { get; set; }
            public bool RequiereReinicio { get; set; }
            public List<string> ObjetosAuditados { get; set; }
            public int RegistrosUltimas24Horas { get; set; }
        }

        // Registro detallado de auditoría
        public class RegistroAuditoria
        {
            public DateTime FechaHora { get; set; }
            public string Usuario { get; set; }
            public string TipoAccion { get; set; }
            public string ObjetoAccedido { get; set; }
            public string Detalles { get; set; }
            public bool Exitoso { get; set; }
            public string DireccionIP { get; set; }
            public string Terminal { get; set; }
        }

        // Resumen general de auditoría
        public class ResumenAuditoria
        {
            public int TotalRegistros { get; set; }
            public int IntentosExitosos { get; set; }
            public int IntentosFallidos { get; set; }
            public DateTime UltimaActividad { get; set; }
        }

        // Configuración específica para conexiones
        public class ConfiguracionConexiones
        {
            public bool AuditandoExitosas { get; set; }
            public bool AuditandoFallidas { get; set; }
            public bool AuditoriaHabilitada { get; set; }
            public bool RequiereReinicio { get; set; }
            public List<string> ObjetosAuditados { get; set; }
            public EstadisticasConexiones Estadisticas { get; set; }

            public ConfiguracionConexiones()
            {
                ObjetosAuditados = new List<string>();
                Estadisticas = new EstadisticasConexiones();
            }
        }

        public class EstadisticasConexiones
        {
            public int TotalConexiones { get; set; }
            public int ConexionesExitosas { get; set; }
            public int ConexionesFallidas { get; set; }
            public DateTime UltimaConexionExitosa { get; set; }
            public DateTime UltimaConexionFallida { get; set; }
        }

        public EstadoAuditoria Estado { get; set; }
        public List<RegistroAuditoria> Registros { get; set; }
        public ResumenAuditoria Resumen { get; set; }
        public ConfiguracionConexiones Conexiones { get; set; }

        public ResAuditoria()
        {
            Estado = new EstadoAuditoria();
            Registros = new List<RegistroAuditoria>();
            Resumen = new ResumenAuditoria();
            Conexiones = new ConfiguracionConexiones();
        }
    }
}