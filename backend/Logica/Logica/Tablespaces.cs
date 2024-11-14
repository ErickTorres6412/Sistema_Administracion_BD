using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;
using Logica.Request;
using Logica.Response;
using System.Collections.Generic;
using System;

namespace Logica
{
    public class Tablespaces
    {
        private readonly string _connectionString;

        public Tablespaces(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDb");
        }

        public ResTablespace CrearTablespace(ReqCrearTablespace req)
        {
            ResTablespace res = new ResTablespace();
            res.errores = new List<string>();

            try
            {
                if (req == null)
                {
                    res.errores.Add("Request no puede ser null");
                    res.resultado = false;
                    return res;
                }

                // Validaciones básicas
                if (string.IsNullOrEmpty(req.nombreTablespace))
                {
                    res.errores.Add("El nombre del tablespace es requerido");
                    res.resultado = false;
                    return res;
                }

                if (string.IsNullOrEmpty(req.ubicacionArchivo))
                {
                    res.errores.Add("La ubicación del archivo es requerida");
                    res.resultado = false;
                    return res;
                }

                if (req.tamanioInicial <= 0)
                {
                    res.errores.Add("El tamaño inicial debe ser mayor a 0");
                    res.resultado = false;
                    return res;
                }

                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = $@"CREATE TABLESPACE {req.nombreTablespace} 
                         DATAFILE '{req.ubicacionArchivo}' 
                         SIZE {req.tamanioInicial}M";

                    if (req.autoextend)
                    {

                        sql += $" AUTOEXTEND ON NEXT {req.incrementoSize}M MAXSIZE {req.tamanioMaximo}M";
                    }
                    else
                    {
                        sql += " AUTOEXTEND OFF";
                    }

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                        res.resultado = true;
                    }
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al crear tablespace: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResTablespace ModificarTablespace(ReqModificarTablespace req)
        {
            ResTablespace res = new ResTablespace();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Primero obtenemos el nombre del datafile del tablespace
                    string getDatafileSql = @"
                SELECT file_name 
                FROM dba_data_files 
                WHERE tablespace_name = :tablespaceName";

                    string datafileName;
                    using (OracleCommand cmdGetDatafile = new OracleCommand(getDatafileSql, conexion))
                    {
                        cmdGetDatafile.Parameters.Add(new OracleParameter("tablespaceName", req.nombreTablespace.ToUpper()));
                        datafileName = cmdGetDatafile.ExecuteScalar()?.ToString();

                        if (string.IsNullOrEmpty(datafileName))
                        {
                            res.errores.Add($"No se encontró el datafile para el tablespace {req.nombreTablespace}");
                            res.resultado = false;
                            return res;
                        }
                    }

                    // Modificamos el datafile
                    string sql = $"ALTER DATABASE DATAFILE '{datafileName}'";

                    if (req.autoextend.HasValue)
                    {
                        if (req.autoextend.Value)
                        {
                            // Validar que tengamos los valores necesarios
                            if (!req.incrementoSize.HasValue || !req.tamanioMaximo.HasValue)
                            {
                                res.errores.Add("Para autoextend, se requieren incrementoSize y tamanioMaximo");
                                res.resultado = false;
                                return res;
                            }

                            sql += $" AUTOEXTEND ON NEXT {req.incrementoSize}M MAXSIZE {req.tamanioMaximo}M";
                        }
                        else
                        {
                            sql += " AUTOEXTEND OFF";
                        }
                    }

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                        res.resultado = true;
                    }
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al modificar tablespace: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResTablespace EliminarTablespace(ReqEliminarTablespace req)
        {
            ResTablespace res = new ResTablespace();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = $"DROP TABLESPACE {req.nombreTablespace}";

                    if (req.incluirContenido)
                    {
                        sql += " INCLUDING CONTENTS AND DATAFILES";
                    }

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                        res.resultado = true;
                    }
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al eliminar tablespace: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResInfoTablespace ObtenerInformacionTablespaces()
        {
            ResInfoTablespace res = new ResInfoTablespace();
            res.errores = new List<string>();
            res.tablespaces = new List<InfoTablespace>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = @"
                        SELECT 
                            ddf.TABLESPACE_NAME,
                            ddf.STATUS,
                            ddf.FILE_NAME,
                            ddf.BYTES/1024/1024 as SIZE_MB,
                            (ddf.BYTES - NVL(dfs.BYTES, 0))/1024/1024 as FREE_MB,
                            ddf.AUTOEXTENSIBLE,
                            ddf.MAXBYTES/1024/1024 as MAX_SIZE_MB
                        FROM DBA_DATA_FILES ddf
                        LEFT JOIN (
                            SELECT TABLESPACE_NAME, SUM(BYTES) BYTES
                            FROM DBA_FREE_SPACE
                            GROUP BY TABLESPACE_NAME
                        ) dfs ON ddf.TABLESPACE_NAME = dfs.TABLESPACE_NAME";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    using (OracleDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            res.tablespaces.Add(new InfoTablespace
                            {
                                nombreTablespace = reader.GetString(0),
                                estado = reader.GetString(1),
                                ubicacionArchivo = reader.GetString(2),
                                tamanioActual = reader.GetDecimal(3),
                                espacioLibre = reader.GetDecimal(4),
                                autoextend = reader.GetString(5) == "YES",
                                tamanioMaximo = reader.GetDecimal(6)
                            });
                        }
                        res.resultado = true;
                    }
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al obtener información de tablespaces: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResTablespace CompactarTablespace(ReqCompactarTablespace req)
        {
            ResTablespace res = new ResTablespace();
            res.errores = new List<string>();

            try
            {
                if (req == null)
                {
                    res.errores.Add("Request no puede ser null");
                    res.resultado = false;
                    return res;
                }

                // Validación básica
                if (string.IsNullOrEmpty(req.nombreTablespace))
                {
                    res.errores.Add("El nombre del tablespace es requerido");
                    res.resultado = false;
                    return res;
                }

                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Primero verificamos si el tablespace existe
                    string verificarSql = @"
                SELECT COUNT(*)
                FROM dba_tablespaces
                WHERE tablespace_name = :tablespaceName";

                    using (OracleCommand cmdVerificar = new OracleCommand(verificarSql, conexion))
                    {
                        cmdVerificar.Parameters.Add(new OracleParameter("tablespaceName", req.nombreTablespace.ToUpper()));
                        int count = Convert.ToInt32(cmdVerificar.ExecuteScalar());

                        if (count == 0)
                        {
                            res.errores.Add($"El tablespace {req.nombreTablespace} no existe");
                            res.resultado = false;
                            return res;
                        }
                    }

                    // Ejecutamos el comando COALESCE
                    string sql = $"ALTER TABLESPACE {req.nombreTablespace} COALESCE";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                        res.resultado = true;
                    }
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al compactar tablespace: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

    }
}