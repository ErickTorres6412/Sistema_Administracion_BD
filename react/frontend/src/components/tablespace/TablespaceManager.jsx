import { useEffect, useCallback, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FiDatabase, FiPlus, FiEdit2, FiTrash2, FiHardDrive, FiMinimize2 } from 'react-icons/fi';
import { tablespaceService } from '../../services/api';
import Swal from 'sweetalert2';

const TablespaceManager = () => {
    const [loading, setLoading] = useState({
        crear: false,
        modificar: false,
        eliminar: false,
        cargar: false,
        compactar: false
    });

    const [tablespaces, setTablespaces] = useState([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [formData, setFormData] = useState({
        nombreTablespace: '',
        ubicacionArchivo: '',
        tamanioInicial: '',
        tamanioMaximo: '',
        autoextend: false,
        incrementoSize: ''
    });

    const [editFormData, setEditFormData] = useState({
        nombreTablespace: '',
        autoextend: false,
        incrementoSize: '',
        tamanioMaximo: ''
    });

    // Funciones de alerta
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

    const cargarTablespaces = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, cargar: true }));
            const response = await tablespaceService.obtenerInformacion();
            if (response.data.resultado) {
                setTablespaces(response.data.tablespaces);
            }
        } catch (error) {
            console.error('Error al cargar tablespaces:', error);
            showErrorAlert('Error al cargar la información de tablespaces');
        } finally {
            setLoading(prev => ({ ...prev, cargar: false }));
        }
    }, []); // Dependencias vacías ya que no dependemos de variables externas
    
    // Ejecutar el efecto
    useEffect(() => {
        cargarTablespaces();
    }, [cargarTablespaces]); // Ahora se incluye como dependencia

    // Manejadores de eventos actualizados
    const handleCrearTablespace = async (e) => {
        e.preventDefault();
        if (!formData.nombreTablespace || !formData.ubicacionArchivo || !formData.tamanioInicial) {
            showWarningAlert('Por favor, complete todos los campos requeridos');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a crear un nuevo tablespace",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, crear tablespace',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, crear: true }));
                const response = await tablespaceService.crearTablespace(formData);

                if (response.data.resultado) {
                    showSuccessAlert('Tablespace creado exitosamente');
                    setFormData({
                        nombreTablespace: '',
                        ubicacionArchivo: '',
                        tamanioInicial: '',
                        tamanioMaximo: '',
                        autoextend: false,
                        incrementoSize: ''
                    });
                    cargarTablespaces();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al crear tablespace:', error);
            showErrorAlert(`Error al crear el tablespace: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, crear: false }));
        }
    };

    const handleEliminarTablespace = async (nombreTablespace) => {
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a eliminar el tablespace ${nombreTablespace}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, eliminar: true }));
                const response = await tablespaceService.eliminarTablespace(nombreTablespace, true);

                if (response.data.resultado) {
                    showSuccessAlert('Tablespace eliminado exitosamente');
                    cargarTablespaces();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al eliminar tablespace:', error);
            showErrorAlert(`Error al eliminar el tablespace: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, eliminar: false }));
        }
    };

    const handleModificarTablespace = async () => {
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a modificar el tablespace ${editFormData.nombreTablespace}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, modificar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, modificar: true }));
                const response = await tablespaceService.modificarTablespace({
                    nombreTablespace: editFormData.nombreTablespace,
                    autoextend: editFormData.autoextend,
                    incrementoSize: editFormData.incrementoSize ? Number(editFormData.incrementoSize) : 0,
                    tamanioMaximo: editFormData.tamanioMaximo ? Number(editFormData.tamanioMaximo) : 0
                });

                if (response.data.resultado) {
                    showSuccessAlert('Tablespace modificado exitosamente');
                    setModalEditar(false);
                    cargarTablespaces();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al modificar tablespace:', error);
            showErrorAlert(`Error al modificar el tablespace: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, modificar: false }));
        }
    };

    const handleCompactarTablespace = async (nombreTablespace) => {
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a compactar el tablespace ${nombreTablespace}. Esta operación puede tomar tiempo dependiendo del tamaño del tablespace.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, compactar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, compactar: true }));
                const response = await tablespaceService.compactarTablespace(nombreTablespace);

                if (response.data.resultado) {
                    showSuccessAlert('Tablespace compactado exitosamente');
                    cargarTablespaces();
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al compactar tablespace:', error);
            showErrorAlert(`Error al compactar el tablespace: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, compactar: false }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenEditModal = (tablespace) => {
        setEditFormData({
            nombreTablespace: tablespace.nombreTablespace,
            autoextend: tablespace.autoextend || false,
            incrementoSize: tablespace.incrementoSize || '',
            tamanioMaximo: tablespace.tamanioMaximo || ''
        });
        setModalEditar(true);
    };

    return (
        <>
            <h2 className="mb-4">Gestión de Tablespaces</h2>

            {/* Modal de Edición */}
            <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
                <ModalHeader toggle={() => setModalEditar(false)}>
                    Modificar Tablespace
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="nombreTablespace">Nombre del Tablespace</Label>
                            <Input
                                type="text"
                                name="nombreTablespace"
                                value={editFormData.nombreTablespace}
                                disabled
                                className="mb-3"
                            />
                        </FormGroup>
                        <FormGroup check className="mb-3">
                            <Label check>
                                <Input
                                    type="checkbox"
                                    name="autoextend"
                                    checked={editFormData.autoextend}
                                    onChange={handleEditInputChange}
                                />{' '}
                                Autoextend
                            </Label>
                        </FormGroup>
                        {editFormData.autoextend && (
                            <>
                                <FormGroup>
                                    <Label for="incrementoSize">Tamaño de Incremento (MB)</Label>
                                    <Input
                                        type="number"
                                        name="incrementoSize"
                                        value={editFormData.incrementoSize}
                                        onChange={handleEditInputChange}
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="tamanioMaximo">Tamaño Máximo (MB)</Label>
                                    <Input
                                        type="number"
                                        name="tamanioMaximo"
                                        value={editFormData.tamanioMaximo}
                                        onChange={handleEditInputChange}
                                        className="mb-3"
                                    />
                                </FormGroup>
                            </>
                        )}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => setModalEditar(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleModificarTablespace}
                        disabled={loading.modificar}
                    >
                        {loading.modificar ? 'Modificando...' : 'Guardar Cambios'}
                    </Button>
                </ModalFooter>
            </Modal>

            <Row>
                <Col lg={6} className="mb-4">
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiHardDrive className="me-2" />
                                Crear Nuevo Tablespace
                            </CardTitle>
                            <Form onSubmit={handleCrearTablespace}>
                                <FormGroup>
                                    <Label for="nombreTablespace">Nombre del Tablespace</Label>
                                    <Input
                                        type="text"
                                        name="nombreTablespace"
                                        id="nombreTablespace"
                                        value={formData.nombreTablespace}
                                        onChange={handleInputChange}
                                        placeholder="Ingrese nombre del tablespace"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="ubicacionArchivo">Ubicación del Archivo</Label>
                                    <Input
                                        type="text"
                                        name="ubicacionArchivo"
                                        id="ubicacionArchivo"
                                        value={formData.ubicacionArchivo}
                                        onChange={handleInputChange}
                                        placeholder="Ej: C:\ORACLE_FILES\PRUEBA.DBF"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="tamanioInicial">Tamaño Inicial (MB)</Label>
                                            <Input
                                                type="number"
                                                name="tamanioInicial"
                                                id="tamanioInicial"
                                                value={formData.tamanioInicial}
                                                onChange={handleInputChange}
                                                className="mb-3"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="tamanioMaximo">Tamaño Máximo (MB)</Label>
                                            <Input
                                                type="number"
                                                name="tamanioMaximo"
                                                id="tamanioMaximo"
                                                value={formData.tamanioMaximo}
                                                onChange={handleInputChange}
                                                className="mb-3"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup check className="mb-3">
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            name="autoextend"
                                            checked={formData.autoextend}
                                            onChange={handleInputChange}
                                        />{' '}
                                        Autoextend
                                    </Label>
                                </FormGroup>
                                {formData.autoextend && (
                                    <FormGroup>
                                        <Label for="incrementoSize">Tamaño de Incremento (MB)</Label>
                                        <Input
                                            type="number"
                                            name="incrementoSize"
                                            id="incrementoSize"
                                            value={formData.incrementoSize}
                                            onChange={handleInputChange}
                                            className="mb-3"
                                        />
                                    </FormGroup>
                                )}
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={loading.crear}
                                >
                                    <FiPlus className="me-2" />
                                    {loading.crear ? 'Creando...' : 'Crear Tablespace'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiDatabase className="me-2" />
                                Tablespaces Existentes
                            </CardTitle>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Estado</th>
                                            <th>Tamaño (MB)</th>
                                            <th>Libre (MB)</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tablespaces.map((ts) => (
                                            <tr key={ts.nombreTablespace}>
                                                <td>{ts.nombreTablespace}</td>
                                                <td>{ts.estado}</td>
                                                <td>{ts.tamanioActual.toFixed(2)}</td>
                                                <td>{ts.espacioLibre.toFixed(2)}</td>
                                                <td>
                                                    <Button
                                                        color="warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleOpenEditModal(ts)}
                                                        title="Editar tablespace"
                                                    >
                                                        <FiEdit2 />
                                                    </Button>
                                                    <Button
                                                        color="info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleCompactarTablespace(ts.nombreTablespace)}
                                                        disabled={loading.compactar}
                                                        title="Compactar tablespace"
                                                    >
                                                        <FiMinimize2 />
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => handleEliminarTablespace(ts.nombreTablespace)}
                                                        disabled={loading.eliminar}
                                                        title="Eliminar tablespace"
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

            </Row>
        </>
    );
};

export default TablespaceManager;