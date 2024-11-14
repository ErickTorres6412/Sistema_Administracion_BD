using Logica.Conexion;
using Logica.Request;
using Logica.Response;
using Oracle.ManagedDataAccess.Client; // ADO.NET para Oracle
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics; // Para ejecutar procesos
using System.IO; // Para verificar archivos

namespace Logica
{
    public class Respaldos
    {
        private readonly string _connectionString;
        private const string User = "SYSTEM";
        private const string Password = "root123";
        private const string ConnectionString = "XE"; // Cambia esto según sea necesario
        private const string DirectoryName = "RESPALDO";
        private readonly string _backupDirectory = @"C:\RespaldosOracle";

        public Respaldos(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDb");
            EnsureBackupDirectory();
            CreateOracleDirectory();
        }

        private void EnsureBackupDirectory()
        {
            if (!Directory.Exists(_backupDirectory))
            {
                Directory.CreateDirectory(_backupDirectory);
            }
        }

        private void CreateOracleDirectory()
        {
            using (var conexion = new OracleConnection(_connectionString))
            {
                conexion.Open();
                using (var cmd = new OracleCommand($"CREATE OR REPLACE DIRECTORY {DirectoryName} AS '{_backupDirectory}'", conexion))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

        private (bool Success, string Result, string Error) ExecuteProcess(string command)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/C {command}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = Process.Start(startInfo))
            {
                string result = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit();
                return (process.ExitCode == 0, result, error);
            }
        }

        private T GenerateBackup<T>(string dumpFile, string logFile, string additionalOptions, List<string> errores)
            where T : new()
        {
            var res = new T();
            var command = $"expdp {User}/{Password}@{ConnectionString} {additionalOptions} DIRECTORY={DirectoryName} DUMPFILE={dumpFile} LOGFILE={logFile}";

            var (success, result, error) = ExecuteProcess(command);

            if (success)
            {
                ((dynamic)res).resultado = true; // Casteo dinámico para establecer el resultado
            }
            else
            {
                errores.Add($"Error al realizar el respaldo: {result} {error}");
                ((dynamic)res).resultado = false;
            }

            return res;
        }

        public ResRespaldoSchema generarRespaldoSchema(ReqRespaldoSchema req)
        {
            var errores = new List<string>();
            return GenerateBackup<ResRespaldoSchema>($"{req.nombreSchema}.DMP", $"{req.nombreSchema}.LOG", $"SCHEMAS={req.nombreSchema}", errores);
        }

        public ResRespaldoTabla generarRespaldoTabla(ReqRespaldoTabla req)
        {
            var errores = new List<string>();
            return GenerateBackup<ResRespaldoTabla>($"{req.nombreSchema}_{req.nombreTabla}.DMP", $"{req.nombreSchema}_{req.nombreTabla}.LOG", $"TABLES={req.nombreSchema}.{req.nombreTabla}", errores);
        }

        public ResRespaldoCompleto generarRespaldoCompleto()
        {
            var errores = new List<string>();
            return GenerateBackup<ResRespaldoCompleto>("XE.DMP", "XE.LOG", "FULL=Y", errores);
        }

        public ResImportarRespaldoSchema ImportarRespaldoSchema(ReqRespaldoSchema req)
        {
            var res = new ResImportarRespaldoSchema { errores = new List<string>() };
            var command = $"IMPDP {User}/{Password}@{ConnectionString} FULL=Y DIRECTORY={DirectoryName} DUMPFILE={req.nombreSchema}.DMP LOGFILE={req.nombreSchema}.LOG";

            var (success, result, error) = ExecuteProcess(command);

            res.resultado = success;
            res.errores.Add(success ? "Importación completada exitosamente." : $"Error al realizar la importación: {error}");

            return res;
        }
        public ResImportarRespaldoTabla ImportarRespaldoTablaSchema(ReqRespaldoTabla req)
        {
            var res = new ResImportarRespaldoTabla { errores = new List<string>() };
            var comando = $"IMPDP SYSTEM/{Password}@{ConnectionString} TABLES={req.nombreSchema}.{req.nombreTabla} DIRECTORY={DirectoryName} DUMPFILE={req.nombreSchema}_{req.nombreTabla}.DMP LOGFILE={req.nombreSchema}_{req.nombreTabla}.LOG TABLE_EXISTS_ACTION=REPLACE";

            var (success, result, error) = ExecuteProcess(comando);

            if (success)
            {
                res.resultado = true;
                res.errores.Add("Importación de la tabla completada exitosamente.");
            }
            else
            {
                res.resultado = false;
                res.errores.Add($"Error al realizar la importación: {error}");
            }

            return res;
        }
        public ResImportarRespaldoCompleto ImportarRespaldoCompleto()
        {
            var res = new ResImportarRespaldoCompleto { errores = new List<string>() };
            var comando = $"IMPDP SYSTEM/{Password}@{ConnectionString} FULL=Y DIRECTORY={DirectoryName} DUMPFILE=XE.DMP LOGFILE=XE.LOG";

            var (success, result, error) = ExecuteProcess(comando);

            if (success)
            {
                res.resultado = true;
                res.errores.Add("Importación completa realizada exitosamente.");
            }
            else
            {
                res.resultado = false;
                res.errores.Add($"Error al realizar la importación completa: {error}");
            }

            return res;
        }

    }
}
