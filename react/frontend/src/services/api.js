import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7200/api/',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const respaldoService = {
    generarRespaldoSchema: (nombreSchema) =>
        api.post('/respaldo/generarRespaldoSchema', {
            nombreSchema,
            descripcion: `Respaldo del schema ${nombreSchema}`,
            // Agrega aquí otros campos si tu ReqRespaldoSchema los requiere
        }),

    generarRespaldoTabla: (nombreSchema, nombreTabla) =>
        api.post('/respaldo/generarRespaldoTabla', {
            nombreSchema,
            nombreTabla,
            descripcion: `Respaldo de la tabla ${nombreTabla} del schema ${nombreSchema}`,
            // Agrega aquí otros campos si tu ReqRespaldoTabla los requiere
        }),

    generarRespaldoCompleto: () =>
        api.get('/respaldo/generarRespaldoCompleto'),

    importarRespaldoSchema: (nombreSchema) =>
        api.post('/respaldo/ImportarRespaldoSchema', {
            nombreSchema,
            descripcion: `Importación del schema ${nombreSchema}`
        }),

    importarRespaldoTabla: (req) =>
        api.post('/respaldo/ImportarRespaldoTabla', {
            nombreSchema: req.nombreSchema,
            nombreTabla: req.nombreTabla,
            descripcion: `Importación de la tabla ${req.nombreTabla} del schema ${req.nombreSchema}`
        }),

    importarRespaldoCompleto: () =>
        api.post('/respaldo/ImportarRespaldoCompleto')

};

export const tuningService = {
    analizarConsulta: (sqlQuery, schema) =>
        api.post('/tuning/analizarConsulta', {
            sqlQuery,
            schema
        }),

    obtenerEstadisticasTabla: (schema, tabla) =>
        api.get(`/tuning/obtenerEstadisticasTabla/${schema}/${tabla}`)
};

export const seguridadService = {
    crearUsuario: (usuario) =>
        api.post('/seguridad/crearUsuario', {
            nombreUsuario: usuario.nombreUsuario,
            password: usuario.password,
            roles: Array.isArray(usuario.roles) ? usuario.roles : [usuario.roles]
        }),

    modificarUsuario: (usuario) =>
        api.post('/seguridad/modificarUsuario', {
            nombreUsuario: usuario.nombreUsuario,
            nuevoPassword: usuario.nuevoPassword,
            bloquear: usuario.bloquear
        }),

    eliminarUsuario: (nombreUsuario, includeCascade = false) =>
        api.post('/seguridad/eliminarUsuario', {
            nombreUsuario,
            includeCascade
        }),

    crearRol: (rol) =>
        api.post('/seguridad/crearRol', {
            nombreRol: rol.nombreRol,
            privilegios: Array.isArray(rol.privilegios) ? rol.privilegios : [rol.privilegios]
        }),

    listarUsuarios: () =>
        api.get('/seguridad/listarUsuarios'),

    listarRoles: () =>
        api.get('/seguridad/listarRoles'),

    listarPrivilegios: (nombreUsuario) =>
        api.get(`/seguridad/listarPrivilegios/${nombreUsuario}`),

    obtenerPrivilegios: () =>
        api.get('/seguridad/obtenerPrivilegios')
};

export const tablespaceService = {
    crearTablespace: (tablespace) =>
        api.post('/tablespace/crear', {
            nombreTablespace: tablespace.nombreTablespace,
            ubicacionArchivo: tablespace.ubicacionArchivo,
            tamanioInicial: tablespace.tamanioInicial,
            tamanioMaximo: tablespace.tamanioMaximo,
            autoextend: Boolean(tablespace.autoextend),
            incrementoSize: tablespace.autoextend ? (parseInt(tablespace.incrementoSize) || 0) : null
        }),

    modificarTablespace: (tablespace) =>
        api.post('/tablespace/modificar', {
            nombreTablespace: tablespace.nombreTablespace,
            autoextend: Boolean(tablespace.autoextend),
            incrementoSize: tablespace.autoextend ? (parseInt(tablespace.incrementoSize) || 0) : null,
            tamanioMaximo: tablespace.tamanioMaximo
        }),

    eliminarTablespace: (nombreTablespace, incluirContenido) =>
        api.post('/tablespace/eliminar', {
            nombreTablespace,
            incluirContenido
        }),

    compactarTablespace: (nombreTablespace, incluirContenido) =>
        api.post('/tablespace/compactar', {
            nombreTablespace,
            incluirContenido
        }),

    obtenerInformacion: () =>
        api.get('/tablespace/obtenerInformacion')
};

export const AuditoriaService = {
    obtenerEstadoAuditoria: async () => {
        try {
            const response = await api.get('auditoria/estado');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    configurarAuditoriaConexiones: async (config) => {
        try {
            const response = await api.post('auditoria/configurar/conexiones', config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    configurarAuditoriaTablas: async (config) => {
        try {
            const response = await api.post('auditoria/configurar/tablas', config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    configurarAuditoriaAcciones: async (config) => {
        try {
            const response = await api.post('auditoria/configurar/acciones', config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export const PerformanceService = {
    obtenerQueryPlan: async (request) => {
        try {
            const response = await api.post('performance/query-plan', request);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    crearIndice: async (request) => {
        try {
            const response = await api.post('performance/create-index', request);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};


export default api;