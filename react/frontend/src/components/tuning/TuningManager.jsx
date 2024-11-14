import React, { useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';
import { tuningService } from '../../services/api';
import Swal from 'sweetalert2';

const TuningManager = () => {
    const [loading, setLoading] = useState({
        analysis: false,
        statistics: false
    });

    const [formData, setFormData] = useState({
        sqlQuery: '',
        schema: '',
        tabla: ''
    });

    const [results, setResults] = useState({
        planEjecucion: '',
        estadisticas: null,
        recomendaciones: []
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

    const handleAnalyzeQuery = async (e) => {
        e.preventDefault();
        if (!formData.sqlQuery.trim()) {
            showWarningAlert('Por favor, ingrese una consulta SQL');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Va a analizar la consulta SQL especificada",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, analizar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, analysis: true }));
                const response = await tuningService.analizarConsulta(
                    formData.sqlQuery.trim(),
                    formData.schema.trim()
                );

                if (response.data.resultado) {
                    setResults({
                        planEjecucion: response.data.planEjecucion,
                        estadisticas: response.data.estadisticas,
                        recomendaciones: response.data.recomendacionesOptimizacion
                    });
                    showSuccessAlert('Análisis completado exitosamente');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al analizar consulta:', error);
            showErrorAlert(`Error en el análisis: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, analysis: false }));
        }
    };

    const handleGetStatistics = async (e) => {
        e.preventDefault();
        if (!formData.schema.trim() || !formData.tabla.trim()) {
            showWarningAlert('Por favor, ingrese el nombre del schema y la tabla');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: `Va a obtener las estadísticas de la tabla ${formData.tabla} del schema ${formData.schema}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, obtener estadísticas',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                setLoading(prev => ({ ...prev, statistics: true }));
                const response = await tuningService.obtenerEstadisticasTabla(
                    formData.schema.trim(),
                    formData.tabla.trim()
                );

                if (response.data.resultado) {
                    setResults(prev => ({
                        ...prev,
                        estadisticas: response.data.estadisticas
                    }));
                    showSuccessAlert('Estadísticas obtenidas exitosamente');
                } else {
                    showErrorAlert(`Error: ${response.data.errores.join(', ')}`);
                }
            }
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            showErrorAlert(`Error al obtener estadísticas: ${error.response?.data?.errores?.join(', ') || error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, statistics: false }));
        }
    };

    return (
        <>
            <h2 className="mb-4">Análisis y Tuning de Consultas</h2>

            <Row>
                <Col lg={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiSearch className="me-2" />
                                Análisis de Consulta SQL
                            </CardTitle>
                            <CardText>
                                Analiza el plan de ejecución y obtén recomendaciones de optimización.
                            </CardText>
                            <Form onSubmit={handleAnalyzeQuery}>
                                <FormGroup>
                                    <Label for="sqlQuery">Consulta SQL</Label>
                                    <Input
                                        type="textarea"
                                        id="sqlQuery"
                                        value={formData.sqlQuery}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sqlQuery: e.target.value }))}
                                        placeholder="Ingrese su consulta SQL"
                                        rows="4"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="schemaName">Schema</Label>
                                    <Input
                                        type="text"
                                        id="schemaName"
                                        value={formData.schema}
                                        onChange={(e) => setFormData(prev => ({ ...prev, schema: e.target.value }))}
                                        placeholder="Ingrese el nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={loading.analysis}
                                >
                                    <FiSearch className="me-2" />
                                    {loading.analysis ? 'Analizando...' : 'Analizar Consulta'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardTitle tag="h5">
                                <FiBarChart2 className="me-2" />
                                Estadísticas de Tabla
                            </CardTitle>
                            <CardText>
                                Obtén estadísticas detalladas de una tabla específica.
                            </CardText>
                            <Form onSubmit={handleGetStatistics}>
                                <FormGroup>
                                    <Label for="statsSchemaName">Schema</Label>
                                    <Input
                                        type="text"
                                        id="statsSchemaName"
                                        value={formData.schema}
                                        onChange={(e) => setFormData(prev => ({ ...prev, schema: e.target.value }))}
                                        placeholder="Ingrese el nombre del schema"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="tableName">Tabla</Label>
                                    <Input
                                        type="text"
                                        id="tableName"
                                        value={formData.tabla}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tabla: e.target.value }))}
                                        placeholder="Ingrese el nombre de la tabla"
                                        className="mb-3"
                                    />
                                </FormGroup>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={loading.statistics}
                                >
                                    <FiBarChart2 className="me-2" />
                                    {loading.statistics ? 'Obteniendo...' : 'Obtener Estadísticas'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {(results.planEjecucion || results.estadisticas || results.recomendaciones.length > 0) && (
                <Row>
                    <Col xs={12}>
                        <Card className="mb-4">
                            <CardBody>
                                <CardTitle tag="h5">Resultados del Análisis</CardTitle>

                                {results.planEjecucion && (
                                    <div className="mb-4">
                                        <h6>Plan de Ejecución:</h6>
                                        <pre className="bg-light p-3 rounded">
                                            {results.planEjecucion}
                                        </pre>
                                    </div>
                                )}

                                {results.estadisticas && (
                                    <div className="mb-4">
                                        <h6>Estadísticas:</h6>
                                        <ul className="list-unstyled">
                                            {Object.entries(results.estadisticas).map(([key, value]) => (
                                                <li key={key}>
                                                    <strong>{key}:</strong> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {results.recomendaciones.length > 0 && (
                                    <div>
                                        <h6>Recomendaciones de Optimización:</h6>
                                        <ul>
                                            {results.recomendaciones.map((rec, index) => (
                                                <li key={index}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default TuningManager;