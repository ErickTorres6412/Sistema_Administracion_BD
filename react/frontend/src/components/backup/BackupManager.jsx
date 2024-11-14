import React, { useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FiDatabase, FiPlus, FiUpload, FiDownload } from 'react-icons/fi';
import { respaldoService } from '../../services/api';
import Swal from 'sweetalert2';

const BackupManager = () => {
    const [loading, setLoading] = useState({
        schema: false,
        table: false,
        full: false
    });

    const [schemaName, setSchemaName] = useState('');
    const [tableName, setTableName] = useState('');

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: '¡Éxito!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
    };

    const showErrorAlert = (message) => {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
    };

    const showWarningAlert = (message) => {
        Swal.fire({
            title: '¡Atención!',
            text: message,
            icon: 'warning',
            confirmButtonColor: '#f8bb86',
            confirmButtonText: 'OK'
        });
    };

    const handleSchemaBackup = async (e) => {
        e.preventDefault();
        if (!schemaName.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del schema');
            return;
        }
    
        try {
            // Mostrar alerta de confirmación antes de proceder
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a generar un respaldo del schema especificado",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, generar respaldo',
                cancelButtonText: 'Cancelar'
            });
    
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, schema: true }));
                const response = await respaldoService.generarRespaldoSchema(schemaName.trim());
                
                if (response.data.resultado) {
                    showSuccessAlert('Respaldo de schema generado exitosamente');
                    setSchemaName('');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al generar respaldo:', error);
            showErrorAlert(`Error al generar el respaldo: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, schema: false }));
        }
    };
    
    const handleTableBackup = async (e) => {
        e.preventDefault();
        if (!schemaName.trim() || !tableName.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del schema y la tabla');
            return;
        }
    
        try {
            // Mostrar alerta de confirmación antes de proceder
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a generar un respaldo de la tabla especificada",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, generar respaldo',
                cancelButtonText: 'Cancelar'
            });
    
            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, table: true }));
                const response = await respaldoService.generarRespaldoTabla(
                    schemaName.trim(),
                    tableName.trim()
                );
                
                if (response.data.resultado) {
                    showSuccessAlert('Respaldo de tabla generado exitosamente');
                    setTableName('');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al generar respaldo:', error);
            showErrorAlert(`Error al generar el respaldo: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    };    

    const handleFullBackup = async (e) => {
        e.preventDefault();
        try {
            // Mostrar alerta de confirmación antes de proceder
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a generar un respaldo completo de la base de datos",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, generar respaldo',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, full: true }));
                const response = await respaldoService.generarRespaldoCompleto();
                
                if (response.data.resultado) {
                    showSuccessAlert('Respaldo completo generado exitosamente');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al generar respaldo completo:', error);
            showErrorAlert(`Error al generar el respaldo: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, full: false }));
        }
    };

    const handleImportSchema = async (e) => {
        e.preventDefault();
        if (!schemaName.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del schema a importar');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a importar el schema ${schemaName}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, import: true }));
                const response = await respaldoService.importarRespaldoSchema(schemaName.trim());
                
                if (response.data.resultado) {
                    showSuccessAlert('Schema importado exitosamente');
                    setSchemaName('');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al importar schema:', error);
            showErrorAlert(`Error al importar el schema: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, import: false }));
        }
    };

    const handleImportTable = async (e) => {
        e.preventDefault();
        if (!schemaName.trim() || !tableName.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del schema y la tabla');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a importar la tabla ${tableName} del schema ${schemaName}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, importTable: true }));
                const response = await respaldoService.importarRespaldoTabla({
                    nombreSchema: schemaName.trim(),
                    nombreTabla: tableName.trim()
                });
                
                if (response.data.resultado) {
                    showSuccessAlert('Tabla importada exitosamente');
                    setSchemaName('');
                    setTableName('');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al importar tabla:', error);
            showErrorAlert(`Error al importar la tabla: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, importTable: false }));
        }
    };

    const handleImportFull = async (e) => {
        e.preventDefault();
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a importar un respaldo completo de la base de datos. Esta operación puede tomar varios minutos.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, importFull: true }));
                const response = await respaldoService.importarRespaldoCompleto();
                
                if (response.data.resultado) {
                    showSuccessAlert('Base de datos importada exitosamente');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al importar la base de datos:', error);
            showErrorAlert(`Error al importar la base de datos: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, importFull: false }));
        }
    };

    return (
        <>
            <h2 className="mb-4">Gestión de Respaldos</h2>

            <Row>
                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiDatabase className="me-2" />
                                Respaldo por Schema
                            </CardTitle>
                            <CardText>
                                Crea respaldos individuales por cada schema de la base de datos.
                            </CardText>
                            <Form onSubmit={handleSchemaBackup}>
                                <FormGroup>
                                    <Label for="schemaName">Nombre del Schema</Label>
                                    <Input
                                        type="text"
                                        id="schemaName"
                                        value={schemaName}
                                        onChange={(e) => setSchemaName(e.target.value)}
                                        placeholder="Ingrese nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button 
                                    type="submit"
                                    color="primary"
                                    disabled={loading.schema}
                                >
                                    <FiPlus className="me-2" />
                                    {loading.schema ? 'Creando...' : 'Crear Respaldo'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiDatabase className="me-2" />
                                Respaldo por Tabla
                            </CardTitle>
                            <CardText>
                                Realiza respaldos selectivos por tablas específicas.
                            </CardText>
                            <Form onSubmit={handleTableBackup}>
                                <FormGroup>
                                    <Label for="tableSchemaName">Nombre del Schema</Label>
                                    <Input
                                        type="text"
                                        id="tableSchemaName"
                                        value={schemaName}
                                        onChange={(e) => setSchemaName(e.target.value)}
                                        placeholder="Ingrese nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="tableName">Nombre de la Tabla</Label>
                                    <Input
                                        type="text"
                                        id="tableName"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        placeholder="Ingrese nombre de la tabla"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button 
                                    type="submit"
                                    color="primary"
                                    disabled={loading.table}
                                >
                                    <FiPlus className="me-2" />
                                    {loading.table ? 'Creando...' : 'Crear Respaldo'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiDatabase className="me-2" />
                                Respaldo Completo
                            </CardTitle>
                            <CardText>
                                Genera un respaldo completo de toda la base de datos.
                            </CardText>
                            <Form onSubmit={handleFullBackup}>
                                <Button 
                                    type="submit"
                                    color="primary"
                                    disabled={loading.full}
                                    className="w-100"
                                >
                                    <FiDownload className="me-2" />
                                    {loading.full ? 'Generando...' : 'Generar Respaldo Completo'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiUpload className="me-2" />
                                Importar Schema
                            </CardTitle>
                            <CardText>
                                Importa un respaldo existente de un schema específico.
                            </CardText>
                            <Form onSubmit={handleImportSchema}>
                                <FormGroup>
                                    <Label for="importSchemaName">Nombre del Schema</Label>
                                    <Input
                                        type="text"
                                        id="importSchemaName"
                                        value={schemaName}
                                        onChange={(e) => setSchemaName(e.target.value)}
                                        placeholder="Ingrese nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button 
                                    type="submit"
                                    color="success"
                                    disabled={loading.import}
                                >
                                    <FiUpload className="me-2" />
                                    {loading.import ? 'Importando...' : 'Importar Schema'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                 {/* Nueva card para importar tabla */}
                 <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiUpload className="me-2" />
                                Importar Tabla
                            </CardTitle>
                            <CardText>
                                Importa un respaldo existente de una tabla específica.
                            </CardText>
                            <Form onSubmit={handleImportTable}>
                                <FormGroup>
                                    <Label for="importTableSchemaName">Nombre del Schema</Label>
                                    <Input
                                        type="text"
                                        id="importTableSchemaName"
                                        value={schemaName}
                                        onChange={(e) => setSchemaName(e.target.value)}
                                        placeholder="Ingrese nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="importTableName">Nombre de la Tabla</Label>
                                    <Input
                                        type="text"
                                        id="importTableName"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        placeholder="Ingrese nombre de la tabla"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button 
                                    type="submit"
                                    color="success"
                                    disabled={loading.importTable}
                                >
                                    <FiUpload className="me-2" />
                                    {loading.importTable ? 'Importando...' : 'Importar Tabla'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                {/* Nueva card para importar respaldo completo */}
                <Col lg={4} md={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiUpload className="me-2" />
                                Importar Base de Datos Completa
                            </CardTitle>
                            <CardText>
                                Importa un respaldo completo de la base de datos.
                            </CardText>
                            <Form onSubmit={handleImportFull}>
                                <Button 
                                    type="submit"
                                    color="success"
                                    disabled={loading.importFull}
                                    className="w-100"
                                >
                                    <FiUpload className="me-2" />
                                    {loading.importFull ? 'Importando...' : 'Importar Base de Datos Completa'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

            </Row>
        </>
    );
};

export default BackupManager;