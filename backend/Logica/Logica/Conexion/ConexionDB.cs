using Microsoft.Extensions.Configuration;

using System;

using Oracle.ManagedDataAccess.Client;

namespace Logica.Conexion
{
    public class ConexionDB
    {
        private readonly IConfiguration _configuration;

        // Constructor que recibe la configuración
        public ConexionDB(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Método para probar la conexión a la base de datos
        public string ProbarConexion()
        {
            var connectionString = _configuration.GetConnectionString("OracleDb");

            using (var connection = new OracleConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    using (var command = new OracleCommand("SELECT COUNT(*) FROM CLIENTES", connection))
                    {
                        var count = command.ExecuteScalar();
                        Console.WriteLine($"Conexión exitosa a la base de datos. Total de usuarios: {count}");
                        return $"Conexión exitosa a la base de datos. Total de usuarios: {count}";
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al conectar a la base de datos: {ex.Message}");
                    return $"Error al conectar a la base de datos: {ex.Message}";
                }
            }
        }
    }
}
