using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using Logica.Request;
using Logica.Response;

namespace Logica
{
    public class Tuning
    {
        private readonly string _connectionString;

        public Tuning(IConfiguration configuration)
        {
            _connectionString = "User Id=SYSTEM ;Password=root123 ;Data Source=localhost:1521/XE";
        }

        public ResAnalisisConsulta AnalizarConsulta(ReqAnalisisConsulta req)
        {
            if (req == null)
            {
                throw new ArgumentNullException(nameof(req), "The request parameter cannot be null.");
            }

            ResAnalisisConsulta res = new ResAnalisisConsulta
            {
                Errores = new List<string>(),
                Estadisticas = new Dictionary<string, double>(),
                RecomendacionesOptimizacion = new List<string>(),
                Resultado = false
            };

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // 1. Obtener el plan de ejecución
                    StringBuilder planEjecucion = new StringBuilder();

                    // Limpiar tabla PLAN_TABLE
                    using (OracleCommand cmdLimpiar = new OracleCommand("DELETE FROM PLAN_TABLE", conexion))
                    {
                        cmdLimpiar.ExecuteNonQuery();
                    }

                    // Generar plan de ejecución
                    using (OracleCommand cmdExplain = new OracleCommand($"EXPLAIN PLAN FOR {req.SqlQuery}", conexion))
                    {
                        cmdExplain.ExecuteNonQuery();
                    }

                    // Obtener detalles del plan
                    string queryPlan = @"
                        SELECT 
                            LPAD(' ', 2*LEVEL) || OPERATION || ' ' || 
                            DECODE(OPTIONS, NULL, '', '(' || OPTIONS || ') ') || 
                            DECODE(OBJECT_NAME, NULL, '', '[' || OBJECT_NAME || '] ') || 
                            DECODE(COST, NULL, '', 'Cost: ' || COST) AS PLAN_OPERATION
                        FROM PLAN_TABLE
                        START WITH ID = 0
                        CONNECT BY PRIOR ID = PARENT_ID
                        ORDER SIBLINGS BY POSITION";

                    using (OracleCommand cmdPlan = new OracleCommand(queryPlan, conexion))
                    {
                        using (OracleDataReader reader = cmdPlan.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                planEjecucion.AppendLine(reader.GetString(0));
                            }
                        }
                    }

                    res.PlanEjecucion = planEjecucion.ToString();

                    // 2. Recopilar estadísticas de la consulta
                    string queryStats = $@"
                        SELECT /*+ GATHER_PLAN_STATISTICS */
                            * FROM ({req.SqlQuery}) WHERE ROWNUM <= 1";

                    using (OracleCommand cmdStats = new OracleCommand(queryStats, conexion))
                    {
                        cmdStats.ExecuteNonQuery();
                    }

                    // Obtener estadísticas de la caché
                    string queryCache = @"
                        SELECT 
                            ELAPSED_TIME/1000000 as elapsed_time_seconds,
                            BUFFER_GETS,
                            DISK_READS,
                            ROWS_PROCESSED
                        FROM V$SQL 
                        WHERE SQL_TEXT LIKE :sqlText
                        AND ROWNUM = 1";

                    using (OracleCommand cmdCache = new OracleCommand(queryCache, conexion))
                    {
                        cmdCache.Parameters.Add(new OracleParameter("sqlText", $"%{req.SqlQuery}%"));
                        using (OracleDataReader reader = cmdCache.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                res.Estadisticas["TiempoEjecucion"] = reader.GetDouble(0);
                                res.Estadisticas["BufferGets"] = reader.GetDouble(1);
                                res.Estadisticas["LecturasDisco"] = reader.GetDouble(2);
                                res.Estadisticas["FilasProcesadas"] = reader.GetDouble(3);
                            }
                        }
                    }

                    // 3. Analizar y generar recomendaciones
                    AnalizarYGenerarRecomendaciones(req.SqlQuery, res);

                    res.Resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.Errores.Add($"Error al analizar la consulta: {ex.Message}");
                res.Resultado = false;
            }

            return res;
        }

        private void AnalizarYGenerarRecomendaciones(string sqlQuery, ResAnalisisConsulta res)
        {
            sqlQuery = sqlQuery.ToUpper();

            // Analizar el uso de índices
            if (!sqlQuery.Contains("INDEX") && (sqlQuery.Contains("WHERE") || sqlQuery.Contains("JOIN")))
            {
                res.RecomendacionesOptimizacion.Add("Considerar la creación de índices para las columnas en las cláusulas WHERE y JOIN");
            }

            // Analizar JOINs
            if (sqlQuery.Contains("JOIN") && !sqlQuery.Contains("INNER JOIN") && !sqlQuery.Contains("LEFT JOIN"))
            {
                res.RecomendacionesOptimizacion.Add("Especificar explícitamente el tipo de JOIN para mejor legibilidad y rendimiento");
            }

            // Analizar uso de SELECT *
            if (sqlQuery.Contains("SELECT *"))
            {
                res.RecomendacionesOptimizacion.Add("Especificar las columnas necesarias en lugar de usar SELECT *");
            }

            // Analizar estadísticas
            if (res.Estadisticas.ContainsKey("BufferGets") && res.Estadisticas["BufferGets"] > 1000)
            {
                res.RecomendacionesOptimizacion.Add("Alto número de buffer gets. Considerar la optimización de índices");
            }

            if (res.Estadisticas.ContainsKey("LecturasDisco") && res.Estadisticas["LecturasDisco"] > 100)
            {
                res.RecomendacionesOptimizacion.Add("Alto número de lecturas de disco. Considerar aumentar el tamaño del buffer cache");
            }
        }

        // Método auxiliar para obtener estadísticas de una tabla
        public ResAnalisisConsulta ObtenerEstadisticasTabla(string schema, string tabla)
        {
            ResAnalisisConsulta res = new ResAnalisisConsulta
            {
                Errores = new List<string>(),
                Estadisticas = new Dictionary<string, double>(),
                RecomendacionesOptimizacion = new List<string>(),
                Resultado = false
            };

      

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    string query = @"
                        SELECT 
                            NUM_ROWS,
                            BLOCKS,
                            AVG_ROW_LEN,
                            SAMPLE_SIZE,
                            LAST_ANALYZED
                        FROM ALL_TABLES 
                        WHERE OWNER = :schema 
                        AND TABLE_NAME = :tabla";

                    using (OracleCommand cmd = new OracleCommand(query, conexion))
                    {
                        cmd.Parameters.Add(new OracleParameter("schema", schema.ToUpper()));
                        cmd.Parameters.Add(new OracleParameter("tabla", tabla.ToUpper()));

                        using (OracleDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                res.Estadisticas["NumeroFilas"] = reader.GetDouble(0);
                                res.Estadisticas["Bloques"] = reader.GetDouble(1);
                                res.Estadisticas["LongitudPromedioFila"] = reader.GetDouble(2);
                                res.Estadisticas["TamanoMuestra"] = reader.GetDouble(3);
                            }
                        }
                    }

                    res.Resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.Errores.Add($"Error al obtener estadísticas de la tabla: {ex.Message}");
                res.Resultado = false;
            }

            return res;
        }
    }
}