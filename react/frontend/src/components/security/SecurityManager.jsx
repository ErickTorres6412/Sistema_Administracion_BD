import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Table } from 'reactstrap';
import { FiUsers, FiUserPlus, FiEdit, FiTrash2, FiKey, FiShield, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { seguridadService } from '../../services/api';
import Swal from 'sweetalert2';

const SecurityManager = () => {
    const [loading, setLoading] = useState({
        create: false,
        modify: false,
        delete: false,
        list: false,
        privileges: false
    });

    const [usuarios, setUsuarios] = useState([]);
    const [privilegios, setPrivilegios] = useState([]);
    const [availablePrivileges, setAvailablePrivileges] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState([]);

    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombreUsuario: '',
        password: '',
        roles: []
    });

    const [nuevoRol, setNuevoRol] = useState({
        nombreRol: '',
        privilegios: []
    });

    const [modificarUsuario, setModificarUsuario] = useState({
        nombreUsuario: '',
        nuevoPassword: '',
        bloquear: false
    });

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: '¡Éxito!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#3085d6'
        });
    };
    
    const showErrorAlert = (message) => {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#3085d6'
        });
    };
    
    const showWarningAlert = (message) => {
        Swal.fire({
            title: 'Advertencia',
            text: message,
            icon: 'warning',
            confirmButtonColor: '#3085d6'
        });
    };
    
    const confirmAction = async (title, text) => {
        return Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
    };
    
    const cargarUsuarios = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, list: true }));
            const response = await seguridadService.listarUsuarios();
    
            if (response.data && response.data.resultado) {
                const listaUsuarios = response.data.usuarios || [];
                setUsuarios(listaUsuarios);
            } else {
                showErrorAlert('Error al cargar usuarios: ' + (response.data.errores?.join(', ') || 'Error desconocido'));
                setUsuarios([]);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            showErrorAlert('Error al cargar la lista de usuarios');
            setUsuarios([]);
        } finally {
            setLoading(prev => ({ ...prev, list: false }));
        }
    }, []);
    
    const cargarRoles = useCallback(async () => {
        try {
            const response = await seguridadService.listarRoles();
    
            if (response.data && response.data.resultado) {
                const listaRoles = response.data.roles || [];
                setRoles(listaRoles);
            } else {
                showErrorAlert('Error al cargar roles: ' + (response.data.errores?.join(', ') || 'Error desconocido'));
                setRoles([]);
            }
        } catch (error) {
            console.error('Error al cargar roles:', error);
            showErrorAlert('Error al cargar la lista de roles');
            setRoles([]);
        }
    }, []);
    
    const loadPrivileges = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, privileges: true }));
            const response = await seguridadService.obtenerPrivilegios();
    
            if (response.data.resultado) {
                const privilegios = response.data.privilegios.map(priv =>
                    typeof priv === 'object' ? priv.value : priv
                );
                setAvailablePrivileges(privilegios);
            } else {
                showErrorAlert(`Error al cargar privilegios: ${response.data.errores.join(', ')}`);
            }
        } catch (error) {
            console.error('Error al cargar privilegios:', error);
            showErrorAlert(`Error al cargar privilegios: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, privileges: false }));
        }
    }, []);
    
    useEffect(() => {
        cargarUsuarios();
        cargarRoles();
        loadPrivileges();
    }, [cargarUsuarios, cargarRoles, loadPrivileges]);
    
    const cargarPrivilegios = async (nombreUsuario) => {
        try {
            setLoading(prev => ({ ...prev, privileges: true }));
            const response = await seguridadService.listarPrivilegios(nombreUsuario);
    
            if (response.data && response.data.resultado) {
                setPrivilegios(response.data.privilegios);
                setSelectedUser(nombreUsuario);
            } else {
                showErrorAlert('Error al cargar privilegios: ' + (response.data.errores?.join(', ') || 'Error desconocido'));
                setPrivilegios([]);
            }
        } catch (error) {
            console.error('Error al cargar privilegios:', error);
            showErrorAlert('Error al cargar los privilegios');
            setPrivilegios([]);
        } finally {
            setLoading(prev => ({ ...prev, privileges: false }));
        }
    };
    
    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!nuevoRol.nombreRol.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del rol');
            return;
        }
    
        try {
            const result = await confirmAction('¿Está seguro?', 'Va a crear un nuevo rol');
            
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, create: true }));
                const response = await seguridadService.crearRol({
                    nombreRol: nuevoRol.nombreRol.trim(),
                    privilegios: nuevoRol.privilegios
                });
    
                if (response.data.resultado) {
                    showSuccessAlert('Rol creado exitosamente');
                    setNuevoRol({
                        nombreRol: '',
                        privilegios: []
                    });
                    cargarRoles();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al crear rol:', error);
            showErrorAlert(`Error al crear el rol: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, create: false }));
        }
    };
    
    const handleCreateUser = useCallback(async (e) => {
        e.preventDefault();
        if (!nuevoUsuario.nombreUsuario || !nuevoUsuario.password) {
            showWarningAlert('Por favor, complete todos los campos requeridos');
            return;
        }
    
        try {
            const result = await confirmAction('¿Está seguro?', 'Va a crear un nuevo usuario');
            
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, create: true }));
                const response = await seguridadService.crearUsuario(nuevoUsuario);
    
                if (response.data.resultado) {
                    showSuccessAlert('Usuario creado exitosamente');
                    setNuevoUsuario({
                        nombreUsuario: '',
                        password: '',
                        roles: []
                    });
                    cargarUsuarios();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            showErrorAlert(`Error al crear el usuario: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, create: false }));
        }
    }, [nuevoUsuario, cargarUsuarios]);
    
    const handleModifyUser = useCallback(async (e) => {
        e.preventDefault();
        if (!modificarUsuario.nombreUsuario) {
            showWarningAlert('Por favor, seleccione un usuario para modificar');
            return;
        }
    
        try {
            const result = await confirmAction('¿Está seguro?', 'Va a modificar este usuario');
            
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, modify: true }));
                const response = await seguridadService.modificarUsuario(modificarUsuario);
    
                if (response.data.resultado) {
                    showSuccessAlert('Usuario modificado exitosamente');
                    setModificarUsuario({ nombreUsuario: '', nuevoPassword: '', bloquear: false });
                    cargarUsuarios();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al modificar usuario:', error);
            showErrorAlert(`Error al modificar el usuario: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, modify: false }));
        }
    }, [modificarUsuario, cargarUsuarios]);
    
    const handleDeleteUser = useCallback(async (nombreUsuario, includeCascade = false) => {
        if (!nombreUsuario) return;
    
        try {
            const result = await confirmAction(
                '¿Está seguro?',
                '¿Desea eliminar este usuario? Esta acción no se puede deshacer'
            );
    
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, delete: true }));
                const response = await seguridadService.eliminarUsuario(nombreUsuario, includeCascade);
    
                if (response.data.resultado) {
                    showSuccessAlert('Usuario eliminado exitosamente');
                    cargarUsuarios();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showErrorAlert(`Error al eliminar el usuario: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
        }
    }, [cargarUsuarios]);

    const handleRoleChange = (roleName) => {
        setNuevoUsuario(prev => ({
            ...prev,
            roles: prev.roles.includes(roleName)
                ? prev.roles.filter(role => role !== roleName)
                : [...prev.roles, roleName]
        }));
    };

    const handlePrivilegiosChange = (selectedPrivilegios) => {
        setNuevoRol(prev => ({
            ...prev,
            privilegios: selectedPrivilegios
        }));
    };

    const scrollableContainerStyle = {
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid #dee2e6',
        borderRadius: '0.25rem',
        padding: '0.5rem',
        backgroundColor: '#f8f9fa',
        marginBottom: '0.5rem'
    };

    // Estilo para cada ítem en las listas
    const itemStyle = {
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s'
    };

    // Estilo para el último ítem (sin borde inferior)
    const lastItemStyle = {
        ...itemStyle,
        borderBottom: 'none'
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestión de Seguridad de Usuarios</h2>
                <Button
                    color="secondary"
                    size="sm"
                    onClick={loadPrivileges}
                    disabled={loading.privileges}
                >
                    <FiRefreshCw className={`me-2 ${loading.privileges ? 'spin' : ''}`} />
                    Actualizar Privilegios
                </Button>
            </div>

            <Row>
                {/* Panel de Usuarios */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <CardTitle tag="h5" className="mb-0">
                                    <FiUsers className="me-2" />
                                    Usuarios y Privilegios
                                </CardTitle>
                            </div>

                            {loading.list ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Usuario</th>
                                                <th style={{ width: '150px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(usuarios) && usuarios.length > 0 ? (
                                                usuarios.map((usuario, index) => (
                                                    <tr key={index}>
                                                        <td>{usuario.nombreUsuario}</td>
                                                        <td>
                                                            <Button
                                                                color="info"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => cargarPrivilegios(usuario.nombreUsuario)}
                                                                title="Ver privilegios"
                                                            >
                                                                <FiKey />
                                                            </Button>
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(usuario.nombreUsuario)}
                                                                disabled={loading.delete}
                                                                title="Eliminar usuario"
                                                            >
                                                                <FiTrash2 />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center text-muted">
                                                        No hay usuarios para mostrar
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {selectedUser && Array.isArray(privilegios) && privilegios.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="border-bottom pb-2">Privilegios de {selectedUser}</h6>
                                    <div className="table-responsive mt-3">
                                        <Table size="sm" bordered hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Privilegio</th>
                                                    <th style={{ width: '120px' }}>Admin Option</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {privilegios.map((privilegio, index) => (
                                                    <tr key={index}>
                                                        <td>{privilegio.nombrePrivilegio}</td>
                                                        <td className="text-center">
                                                            {privilegio.conAdmin ? 
                                                                <span className="badge bg-success">Sí</span> : 
                                                                <span className="badge bg-secondary">No</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>

                {/* Panel de Acciones */}
                <Col lg={4} className="mb-4">
                    <div className="accordion" id="accordionUserManagement">
                        {/* Crear Usuario */}
                        <Card className="mb-3 shadow-sm">
                            <CardBody>
                                <CardTitle tag="h5" className="d-flex align-items-center">
                                    <FiUserPlus className="me-2" />
                                    Crear Usuario
                                </CardTitle>
                                <Form onSubmit={handleCreateUser} className="mt-3">
                                    <FormGroup>
                                        <Label for="nombreUsuario">Nombre de Usuario</Label>
                                        <Input
                                            type="text"
                                            id="nombreUsuario"
                                            value={nuevoUsuario.nombreUsuario}
                                            onChange={(e) => setNuevoUsuario(prev => ({
                                                ...prev,
                                                nombreUsuario: e.target.value
                                            }))}
                                            placeholder="Ingrese nombre de usuario"
                                            className="mb-3"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Contraseña</Label>
                                        <Input
                                            type="password"
                                            id="password"
                                            value={nuevoUsuario.password}
                                            onChange={(e) => setNuevoUsuario(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))}
                                            placeholder="Ingrese contraseña"
                                            className="mb-3"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="roles">Roles</Label>
                                        <div style={scrollableContainerStyle}>
                                            {roles.length === 0 ? (
                                                <div className="text-muted">Cargando roles...</div>
                                            ) : (
                                                roles.map((rol, index) => (
                                                    <div
                                                        key={rol.nombreRol}
                                                        style={index === roles.length - 1 ? lastItemStyle : itemStyle}
                                                        className="form-check"
                                                    >
                                                        <Input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`role-${rol.nombreRol}`}
                                                            checked={nuevoUsuario.roles.includes(rol.nombreRol)}
                                                            onChange={() => handleRoleChange(rol.nombreRol)}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            for={`role-${rol.nombreRol}`}
                                                        >
                                                            {rol.nombreRol}
                                                        </Label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {nuevoUsuario.roles.length > 0 && (
                                            <small className="text-muted d-block mt-2">
                                                Roles seleccionados: {nuevoUsuario.roles.length}
                                            </small>
                                        )}
                                    </FormGroup>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="w-100"
                                        disabled={loading.create}
                                    >
                                        <FiUserPlus className="me-2" />
                                        {loading.create ? 'Creando...' : 'Crear Usuario'}
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>

                        {/* Modificar Usuario */}
                        <Card className="mb-3 shadow-sm">
                            <CardBody>
                                <CardTitle tag="h5" className="d-flex align-items-center">
                                    <FiEdit className="me-2" />
                                    Modificar Usuario
                                </CardTitle>
                                <Form onSubmit={handleModifyUser} className="mt-3">
                                    <FormGroup>
                                        <Label for="modifyUserName">Usuario a Modificar</Label>
                                        <Input
                                            type="text"
                                            id="modifyUserName"
                                            value={modificarUsuario.nombreUsuario}
                                            onChange={(e) => setModificarUsuario(prev => ({
                                                ...prev,
                                                nombreUsuario: e.target.value
                                            }))}
                                            placeholder="Nombre del usuario"
                                            className="mb-3"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="newPassword">Nueva Contraseña (opcional)</Label>
                                        <Input
                                            type="password"
                                            id="newPassword"
                                            value={modificarUsuario.nuevoPassword}
                                            onChange={(e) => setModificarUsuario(prev => ({
                                                ...prev,
                                                nuevoPassword: e.target.value
                                            }))}
                                            placeholder="Nueva contraseña"
                                            className="mb-3"
                                        />
                                    </FormGroup>
                                    <FormGroup check className="mb-3">
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={modificarUsuario.bloquear}
                                                onChange={(e) => setModificarUsuario(prev => ({
                                                    ...prev,
                                                    bloquear: e.target.checked
                                                }))}
                                            />{' '}
                                            Bloquear usuario
                                        </Label>
                                    </FormGroup>
                                    <Button
                                        type="submit"
                                        color="warning"
                                        className="w-100"
                                        disabled={loading.modify}
                                    >
                                        <FiEdit className="me-2" />
                                        {loading.modify ? 'Modificando...' : 'Modificar Usuario'}
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>

                        {/* Crear Rol */}
                        <Card className="shadow-sm">
                            <CardBody>
                                <CardTitle tag="h5" className="d-flex align-items-center">
                                    <FiShield className="me-2" />
                                    Crear Nuevo Rol
                                </CardTitle>
                                <Form onSubmit={handleCreateRole} className="mt-3">
                                    <FormGroup>
                                        <Label for="nombreRol">Nombre del Rol</Label>
                                        <Input
                                            type="text"
                                            id="nombreRol"
                                            value={nuevoRol.nombreRol}
                                            onChange={(e) => setNuevoRol(prev => ({
                                                ...prev,
                                                nombreRol: e.target.value
                                            }))}
                                            placeholder="Ingrese nombre del rol"
                                            className="mb-3"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="privilegios">Privilegios</Label>
                                        <div style={scrollableContainerStyle}>
                                            {availablePrivileges.length === 0 ? (
                                                <div className="text-muted">Cargando privilegios...</div>
                                            ) : (
                                                availablePrivileges.map((privilegio, index) => (
                                                    <div
                                                        key={privilegio}
                                                        style={index === availablePrivileges.length - 1 ? lastItemStyle : itemStyle}
                                                        className="form-check"
                                                    >
                                                        <Input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`privilegio-${privilegio}`}
                                                            checked={nuevoRol.privilegios.includes(privilegio)}
                                                            onChange={() => {
                                                                const updatedPrivilegios = nuevoRol.privilegios.includes(privilegio)
                                                                    ? nuevoRol.privilegios.filter(p => p !== privilegio)
                                                                    : [...nuevoRol.privilegios, privilegio];
                                                                handlePrivilegiosChange(updatedPrivilegios);
                                                            }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            for={`privilegio-${privilegio}`}
                                                        >
                                                            {privilegio}
                                                        </Label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {nuevoRol.privilegios.length > 0 && (
                                            <small className="text-muted d-block mt-2">
                                                Privilegios seleccionados: {nuevoRol.privilegios.length}
                                            </small>
                                        )}
                                    </FormGroup>

                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="w-100"
                                        disabled={loading.create || loading.privileges}
                                    >
                                        <FiPlus className="me-2" />
                                        {loading.create ? 'Creando...' : 'Crear Rol'}
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default SecurityManager;