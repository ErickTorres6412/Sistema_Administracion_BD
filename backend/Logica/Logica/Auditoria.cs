using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;
using Logica.Request;
using Logica.Response;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Text;

namespace Logica
{
    public class Auditoria
    {
        private readonly string _connectionString;

        public Auditoria(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDb");
        }

        public ResEstadoAuditoria ObtenerEstadoAuditoria()
        {
            var res = new ResEstadoAuditoria();
            res.Exitoso = false;

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    string sqlAuditEnabled = @"
                    SELECT COUNT(*) 
                    FROM V$OPTION 
                    WHERE PARAMETER = 'Unified Auditing' 
                    AND VALUE = 'TRUE'";

                    using (OracleCommand cmd = new OracleCommand(sqlAuditEnabled, conexion))
                    {
                        int unifiedAuditEnabled = Convert.ToInt32(cmd.ExecuteScalar());

                        string sqlObjetosAuditados = @"
                        SELECT OWNER, OBJECT_NAME, OBJECT_TYPE,
                               ALT, AUD, COM, DEL, GRA, IND,
                               INS, LOC, REN, SEL, UPD, EXE
                        FROM DBA_OBJ_AUDIT_OPTS
                        WHERE OWNER = 'SYS'";

                        List<string> objetosAuditados = new List<string>();
                        using (OracleCommand cmdObjetos = new OracleCommand(sqlObjetosAuditados, conexion))
                        using (OracleDataReader reader = cmdObjetos.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string objName = reader["OBJECT_NAME"].ToString();
                                List<string> opciones = new List<string>();

                                if (reader["SEL"].ToString() == "A/A") opciones.Add("SELECT");
                                if (reader["INS"].ToString() == "A/A") opciones.Add("INSERT");
                                if (reader["UPD"].ToString() == "A/A") opciones.Add("UPDATE");
                                if (reader["DEL"].ToString() == "A/A") opciones.Add("DELETE");
                                if (reader["EXE"].ToString() == "A/A") opciones.Add("EXECUTE");
                                if (reader["ALT"].ToString() == "A/A") opciones.Add("ALTER");
                                if (reader["GRA"].ToString() == "A/A") opciones.Add("GRANT");
                                if (reader["REN"].ToString() == "A/A") opciones.Add("RENAME");

                                if (opciones.Count > 0)
                                {
                                    objetosAuditados.Add($"{reader["OWNER"]}.{objName} - {string.Join(", ", opciones)}");
                                }
                            }
                        }

                        string sqlRegistrosRecientes = @"
                        SELECT COUNT(*) 
                        FROM UNIFIED_AUDIT_TRAIL 
                        WHERE event_timestamp >= SYSTIMESTAMP - INTERVAL '24' HOUR";

                        int registrosRecientes = 0;
                        using (OracleCommand cmdRegistros = new OracleCommand(sqlRegistrosRecientes, conexion))
                        {
                            registrosRecientes = Convert.ToInt32(cmdRegistros.ExecuteScalar());
                        }

                        res.ValorAuditTrail = "DB";
                        res.AuditoriaHabilitada = unifiedAuditEnabled > 0 || objetosAuditados.Count > 0;
                        res.RequiereReinicio = false;
                        res.ObjetosAuditados = objetosAuditados;
                        res.RegistrosUltimas24Horas = registrosRecientes;

                        res.Exitoso = true;
                        res.Mensaje = $"Auditoría actualmente {(res.AuditoriaHabilitada ? "habilitada" : "deshabilitada")}";
                    }
                }
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error al obtener estado de auditoría: {ex.Message}";
            }

            return res;
        }

        public ResAuditoriaConexiones ConfigurarAuditoriaConexiones(ReqAuditoria req)
        {
            var res = new ResAuditoriaConexiones
            {
                Exitoso = false
            };

            try
            {
                if (req?.ConfigConexiones == null)
                {
                    res.Mensaje = "La configuración de conexiones es requerida";
                    return res;
                }

                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    if (req.ConfigConexiones.RegistrarExitosos || req.ConfigConexiones.RegistrarFallidos)
                    {
                        using (OracleCommand cmd = new OracleCommand("NOAUDIT SESSION", conexion))
                        {
                            cmd.ExecuteNonQuery();
                        }

                        string auditCommand = "AUDIT SESSION";
                        if (req.ConfigConexiones.RegistrarExitosos && !req.ConfigConexiones.RegistrarFallidos)
                        {
                            auditCommand += " WHENEVER SUCCESSFUL";
                        }
                        else if (!req.ConfigConexiones.RegistrarExitosos && req.ConfigConexiones.RegistrarFallidos)
                        {
                            auditCommand += " WHENEVER NOT SUCCESSFUL";
                        }

                        using (OracleCommand cmd = new OracleCommand(auditCommand, conexion))
                        {
                            cmd.ExecuteNonQuery();
                        }

                        res.AuditoriaHabilitada = true;
                        res.AuditandoExitosas = req.ConfigConexiones.RegistrarExitosos;
                        res.AuditandoFallidas = req.ConfigConexiones.RegistrarFallidos;
                        res.ObjetosAuditados.Add("SESSION");
                    }
                    else
                    {
                        using (OracleCommand cmd = new OracleCommand("NOAUDIT SESSION", conexion))
                        {
                            cmd.ExecuteNonQuery();
                        }
                    }

                    using (OracleCommand cmd = new OracleCommand(@"
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN returncode = 0 THEN 1 END) as exitosos,
                    COUNT(CASE WHEN returncode != 0 THEN 1 END) as fallidos,
                    MAX(CASE WHEN returncode = 0 THEN timestamp END) as ultima_exitosa,
                    MAX(CASE WHEN returncode != 0 THEN timestamp END) as ultima_fallida
                FROM DBA_AUDIT_TRAIL 
                WHERE action_name = 'LOGON'
                AND timestamp > SYSTIMESTAMP - INTERVAL '1' DAY", conexion))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                res.Estadisticas.TotalConexiones = reader.IsDBNull(reader.GetOrdinal("total")) ? 0 : Convert.ToInt32(reader["total"]);
                                res.Estadisticas.ConexionesExitosas = reader.IsDBNull(reader.GetOrdinal("exitosos")) ? 0 : Convert.ToInt32(reader["exitosos"]);
                                res.Estadisticas.ConexionesFallidas = reader.IsDBNull(reader.GetOrdinal("fallidos")) ? 0 : Convert.ToInt32(reader["fallidos"]);

                                if (!reader.IsDBNull(reader.GetOrdinal("ultima_exitosa")))
                                {
                                    res.Estadisticas.UltimaConexionExitosa = reader.GetDateTime(reader.GetOrdinal("ultima_exitosa"));
                                }

                                if (!reader.IsDBNull(reader.GetOrdinal("ultima_fallida")))
                                {
                                    res.Estadisticas.UltimaConexionFallida = reader.GetDateTime(reader.GetOrdinal("ultima_fallida"));
                                }
                            }
                        }
                    }

                    res.Exitoso = true;
                    res.Mensaje = $"Configuración de auditoría de conexiones actualizada exitosamente. " +
                                 $"Últimas 24h: {res.Estadisticas.ConexionesExitosas} conexiones exitosas, " +
                                 $"{res.Estadisticas.ConexionesFallidas} fallidas.";
                }

                return res;
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error general al configurar auditoría de conexiones: {ex.Message}";
                return res;
            }
        }

        public ResAuditoriaTablas ConfigurarAuditoriaTablas(List<ReqAuditoriaTablas> req)
        {
            var res = new ResAuditoriaTablas();

            try
            {
                if (req == null || !req.Any())
                {
                    res.Mensaje = "La configuración de tablas es requerida";
                    res.Exitoso = false;
                    return res;
                }

                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    foreach (var tabla in req)
                    {
                        if (string.IsNullOrEmpty(tabla.NombreTabla) || tabla.Configuraciones == null || !tabla.Configuraciones.Any())
                        {
                            continue;
                        }

                        var tablaAuditada = new ResAuditoriaTablas.TablaAuditada
                        {
                            NombreTabla = tabla.NombreTabla,
                            OperacionesAuditadas = new List<string>()
                        };

                        // Separar operaciones a auditar y no auditar
                        var operacionesAuditar = tabla.Configuraciones
                            .Where(c => c.Auditar)
                            .Select(c => c.Accion.ToUpper())
                            .ToList();

                        var operacionesNoAuditar = tabla.Configuraciones
                            .Where(c => !c.Auditar)
                            .Select(c => c.Accion.ToUpper())
                            .ToList();

                        // Aplicar AUDIT para operaciones activadas
                        if (operacionesAuditar.Any())
                        {
                            string auditCommand = $"AUDIT {string.Join(", ", operacionesAuditar)} ON {tabla.NombreTabla}";
                            using (OracleCommand cmd = new OracleCommand(auditCommand, conexion))
                            {
                                cmd.ExecuteNonQuery();
                            }
                            tablaAuditada.OperacionesAuditadas.AddRange(operacionesAuditar);
                        }

                        // Aplicar NOAUDIT para operaciones desactivadas
                        if (operacionesNoAuditar.Any())
                        {
                            string noAuditCommand = $"NOAUDIT {string.Join(", ", operacionesNoAuditar)} ON {tabla.NombreTabla}";
                            using (OracleCommand cmd = new OracleCommand(noAuditCommand, conexion))
                            {
                                cmd.ExecuteNonQuery();
                            }
                        }

                        res.TablasConfiguradas.Add(tablaAuditada);
                    }

                    res.Exitoso = true;
                    res.Mensaje = $"Se configuró la auditoría para {res.TablasConfiguradas.Count} tabla(s)";
                }
            }
            catch (Exception ex)
            {
                res.Exitoso = false;
                res.Mensaje = $"Error al configurar auditoría de tablas: {ex.Message}";
            }

            return res;
        }


        public ResAuditoriaAcciones ConfigurarAuditoriaAcciones(ReqAuditoriaAcciones req)
        {
            var res = new ResAuditoriaAcciones
            {
                Exitoso = false,
                AccionesConfiguradas = new List<ResAuditoriaAcciones.AccionAuditada>()
            };

            try
            {
                if (req?.Configuraciones == null || req.Configuraciones.Count == 0)
                {
                    res.Mensaje = "La configuración de acciones es requerida";
                    return res;
                }

                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    foreach (var config in req.Configuraciones)
                    {
                        var accionAuditada = new ResAuditoriaAcciones.AccionAuditada
                        {
                            Accion = config.Accion,
                            Auditada = config.Auditar
                        };

                        try
                        {
                            string comando = config.Auditar
                                ? $"AUDIT {config.Accion}"
                                : $"NOAUDIT {config.Accion}";

                            using (OracleCommand cmd = new OracleCommand(comando, conexion))
                            {
                                cmd.ExecuteNonQuery();
                            }

                            res.AccionesConfiguradas.Add(accionAuditada);
                        }
                        catch (Exception ex)
                        {
                            // Si falla una acción específica, la agregamos con el estado actual
                            // pero continuamos con las demás
                            res.Mensaje += $"\nError en {config.Accion}: {ex.Message}";
                        }
                    }

                    res.Exitoso = res.AccionesConfiguradas.Count > 0;
                    if (string.IsNullOrEmpty(res.Mensaje))
                    {
                        res.Mensaje = $"Se configuró la auditoría para {res.AccionesConfiguradas.Count} accion(es)";
                    }
                    else if (res.Exitoso)
                    {
                        res.Mensaje = $"Se configuraron {res.AccionesConfiguradas.Count} accion(es) con algunos errores: {res.Mensaje}";
                    }
                }
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error general al configurar auditoría de acciones: {ex.Message}";
            }

            return res;
        }
        public ResConsultaSesiones ObtenerRegistrosSesiones(ReqConsultaSesiones req)
        {
            var res = new ResConsultaSesiones
            {
                Exitoso = false
            };

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    var queryBuilder = new StringBuilder();
                    var parameters = new List<OracleParameter>();

                    queryBuilder.Append(@"
                    SELECT 
                        timestamp as fecha_evento,
                        action_name as tipo_evento,
                        CASE WHEN returncode = 0 THEN 1 ELSE 0 END as exitoso,
                        userhost as terminal,
                        terminal as direccion_ip,
                        TO_CHAR(returncode) as codigo_error
                    FROM DBA_AUDIT_TRAIL 
                    WHERE action_name in ('LOGON', 'LOGOFF')");

                    if (req.FechaInicio.HasValue)
                    {
                        queryBuilder.Append(" AND timestamp >= :fechaInicio");
                        parameters.Add(new OracleParameter("fechaInicio", req.FechaInicio.Value));
                    }

                    if (req.FechaFin.HasValue)
                    {
                        queryBuilder.Append(" AND timestamp <= :fechaFin");
                        parameters.Add(new OracleParameter("fechaFin", req.FechaFin.Value));
                    }

                    if (req.Exitoso.HasValue)
                    {
                        queryBuilder.Append(" AND returncode = :exitoso");
                        parameters.Add(new OracleParameter("exitoso", req.Exitoso.Value ? 0 : 1));
                    }

                    queryBuilder.Append(" ORDER BY timestamp DESC");

                    if (req.LimiteRegistros.HasValue && req.LimiteRegistros.Value > 0)
                    {
                        queryBuilder.Append(" FETCH FIRST :limite ROWS ONLY");
                        parameters.Add(new OracleParameter("limite", req.LimiteRegistros.Value));
                    }

                    using (OracleCommand cmd = new OracleCommand(queryBuilder.ToString(), conexion))
                    {
                        cmd.Parameters.AddRange(parameters.ToArray());

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var registro = new ResConsultaSesiones.RegistroSesion
                                {
                                    FechaEvento = reader.GetDateTime(reader.GetOrdinal("fecha_evento")),
                                    TipoEvento = reader["tipo_evento"].ToString(),
                                    Exitoso = Convert.ToInt32(reader["exitoso"]) == 1,
                                    Terminal = reader["terminal"].ToString(),
                                    DireccionIP = reader["direccion_ip"].ToString(),
                                    CodigoError = reader["codigo_error"].ToString()
                                };

                                res.Registros.Add(registro);
                                res.Estadisticas.TotalConexiones++;
                                if (registro.Exitoso)
                                    res.Estadisticas.ConexionesExitosas++;
                                else
                                    res.Estadisticas.ConexionesFallidas++;
                            }
                        }
                    }

                    res.Exitoso = true;
                    res.Mensaje = $"Se encontraron {res.Registros.Count} registros de auditoría de sesiones";
                }
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error al consultar registros de sesiones: {ex.Message}";
            }

            return res;
        }

        public ResConsultaTablas ObtenerRegistrosTablas(ReqConsultaTablas req)
        {
            var res = new ResConsultaTablas
            {
                Exitoso = false
            };

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    var queryBuilder = new StringBuilder();
                    var parameters = new List<OracleParameter>();

                    queryBuilder.Append(@"
                    SELECT 
                        event_timestamp as fecha_evento,
                        object_name as tabla,
                        object_schema as esquema,
                        action_name as operacion,
                        sql_text as sentencia_sql,
                        CASE WHEN return_code = 0 THEN 1 ELSE 0 END as exitoso
                    FROM UNIFIED_AUDIT_TRAIL 
                    WHERE action_name in (
                        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 
                        'EXECUTE', 'ALTER', 'GRANT', 'RENAME', 
                        'CREATE', 'READ', 'WRITE'
                    )
                    AND object_name NOT IN ('UNIFIED_AUDIT_TRAIL', 'DBA_AUDIT_TRAIL', 'AUDIT_TRAIL')
                    AND object_schema NOT IN ('AUDSYS', 'SYS')");

                    if (req.FechaInicio.HasValue)
                    {
                        var fechaInicio = req.FechaInicio.Value.AddHours(-1);
                        queryBuilder.Append(@" 
                        AND event_timestamp >= 
                        SYS_EXTRACT_UTC(CAST(:fechaInicio AS TIMESTAMP WITH TIME ZONE))");
                        parameters.Add(new OracleParameter("fechaInicio", fechaInicio));
                    }

                    if (req.FechaFin.HasValue)
                    {
                        var fechaFin = req.FechaFin.Value.AddHours(1);
                        queryBuilder.Append(@"
                        AND event_timestamp <= 
                        SYS_EXTRACT_UTC(CAST(:fechaFin AS TIMESTAMP WITH TIME ZONE))");
                        parameters.Add(new OracleParameter("fechaFin", fechaFin));
                    }

                    if (req.Exitoso.HasValue)
                    {
                        queryBuilder.Append(" AND return_code = :exitoso");
                        parameters.Add(new OracleParameter("exitoso", req.Exitoso.Value ? 0 : 1));
                    }

                    queryBuilder.Append(" ORDER BY event_timestamp DESC");

                    if (req.LimiteRegistros.HasValue && req.LimiteRegistros.Value > 0)
                    {
                        queryBuilder.Append(" FETCH FIRST :limite ROWS ONLY");
                        parameters.Add(new OracleParameter("limite", req.LimiteRegistros.Value));
                    }

                    using (OracleCommand cmd = new OracleCommand(queryBuilder.ToString(), conexion))
                    {
                        cmd.Parameters.AddRange(parameters.ToArray());

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var registro = new ResConsultaTablas.RegistroTabla
                                {
                                    FechaEvento = reader.GetDateTime(reader.GetOrdinal("fecha_evento")),
                                    Tabla = reader["tabla"].ToString(),
                                    Esquema = reader["esquema"].ToString(),
                                    Operacion = reader["operacion"].ToString(),
                                    SentenciaSQL = reader["sentencia_sql"].ToString(),
                                    Exitoso = Convert.ToBoolean(reader["exitoso"])
                                };

                                res.Registros.Add(registro);
                                res.Estadisticas.TotalOperaciones++;

                                if (!res.Estadisticas.PorOperacion.ContainsKey(registro.Operacion))
                                    res.Estadisticas.PorOperacion[registro.Operacion] = 0;
                                res.Estadisticas.PorOperacion[registro.Operacion]++;
                            }
                        }
                    }

                    res.Exitoso = true;
                    res.Mensaje = $"Se encontraron {res.Registros.Count} registros de auditoría de tablas";
                }
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error al consultar registros de tablas: {ex.Message}";
            }

            return res;
        }

        public ResConsultaAcciones ObtenerRegistrosAcciones(ReqConsultaAcciones req)
        {
            var res = new ResConsultaAcciones
            {
                Exitoso = false
            };

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    var queryBuilder = new StringBuilder();
                    var parameters = new List<OracleParameter>();

                    queryBuilder.Append(@"
                    SELECT 
                        event_timestamp as fecha_evento,
                        action_name as accion,
                        sql_text as detalles_accion,
                        object_name as objeto_afectado,
                        CASE WHEN return_code = 0 THEN 1 ELSE 0 END as exitoso
                    FROM UNIFIED_AUDIT_TRAIL 
                    WHERE action_name in (
                        'CREATE USER', 'ALTER USER', 'DROP USER',
                        'CREATE ROLE', 'ALTER ANY ROLE', 'DROP ANY ROLE', 'GRANT ANY ROLE',
                        'CREATE TABLE', 'CREATE ANY TABLE', 'ALTER TABLE', 'ALTER ANY TABLE', 'DROP ANY TABLE',
                        'CREATE ANY INDEX', 'ALTER ANY INDEX', 'DROP ANY INDEX',
                        'CREATE VIEW', 'CREATE ANY VIEW', 'DROP ANY VIEW',
                        'CREATE PROCEDURE', 'CREATE ANY PROCEDURE', 'ALTER ANY PROCEDURE', 'DROP ANY PROCEDURE',
                        'CREATE SEQUENCE', 'CREATE ANY SEQUENCE', 'ALTER ANY SEQUENCE', 'DROP ANY SEQUENCE'
                    )");

                    if (req.FechaInicio.HasValue)
                    {
                        var fechaInicio = req.FechaInicio.Value.AddHours(-1);
                        queryBuilder.Append(@" 
                        AND event_timestamp >= 
                        SYS_EXTRACT_UTC(CAST(:fechaInicio AS TIMESTAMP WITH TIME ZONE))");
                        parameters.Add(new OracleParameter("fechaInicio", fechaInicio));
                    }

                    if (req.FechaFin.HasValue)
                    {
                        var fechaFin = req.FechaFin.Value.AddHours(1);
                        queryBuilder.Append(@"
                        AND event_timestamp <= 
                        SYS_EXTRACT_UTC(CAST(:fechaFin AS TIMESTAMP WITH TIME ZONE))");
                        parameters.Add(new OracleParameter("fechaFin", fechaFin));
                    }

                    if (req.Exitoso.HasValue)
                    {
                        queryBuilder.Append(" AND return_code = :exitoso");
                        parameters.Add(new OracleParameter("exitoso", req.Exitoso.Value ? 0 : 1));
                    }

                    queryBuilder.Append(" ORDER BY event_timestamp DESC");

                    if (req.LimiteRegistros.HasValue && req.LimiteRegistros.Value > 0)
                    {
                        queryBuilder.Append(" FETCH FIRST :limite ROWS ONLY");
                        parameters.Add(new OracleParameter("limite", req.LimiteRegistros.Value));
                    }

                    using (OracleCommand cmd = new OracleCommand(queryBuilder.ToString(), conexion))
                    {
                        cmd.Parameters.AddRange(parameters.ToArray());

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var registro = new ResConsultaAcciones.RegistroAccion
                                {
                                    FechaEvento = reader.GetDateTime(reader.GetOrdinal("fecha_evento")),
                                    Accion = reader["accion"].ToString(),
                                    DetallesAccion = reader["detalles_accion"].ToString(),
                                    ObjetoAfectado = reader["objeto_afectado"].ToString(),
                                    Exitoso = Convert.ToBoolean(reader["exitoso"])
                                };

                                res.Registros.Add(registro);
                                res.Estadisticas.TotalAcciones++;

                                if (!res.Estadisticas.PorTipoAccion.ContainsKey(registro.Accion))
                                    res.Estadisticas.PorTipoAccion[registro.Accion] = 0;
                                res.Estadisticas.PorTipoAccion[registro.Accion]++;
                            }
                        }
                    }

                    res.Exitoso = true;
                    res.Mensaje = $"Se encontraron {res.Registros.Count} registros de auditoría de acciones";
                }
            }
            catch (Exception ex)
            {
                res.Mensaje = $"Error al consultar registros de acciones: {ex.Message}";
            }

            return res;
        }
    }

}
