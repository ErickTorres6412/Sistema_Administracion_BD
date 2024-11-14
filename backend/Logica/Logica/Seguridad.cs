using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using Logica.Request;
using Logica.Response;

namespace Logica
{
    public class Seguridad
    {
        private readonly string _connectionString;

        public Seguridad(IConfiguration configuration)
        {
            _connectionString = "User Id=SYSTEM ;Password=root123 ;Data Source=localhost:1521/XE";
        }

        // Método para crear un nuevo usuario
        public ResCrearUsuario CrearUsuario(ReqCrearUsuario req)
        {
            ResCrearUsuario res = new ResCrearUsuario();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Crear el usuario con _ORACLE_SCRIPT habilitado
                    string alterSessionSql = "ALTER SESSION SET \"_ORACLE_SCRIPT\"=true";
                    using (OracleCommand alterCmd = new OracleCommand(alterSessionSql, conexion))
                    {
                        alterCmd.ExecuteNonQuery(); // Ejecuta el comando para habilitar _ORACLE_SCRIPT
                    }

                    // Crear el usuario
                    string createUserSql = $"CREATE USER {req.nombreUsuario} IDENTIFIED BY {req.password}";
                    using (OracleCommand cmd = new OracleCommand(createUserSql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    // Asignar privilegios básicos
                    string grantPrivilegesSql = $"GRANT CREATE SESSION TO {req.nombreUsuario}";
                    using (OracleCommand cmd = new OracleCommand(grantPrivilegesSql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    // Asignar roles si se especificaron
                    if (req.roles != null && req.roles.Count > 0)
                    {
                        foreach (string rol in req.roles)
                        {
                            string grantRoleSql = $"GRANT {rol} TO {req.nombreUsuario}";
                            using (OracleCommand cmd = new OracleCommand(grantRoleSql, conexion))
                            {
                                cmd.ExecuteNonQuery();
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al crear usuario: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        // Método para modificar un usuario existente
        public ResModificarUsuario ModificarUsuario(ReqModificarUsuario req)
        {
            ResModificarUsuario res = new ResModificarUsuario();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Modificar contraseña si se especificó
                    if (!string.IsNullOrEmpty(req.nuevoPassword))
                    {
                        string alterUserSql = $"ALTER USER {req.nombreUsuario} IDENTIFIED BY {req.nuevoPassword}";
                        using (OracleCommand cmd = new OracleCommand(alterUserSql, conexion))
                        {
                            cmd.ExecuteNonQuery();
                        }
                    }

                    // Bloquear o desbloquear cuenta
                    string lockUnlockSql = req.bloquear ?
                        $"ALTER USER {req.nombreUsuario} ACCOUNT LOCK" :
                        $"ALTER USER {req.nombreUsuario} ACCOUNT UNLOCK";
                    using (OracleCommand cmd = new OracleCommand(lockUnlockSql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al modificar usuario: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        // Método para eliminar un usuario
        public ResEliminarUsuario EliminarUsuario(ReqEliminarUsuario req)
        {
            ResEliminarUsuario res = new ResEliminarUsuario();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    string dropUserSql = req.includeCascade ?
                        $"DROP USER {req.nombreUsuario} CASCADE" :
                        $"DROP USER {req.nombreUsuario}";

                    using (OracleCommand cmd = new OracleCommand(dropUserSql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al eliminar usuario: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        // Método para listar usuarios
        public ResListarUsuarios ListarUsuarios()
        {
            ResListarUsuarios res = new ResListarUsuarios();
            res.errores = new List<string>();
            res.usuarios = new List<UsuarioInfo>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = @"
                        SELECT USERNAME, 
                               ACCOUNT_STATUS, 
                               LOCK_DATE, 
                               CREATED,
                               PROFILE, 
                               DEFAULT_TABLESPACE
                        FROM DBA_USERS
                        ORDER BY USERNAME";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        using (OracleDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                res.usuarios.Add(new UsuarioInfo
                                {
                                    nombreUsuario = reader["USERNAME"].ToString(),
                                    estado = reader["ACCOUNT_STATUS"].ToString(),
                                    fechaBloqueo = reader["LOCK_DATE"] as DateTime?,
                                    fechaCreacion = Convert.ToDateTime(reader["CREATED"]),
                                    perfil = reader["PROFILE"].ToString(),
                                    tablespaceDefault = reader["DEFAULT_TABLESPACE"].ToString()
                                });
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al listar usuarios: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        // Método para listar privilegios de un usuario
        public ResListarPrivilegios ListarPrivilegios(ReqListarPrivilegios req)
        {
            ResListarPrivilegios res = new ResListarPrivilegios();
            res.errores = new List<string>();
            res.privilegios = new List<PrivilegioInfo>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = @"
                        SELECT PRIVILEGE, ADMIN_OPTION
                        FROM DBA_SYS_PRIVS
                        WHERE GRANTEE = :usuario
                        UNION ALL
                        SELECT GRANTED_ROLE, ADMIN_OPTION
                        FROM DBA_ROLE_PRIVS
                        WHERE GRANTEE = :usuario";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        cmd.Parameters.Add(new OracleParameter("usuario", req.nombreUsuario.ToUpper()));

                        using (OracleDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                res.privilegios.Add(new PrivilegioInfo
                                {
                                    nombrePrivilegio = reader["PRIVILEGE"].ToString(),
                                    conAdmin = Convert.ToString(reader["ADMIN_OPTION"]) == "YES"
                                });
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al listar privilegios: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResListarRoles ListarRoles()
        {
            ResListarRoles res = new ResListarRoles();
            res.errores = new List<string>();
            res.roles = new List<RolInfo>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();
                    string sql = @"
                SELECT 
                    ROLE,
                    AUTHENTICATION_TYPE,
                    COMMON,
                    ORACLE_MAINTAINED
                FROM DBA_ROLES
                ORDER BY ROLE";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        using (OracleDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                res.roles.Add(new RolInfo
                                {
                                    nombreRol = reader["ROLE"].ToString(),
                                    autenticacion = reader["AUTHENTICATION_TYPE"].ToString(),
                                    comun = reader["COMMON"].ToString(),
                                    oracle = reader["ORACLE_MAINTAINED"].ToString(),
                                });
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al listar roles: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResCrearRol CrearRol(ReqCrearRol req)
        {
            ResCrearRol res = new ResCrearRol();
            res.errores = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Crear el rol
                    string createRoleSql = $"CREATE ROLE {req.nombreRol}";
                    using (OracleCommand cmd = new OracleCommand(createRoleSql, conexion))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    // Asignar privilegios si se especificaron
                    if (req.privilegios != null && req.privilegios.Count > 0)
                    {
                        foreach (string privilegio in req.privilegios)
                        {
                            string grantPrivilegeSql = $"GRANT {privilegio} TO {req.nombreRol}";
                            using (OracleCommand cmd = new OracleCommand(grantPrivilegeSql, conexion))
                            {
                                cmd.ExecuteNonQuery();
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al crear rol: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

        public ResObtenerPrivilegios ObtenerPrivilegios()
        {
            ResObtenerPrivilegios res = new ResObtenerPrivilegios();
            res.errores = new List<string>();
            res.privilegios = new List<string>();

            try
            {
                using (OracleConnection conexion = new OracleConnection(_connectionString))
                {
                    conexion.Open();

                    // Consulta para obtener los privilegios del sistema
                    string sql = @"
                SELECT DISTINCT privilege 
                FROM dba_sys_privs 
                WHERE privilege NOT LIKE '%ANY%'  -- Excluir privilegios con 'ANY' para simplificar
                  AND privilege NOT IN (
                    'INHERIT PRIVILEGES',
                    'KEEP DATE TIME',
                    'KEEP SYSGUID',
                    'SYSBACKUP',
                    'SYSDBA',
                    'SYSDG',
                    'SYSKM',
                    'SYSOPER',
                    'SYSRAC'
                  )
                ORDER BY privilege";

                    using (OracleCommand cmd = new OracleCommand(sql, conexion))
                    {
                        using (OracleDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                res.privilegios.Add(reader.GetString(0));
                            }
                        }
                    }

                    res.resultado = true;
                }
            }
            catch (Exception ex)
            {
                res.errores.Add($"Error al obtener privilegios: {ex.Message}");
                res.resultado = false;
            }

            return res;
        }

    }


}