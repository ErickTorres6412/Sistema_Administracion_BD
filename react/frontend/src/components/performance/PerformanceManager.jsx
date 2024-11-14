import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardTitle,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert,
    Form,
    FormGroup,
    Label,
    Input,
    Table,
    Row,
    Col,
} from 'reactstrap';
import { FiTable, FiSave } from 'react-icons/fi';
import { PerformanceService } from '../../services/api';

const PerformanceManager = () => {
    // Query Plan state
    const [queryPlanError, setQueryPlanError] = useState(null);
    const [queryPlanSuccess, setQueryPlanSuccess] = useState(false);
    const [queryPlanModal, setQueryPlanModal] = useState(false);
    const [queryPlanFormModal, setQueryPlanFormModal] = useState(false);
    const [queryPlanLoading, setQueryPlanLoading] = useState(false);
    const [queryPlanRequest, setQueryPlanRequest] = useState({
        consultaSQL: '',
        nombreTabla: '',
    });
    const [queryPlanResponse, setQueryPlanResponse] = useState(null);

    // Create Index state
    const [indexError, setIndexError] = useState(null);
    const [indexSuccess, setIndexSuccess] = useState(false);
    const [indexModal, setIndexModal] = useState(false);
    const [indexLoading, setIndexLoading] = useState(false);
    const [indexRequest, setIndexRequest] = useState(null); // Inicialmente null
    const [createIndexResponse, setCreateIndexResponse] = useState(null);


    const handleQueryPlanRequest = async (formData) => {
        setQueryPlanLoading(true);
        try {
            const response = await PerformanceService.obtenerQueryPlan(formData);
            setQueryPlanResponse(response);
            if (response.exitoso) {
                setQueryPlanSuccess(true);
                setQueryPlanError(null);
                setQueryPlanFormModal(false);
                setQueryPlanModal(true);
            } else {
                setQueryPlanError(response.mensaje);
                setQueryPlanSuccess(false);
            }
        } catch (err) {
            setQueryPlanError(err.message);
            setQueryPlanSuccess(false);
        } finally {
            setQueryPlanLoading(false);
        }
    };

    const handleCreateIndex = async (formData) => {
        // Validar que los campos requeridos no estén vacíos
        if (!formData.nombreTabla || !formData.nombreIndice || !formData.columnas.length) {
            setIndexError('Todos los campos son requeridos');
            return;
        }

        setIndexLoading(true);
        try {
            const response = await PerformanceService.crearIndice(formData);
            if (response.exitoso) {
                setIndexSuccess(true);
                setIndexError(null);
                setCreateIndexResponse(response); // Solo guardamos la respuesta si es exitosa
            } else {
                setIndexError(response.mensaje);
                setIndexSuccess(false);
                setCreateIndexResponse(null); // Limpiamos la respuesta si hay error
            }
        } catch (err) {
            setIndexError(err.message);
            setIndexSuccess(false);
            setCreateIndexResponse(null);
        } finally {
            setIndexLoading(false);
        }
    };

    const handleCloseIndexModal = () => {
        setIndexModal(false);
        setIndexError(null);
        setIndexSuccess(false);
        setCreateIndexResponse(null);
        setIndexRequest(null);
    };

    return (
        <Row>
            {/* Query Plan Card */}
            <Col lg={6} md={6} className="mb-4">
                <Card className="h-100">
                    <CardBody>
                        <CardTitle tag="h5">
                            <FiTable className="me-2" />
                            Obtener Plan de Consulta SQL
                        </CardTitle>
                        <Button
                            color="primary"
                            onClick={() => setQueryPlanFormModal(true)}
                            className="mt-3"
                            disabled={queryPlanLoading}
                        >
                            Generar Plan de Consulta
                        </Button>
                        <QueryPlanFormModal
                            isOpen={queryPlanFormModal}
                            toggle={() => setQueryPlanFormModal(false)}
                            onSubmit={handleQueryPlanRequest}
                        />
                        <QueryPlanModal
                            isOpen={queryPlanModal}
                            toggle={() => setQueryPlanModal(false)}
                            queryPlanResponse={queryPlanResponse}
                        />
                        {queryPlanError && (
                            <Alert color="danger" className="mt-4">
                                {queryPlanError}
                            </Alert>
                        )}
                        {queryPlanSuccess && (
                            <Alert color="success" className="mt-4">
                                Plan de consulta generado exitosamente
                            </Alert>
                        )}
                    </CardBody>
                </Card>
            </Col>
    
            {/* Create Index Card */}
            <Col lg={6} md={6} className="mb-4">
                <Card className="h-100">
                    <CardBody>
                        <CardTitle tag="h5">
                            <FiTable className="me-2" />
                            Crear Índice en Tabla
                        </CardTitle>
                        <Button
                            color="primary"
                            onClick={() => setIndexModal(true)}
                            className="mt-3"
                            disabled={indexLoading}
                        >
                            Crear Nuevo Índice
                        </Button>
                        <CreateIndexModal
                            isOpen={indexModal}
                            toggle={handleCloseIndexModal}
                            createIndexResponse={createIndexResponse}
                            onCreateIndex={handleCreateIndex}
                            loading={indexLoading}
                            error={indexError}
                            success={indexSuccess}
                        />
                        {indexError && !indexModal && (
                            <Alert color="danger" className="mt-4">
                                {indexError}
                            </Alert>
                        )}
                        {indexSuccess && !indexModal && (
                            <Alert color="success" className="mt-4">
                                Índice creado exitosamente
                            </Alert>
                        )}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );    
};

