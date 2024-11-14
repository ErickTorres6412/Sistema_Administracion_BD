        using Oracle.ManagedDataAccess.Client;
        using System.Data;
        using Logica.Request;
        using Logica.Response;
        using System.Collections.Generic;
        using System.Linq;
        using System;

        using Microsoft.Extensions.Configuration;

        namespace Logica
        {
            public class Performance
            {
                private readonly string _connectionString;

                public Performance(IConfiguration configuration)
                {
                    _connectionString = configuration.GetConnectionString("OracleDb");
                }



        public ResQueryPlan ObtenerQueryPlan(ReqQueryPlan request)
        {
            var response = new ResQueryPlan
            {
                Operaciones = new List<ResQueryPlan.OperacionPlan>(),
                Estadisticas = new ResQueryPlan.EstadisticasEjecucion
                {
                    PredicateInformation = new List<string>()
                }
            };

            try
            {
                if (string.IsNullOrEmpty(request.ConsultaSQL))
                {
                    throw new ArgumentException("La consulta SQL no puede estar vacía");
                }

                using (var connection = new OracleConnection(_connectionString))
                {
                    connection.Open();

                    // Limpiar plan previo y ejecutar EXPLAIN PLAN
                    using (var cmdClean = new OracleCommand("DELETE FROM PLAN_TABLE", connection))
                    {
                        cmdClean.ExecuteNonQuery();
                    }

                    using (var cmdExplain = new OracleCommand($"EXPLAIN PLAN FOR {request.ConsultaSQL}", connection))
                    {
                        cmdExplain.ExecuteNonQuery();
                    }

                    // Obtener el plan de ejecución con formato mejorado
                    using (var cmdPlan = new OracleCommand(@"
                    SELECT LPAD(' ', 2*LEVEL-1)||OPERATION||' '||
                           OPTIONS||' '||
                           OBJECT_NAME||' '||
                           DECODE(COST, NULL, '', COST)||' '||
                           DECODE(CARDINALITY, NULL, '', CARDINALITY)||' '||
                           DECODE(BYTES, NULL, '', BYTES) as PLAN_OUTPUT,
                           LEVEL,
                           PARENT_ID,
                           ID,
                           OPERATION,
                           OPTIONS,
                           OBJECT_NAME,
                           COST,
                           CARDINALITY,
                           BYTES
                    FROM PLAN_TABLE
                    START WITH ID = 0 AND PARENT_ID IS NULL
                    CONNECT BY PRIOR ID = PARENT_ID
                    ORDER SIBLINGS BY POSITION", connection))
                    {
                        using (var reader = cmdPlan.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var operacion = new ResQueryPlan.OperacionPlan
                                {
                                    Id = SafeGetInt32(reader, "ID"),
                                    ParentId = SafeGetInt32(reader, "PARENT_ID"),
                                    Nivel = SafeGetInt32(reader, "LEVEL") - 1, // Restamos 1 para que el nivel raíz sea 0
                                    TipoOperacion = SafeGetString(reader, "OPERATION"),
                                    OpcionesOperacion = SafeGetString(reader, "OPTIONS"),
                                    ObjetoAccedido = SafeGetString(reader, "OBJECT_NAME"),
                                    Filas = SafeGetInt32(reader, "CARDINALITY"),
                                    Bytes = SafeGetInt32(reader, "BYTES"),
                                    Costo = SafeGetInt32(reader, "COST")
                                };

                                response.Operaciones.Add(operacion);
                            }
                        }

                        // Obtener predicados y otra información adicional
                        using (var cmdPredicates = new OracleCommand(@"
                        SELECT ACCESS_PREDICATES, FILTER_PREDICATES
                        FROM PLAN_TABLE
                        WHERE ACCESS_PREDICATES IS NOT NULL 
                           OR FILTER_PREDICATES IS NOT NULL", connection))
                        {
                            using (var reader = cmdPredicates.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    string accessPred = reader.IsDBNull(0) ? null : reader.GetString(0);
                                    string filterPred = reader.IsDBNull(1) ? null : reader.GetString(1);

                                    if (!string.IsNullOrEmpty(accessPred))
                                        response.Estadisticas.PredicateInformation.Add($"access({accessPred})");
                                    if (!string.IsNullOrEmpty(filterPred))
                                        response.Estadisticas.PredicateInformation.Add($"filter({filterPred})");
                                }
                            }
                        }

                        // Obtener Plan Hash Value
                        using (var cmdHash = new OracleCommand(
                            "SELECT PLAN_HASH_VALUE FROM V$SQL_PLAN WHERE SQL_ID = (SELECT MAX(SQL_ID) FROM V$SQL WHERE SQL_TEXT LIKE :sqlText)",
                            connection))
                        {
                            cmdHash.Parameters.Add(":sqlText", OracleDbType.Varchar2).Value = $"%{request.ConsultaSQL.Substring(0, Math.Min(100, request.ConsultaSQL.Length))}%";
                            var hashValue = cmdHash.ExecuteScalar();
                            response.Estadisticas.PlanHashValue = hashValue?.ToString() ?? "No disponible";
                        }

                        // Calcular estadísticas totales
                        if (response.Operaciones.Any())
                        {
                            response.Estadisticas.CostoTotal = response.Operaciones.Sum(o => o.Costo);
                            response.Estadisticas.FilasTotales = response.Operaciones.Sum(o => o.Filas);
                            response.Estadisticas.TiempoEstimado = CalcularTiempoEstimado(response.Estadisticas.CostoTotal);
                        }
                    }

                    response.Exitoso = true;
                    response.Mensaje = "Plan de ejecución obtenido exitosamente";
                }
            }
            catch (Exception ex)
            {
                response.Exitoso = false;
                response.Mensaje = $"Error al obtener el plan de ejecución: {ex.Message}";
            }

            return response;
        }


        public ResCreateIndex CrearIndice(ReqCreateIndex request)
                {
                    var response = new ResCreateIndex
                    {
                        Detalles = new ResCreateIndex.DetallesIndice
                        {
                            Columnas = new List<string>()
                        }
                    };

                    try
                    {
                        // Validaciones
                        if (string.IsNullOrEmpty(request.NombreIndice))
                            throw new ArgumentException("El nombre del índice no puede estar vacío");
                        if (string.IsNullOrEmpty(request.NombreTabla))
                            throw new ArgumentException("El nombre de la tabla no puede estar vacío");
                        if (request.Columnas == null || !request.Columnas.Any())
                            throw new ArgumentException("Debe especificar al menos una columna para el índice");

                        using (var connection = new OracleConnection(_connectionString))
                        {
                            connection.Open();

                            // Verificar si el índice ya existe
                            using (var cmdCheck = new OracleCommand(
                                "SELECT COUNT(*) FROM ALL_INDEXES WHERE INDEX_NAME = :indexName", connection))
                            {
                                cmdCheck.Parameters.Add(":indexName", OracleDbType.Varchar2).Value = request.NombreIndice.ToUpper();
                                int exists = Convert.ToInt32(cmdCheck.ExecuteScalar());
                                if (exists > 0)
                                    throw new Exception($"Ya existe un índice con el nombre {request.NombreIndice}");
                            }

                            string columnas = string.Join(", ", request.Columnas);
                            string createIndexSql = $@"CREATE {(request.Unico ? "UNIQUE " : "")}INDEX {request.NombreIndice} 
                                             ON {request.NombreTabla}({columnas})";

                            using (var cmd = new OracleCommand(createIndexSql, connection))
                            {
                                cmd.ExecuteNonQuery();
                            }

                            // Obtener detalles del índice creado
                            using (var cmd = new OracleCommand(
                                @"SELECT INDEX_TYPE, STATUS, LAST_ANALYZED, UNIQUENESS 
                          FROM ALL_INDEXES 
                          WHERE INDEX_NAME = :indexName 
                          AND TABLE_NAME = :tableName", connection))
                            {
                                cmd.Parameters.Add(":indexName", OracleDbType.Varchar2).Value = request.NombreIndice.ToUpper();
                                cmd.Parameters.Add(":tableName", OracleDbType.Varchar2).Value = request.NombreTabla.ToUpper();

                                using (var reader = cmd.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        response.Detalles = new ResCreateIndex.DetallesIndice
                                        {
                                            NombreIndice = request.NombreIndice,
                                            NombreTabla = request.NombreTabla,
                                            Columnas = request.Columnas.ToList(),
                                            TipoIndice = reader.GetString(0),
                                            Estado = reader.GetString(1),
                                            FechaCreacion = reader.GetDateTime(2),
                                            EsUnico = reader.GetString(3) == "UNIQUE"
                                        };
                                    }
                                }
                            }

                            response.Exitoso = true;
                            response.Mensaje = "Índice creado exitosamente";
                        }
                    }
                    catch (Exception ex)
                    {
                        response.Exitoso = false;
                        response.Mensaje = $"Error al crear el índice: {ex.Message}";
                    }

                    return response;
                }

                private int SafeGetInt32(OracleDataReader reader, string columnName)
                {
                    int ordinal = reader.GetOrdinal(columnName);
                    return reader.IsDBNull(ordinal) ? 0 : Convert.ToInt32(reader.GetValue(ordinal));
                }

                private string SafeGetString(OracleDataReader reader, string columnName)
                {
                    int ordinal = reader.GetOrdinal(columnName);
                    return reader.IsDBNull(ordinal) ? string.Empty : reader.GetString(ordinal);
                }

                private string CalcularTiempoEstimado(int costoTotal)
                {
                    if (costoTotal < 10)
                        return "00:00:01";
                    if (costoTotal < 100)
                        return "00:00:05";
                    if (costoTotal < 1000)
                        return "00:00:30";
                    if (costoTotal < 5000)
                        return "00:01:00";
                    if (costoTotal < 10000)
                        return "00:02:00";
        
                    return $"00:{Math.Min(59, costoTotal / 5000):00}:00";
                }
                private int DetermineParentId(string line)
                {
                    int indentation = line.TakeWhile(c => c == ' ').Count() / 2;
                    return indentation == 0 ? 0 : indentation - 1;
                }

                private int ParseValue(string value)
                {
                    if (string.IsNullOrEmpty(value)) return 0;
                    value = value.Split(' ')[0].Trim();
                    return int.TryParse(value, out int result) ? result : 0;
                }

                private int ParseCost(string costString)
                {
                    if (string.IsNullOrEmpty(costString)) return 0;
                    var match = System.Text.RegularExpressions.Regex.Match(costString, @"\d+");
                    return match.Success ? int.Parse(match.Value) : 0;
                }

                private int ParseCPUPercentage(string costString)
                {
                    if (string.IsNullOrEmpty(costString)) return 0;
                    var match = System.Text.RegularExpressions.Regex.Match(costString, @"\((\d+)\)");
                    return match.Success ? int.Parse(match.Groups[1].Value) : 0;
                }
            }
        }