const QueryPlanFormModal = ({ isOpen, toggle, onSubmit }) => {
    const [consultaSQL, setConsultaSQL] = useState('');
    const [nombreTabla, setNombreTabla] = useState('');

    const handleSubmit = () => {
        onSubmit({
            consultaSQL,
            nombreTabla
        });
    };

    useEffect(() => {
        if (!isOpen) {
            setConsultaSQL('');
            setNombreTabla('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Generar Plan de Consulta</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="consultaSQL">Consulta SQL</Label>
                        <Input
                            type="textarea"
                            id="consultaSQL"
                            value={consultaSQL}
                            onChange={(e) => setConsultaSQL(e.target.value)}
                            placeholder="SELECT * FROM tabla WHERE..."
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="nombreTabla">Nombre de Tabla</Label>
                        <Input
                            type="text"
                            id="nombreTabla"
                            value={nombreTabla}
                            onChange={(e) => setNombreTabla(e.target.value)}
                            placeholder="Nombre de la tabla"
                        />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancelar
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                    Generar Plan
                </Button>
            </ModalFooter>
        </Modal>
    );
};
// Primero definimos el QueryPlanModal
const QueryPlanModal = ({ isOpen, toggle, queryPlanResponse }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Plan de Ejecución de Consulta SQL</ModalHeader>
            <ModalBody>
                {queryPlanResponse && (
                    <>
                        <h5>Operaciones</h5>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nivel</th>
                                    <th>Tipo de Operación</th>
                                    <th>Opciones</th>
                                    <th>Objeto Accedido</th>
                                    <th>Filas</th>
                                    <th>Bytes</th>
                                    <th>Costo</th>
                                    <th>Costo CPU</th>
                                    <th>Tiempo Estimado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queryPlanResponse.operaciones?.map((operacion) => (
                                    <tr key={operacion.id}>
                                        <td>{operacion.id}</td>
                                        <td>{operacion.nivel}</td>
                                        <td>{operacion.tipoOperacion}</td>
                                        <td>{operacion.opcionesOperacion}</td>
                                        <td>{operacion.objetoAccedido}</td>
                                        <td>{operacion.filas}</td>
                                        <td>{operacion.bytes}</td>
                                        <td>{operacion.costo}</td>
                                        <td>{operacion.costoCPU}</td>
                                        <td>{operacion.tiempoEstimado}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <h5>Estadísticas</h5>
                        <Row>
                            <Col md={6}>
                                <strong>Costo Total:</strong> {queryPlanResponse.estadisticas?.costoTotal}
                            </Col>
                            <Col md={6}>
                                <strong>Tiempo Estimado:</strong>{' '}
                                {queryPlanResponse.estadisticas?.tiempoEstimado}
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <strong>Filas Totales:</strong>{' '}
                                {queryPlanResponse.estadisticas?.filasTotales}
                            </Col>
                            <Col md={6}>
                                <strong>Plan Hash Value:</strong>{' '}
                                {queryPlanResponse.estadisticas?.planHashValue}
                            </Col>
                        </Row>
                        {queryPlanResponse.estadisticas?.predicateInformation && (
                            <>
                                <h5>Información de Predicados</h5>
                                <ul>
                                    {queryPlanResponse.estadisticas.predicateInformation.map((predicate, index) => (
                                        <li key={index}>{predicate}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
};
const CreateIndexModal = ({ isOpen, toggle, createIndexResponse, onCreateIndex, loading, error, success }) => {
    const initialState = {
        nombreTabla: '',
        nombreIndice: '',
        columnas: '',
        esUnico: false
    };

    const [formData, setFormData] = useState(initialState);

    // Limpiar el formulario cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialState);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar campos requeridos
        if (!formData.nombreTabla || !formData.nombreIndice || !formData.columnas) {
            return;
        }

        const columnasArray = formData.columnas
            .split(',')
            .map(col => col.trim())
            .filter(col => col !== '');

        onCreateIndex({
            nombreTabla: formData.nombreTabla,
            nombreIndice: formData.nombreIndice,
            columnas: columnasArray,
            unico: formData.esUnico,
        });
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <Form onSubmit={handleSubmit}>
                <ModalHeader toggle={toggle}>Crear Nuevo Índice</ModalHeader>
                <ModalBody>
                    {error && (
                        <Alert color="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert color="success" className="mb-4">
                            Índice creado exitosamente
                        </Alert>
                    )}

                    <FormGroup>
                        <Label for="nombreTabla">Nombre de Tabla *</Label>
                        <Input
                            type="text"
                            id="nombreTabla"
                            value={formData.nombreTabla}
                            onChange={(e) => setFormData({ ...formData, nombreTabla: e.target.value })}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="nombreIndice">Nombre de Índice *</Label>
                        <Input
                            type="text"
                            id="nombreIndice"
                            value={formData.nombreIndice}
                            onChange={(e) => setFormData({ ...formData, nombreIndice: e.target.value })}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="columnas">Columnas * (separadas por comas)</Label>
                        <Input
                            type="text"
                            id="columnas"
                            value={formData.columnas}
                            onChange={(e) => setFormData({ ...formData, columnas: e.target.value })}
                            placeholder="Ejemplo: NOMBRE, FECHA"
                            required
                        />
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                checked={formData.esUnico}
                                onChange={(e) => setFormData({ ...formData, esUnico: e.target.checked })}
                            />{' '}
                            ¿Índice único?
                        </Label>
                    </FormGroup>


                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle} disabled={loading}>
                        {success ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!success && (
                        <Button color="primary" type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Índice'}
                        </Button>
                    )}
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default PerformanceManager;