import React, { useState, useEffect } from "react";
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
    Collapse,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from "reactstrap";
import { FiDatabase, FiSave, FiChevronDown, FiTable, FiList, FiUsers, FiActivity } from "react-icons/fi";
import { SessionAudit } from './SessionAudit';
import { TableAudit } from './TableAudit';
import { ActionAudit } from './ActionAudit';
import { AuditoriaService } from "../../services/api";

import 'bootstrap/dist/css/bootstrap.min.css';

const TABLE_AUDIT_ACTIONS = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "EXECUTE",
    "ALTER",
    "GRANT",
    "RENAME",
];
const AUDIT_ACTIONS = {
    usuarios: {
        title: "Usuarios",
        actions: ["CREATE USER", "ALTER USER", "DROP USER"],
    },
    roles: {
        title: "Roles",
        actions: [
            "CREATE ROLE",
            "ALTER ANY ROLE",
            "DROP ANY ROLE",
            "GRANT ANY ROLE",
        ],
    },
    tablas: {
        title: "Tablas",
        actions: [
            "CREATE TABLE",
            "CREATE ANY TABLE",
            "ALTER TABLE",
            "ALTER ANY TABLE",
            "DROP ANY TABLE",
        ],
    },
    indices: {
        title: "Índices",
        actions: ["CREATE ANY INDEX", "ALTER ANY INDEX", "DROP ANY INDEX"],
    },
    vistas: {
        title: "Vistas",
        actions: ["CREATE VIEW", "CREATE ANY VIEW", "DROP ANY VIEW"],
    },
    procedimientos: {
        title: "Procedimientos",
        actions: [
            "CREATE PROCEDURE",
            "CREATE ANY PROCEDURE",
            "ALTER ANY PROCEDURE",
            "DROP ANY PROCEDURE",
        ],
    },
    secuencias: {
        title: "Secuencias",
        actions: [
            "CREATE SEQUENCE",
            "CREATE ANY SEQUENCE",
            "ALTER ANY SEQUENCE",
            "DROP ANY SEQUENCE",
        ],
    },
};

const AuditManager = () => {
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [actionConfig, setActionConfig] = useState({});
    const [openSections, setOpenSections] = useState({});
    const [configConexiones, setConfigConexiones] = useState({
        registrarExitosos: false,
        registrarFallidos: false,
    });
    const [tableModal, setTableModal] = useState(false);
    const [tableConfigs, setTableConfigs] = useState([]);
    const [activeTab, setActiveTab] = useState('config');
    const [newTableConfig, setNewTableConfig] = useState({
        nombreTabla: "",
        configuraciones: TABLE_AUDIT_ACTIONS.map((action) => ({
            accion: action,
            auditar: false,
        })),
    });
    useEffect(() => {
        loadAuditState();
        loadTableAuditConfigs();
    }, []);

    // Función para cambiar de pestaña
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    const loadAuditState = async () => {
        try {
            const response = await AuditoriaService.obtenerEstadoAuditoria();
            if (response.data?.configuracionesAcciones) {
                const config = {};
                response.data.configuracionesAcciones.forEach(({ accion, auditar }) => {
                    config[accion] = auditar;
                });
                setActionConfig(config);
            } else {
                const initialConfig = {};
                Object.values(AUDIT_ACTIONS).forEach((category) => {
                    category.actions.forEach((action) => {
                        initialConfig[action] = false;
                    });
                });
                setActionConfig(initialConfig);
            }

            // Cargar configuración de conexiones
            if (response.data?.configConexiones) {
                setConfigConexiones({
                    registrarExitosos:
                        response.data.configConexiones.registrarExitosos || true,
                    registrarFallidos:
                        response.data.configConexiones.registrarFallidos || true,
                });
            }
        } catch (err) {
            setError("Error al cargar la configuración de auditoría");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const configuraciones = Object.entries(actionConfig).map(
                ([accion, auditar]) => ({
                    accion,
                    auditar,
                })
            );

            await AuditoriaService.configurarAuditoriaAcciones({ configuraciones });
            setSuccess(true);
            setModal(false);
        } catch (err) {
            setError("Error al guardar la configuración de auditoría");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await AuditoriaService.configurarAuditoriaConexiones({
                configConexiones,
            });
            setSuccess(true);
        } catch (err) {
            setError("Error al guardar la configuración de auditoría");
        } finally {
            setLoading(false);
        }
    };

    const toggleAction = (action) => {
        setActionConfig((prev) => ({
            ...prev,
            [action]: !prev[action],
        }));
    };

    const toggleSection = (sectionKey) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    //-------------------- Auditoría de Tablas --------------------

    const loadTableAuditConfigs = async () => {
        try {
            const response = await AuditoriaService.obtenerEstadoAuditoria();
            if (response.data?.configuracionesTablas) {
                setTableConfigs(response.data.configuracionesTablas);
            }
        } catch (err) {
            setError("Error al cargar la configuración de auditoría de tablas");
        }
    };

    const handleTableConfigSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!newTableConfig.nombreTabla.trim()) {
                throw new Error("El nombre de la tabla es requerido");
            }

            await AuditoriaService.configurarAuditoriaTablas([newTableConfig]);
            setSuccess(true);
            setTableModal(false);

            // Refresh table configs
            await loadTableAuditConfigs();

            // Reset form
            setNewTableConfig({
                nombreTabla: "",
                configuraciones: TABLE_AUDIT_ACTIONS.map((action) => ({
                    accion: action,
                    auditar: false,
                })),
            });
        } catch (err) {
            setError(
                err.message || "Error al guardar la configuración de auditoría de tabla"
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleTableAction = (actionName) => {
        setNewTableConfig((prev) => ({
            ...prev,
            configuraciones: prev.configuraciones.map((config) =>
                config.accion === actionName
                    ? { ...config, auditar: !config.auditar }
                    : config
            ),
        }));
    };
    return (
        <div className="p-4">
            <h2 className="mb-4">Gestión de Auditorías</h2>
            {error && (
                <Alert color="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert color="success" className="mb-4">
                    Configuración guardada exitosamente
                </Alert>
            )}
            <Nav tabs className="mb-4">
                <NavItem>
                    <NavLink
                        className={`cursor-pointer ${activeTab === 'config' ? 'active bg-primary text-white' : ''}`}
                        onClick={() => toggleTab('config')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FiDatabase className="me-2" />
                        Configuración
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={`cursor-pointer ${activeTab === 'sessions' ? 'active bg-primary text-white' : ''}`}
                        onClick={() => toggleTab('sessions')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FiUsers className="me-2" />
                        Sesiones
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={`cursor-pointer ${activeTab === 'tables' ? 'active bg-primary text-white' : ''}`}
                        onClick={() => toggleTab('tables')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FiTable className="me-2" />
                        Tablas
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={`cursor-pointer ${activeTab === 'actions' ? 'active bg-primary text-white' : ''}`}
                        onClick={() => toggleTab('actions')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FiActivity className="me-2" />
                        Acciones
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="config">
                    <Row>
                        {/* Mantener las tres tarjetas de configuración existentes */}
                        <Col xs="12" lg="4" className="mb-4">
                            <Card className="h-100">
                                <CardBody>
                                    <CardTitle tag="h5">
                                        <FiDatabase className="me-2" />
                                        Auditoría de Acciones
                                    </CardTitle>
                                    <Button
                                        color="primary"
                                        onClick={() => setModal(true)}
                                        className="mt-3"
                                    >
                                        Configurar Acciones a Auditar
                                    </Button>

                                    <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
                                        <ModalHeader toggle={() => setModal(false)}>
                                            Configuración de Acciones a Auditar
                                        </ModalHeader>
                                        <ModalBody>
                                            <Form>
                                                {Object.entries(AUDIT_ACTIONS).map(([key, section]) => (
                                                    <div key={key} className="mb-3">
                                                        <Button
                                                            color="link"
                                                            className="text-left p-0 mb-2 w-100 d-flex justify-content-between align-items-center"
                                                            onClick={() => toggleSection(key)}
                                                        >
                                                            <span>{section.title}</span>
                                                            <FiChevronDown
                                                                className={`transform ${openSections[key] ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </Button>
                                                        <Collapse isOpen={openSections[key]}>
                                                            {section.actions.map((action) => (
                                                                <FormGroup key={action} check className="ms-4 mb-2">
                                                                    <Input
                                                                        type="switch"
                                                                        id={action}
                                                                        checked={actionConfig[action] || false}
                                                                        onChange={() => toggleAction(action)}
                                                                    />
                                                                    <Label check for={action}>
                                                                        {action}
                                                                    </Label>
                                                                </FormGroup>
                                                            ))}
                                                        </Collapse>
                                                    </div>
                                                ))}
                                            </Form>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="secondary" onClick={() => setModal(false)}>
                                                Cancelar
                                            </Button>
                                            <Button color="primary" onClick={handleSave} disabled={loading}>
                                                <FiSave className="me-2" />
                                                {loading ? "Guardando..." : "Guardar Configuración"}
                                            </Button>
                                        </ModalFooter>
                                    </Modal>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Tarjeta para Auditoría de Conexiones */}
                        <Col xs="12" lg="4" className="mb-4">
                            <Card className="h-100">
                                <CardBody>
                                    <CardTitle tag="h5">
                                        <FiDatabase className="me-2" />
                                        Auditoría de Conexiones
                                    </CardTitle>
                                    <Form onSubmit={handleSubmit}>
                                        <FormGroup check className="mb-3">
                                            <Input
                                                type="checkbox"
                                                id="registrarExitosos"
                                                checked={configConexiones.registrarExitosos}
                                                onChange={(e) =>
                                                    setConfigConexiones({
                                                        ...configConexiones,
                                                        registrarExitosos: e.target.checked,
                                                    })
                                                }
                                            />
                                            <Label check for="registrarExitosos">
                                                Registrar intentos exitosos de conexión
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check className="mb-4">
                                            <Input
                                                type="checkbox"
                                                id="registrarFallidos"
                                                checked={configConexiones.registrarFallidos}
                                                onChange={(e) =>
                                                    setConfigConexiones({
                                                        ...configConexiones,
                                                        registrarFallidos: e.target.checked,
                                                    })
                                                }
                                            />
                                            <Label check for="registrarFallidos">
                                                Registrar intentos fallidos de conexión
                                            </Label>
                                        </FormGroup>
                                        <Button type="submit" color="primary" disabled={loading}>
                                            <FiSave className="me-2" />
                                            {loading ? "Guardando..." : "Guardar Configuración"}
                                        </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* New Card for Table Auditing */}
                        <Col xs="12" lg="4" className="mb-4">
                            <Card className="h-100">
                                <CardBody>
                                    <CardTitle tag="h5">
                                        <FiTable className="me-2" />
                                        Auditoría de Tablas
                                    </CardTitle>

                                    <Button
                                        color="primary"
                                        onClick={() => setTableModal(true)}
                                        className="mt-3"
                                    >
                                        Configurar Auditoría de Tabla
                                    </Button>

                                    {/* <div className="mt-4">
                                <h6>Tablas Configuradas:</h6>
                                {tableConfigs.map((config, index) => (
                                    <div key={index} className="border rounded p-3 mb-2">
                                        <h6>{config.nombreTabla}</h6>
                                        <small className="text-muted">
                                            Acciones auditadas: {config.configuraciones
                                                .filter(c => c.auditar)
                                                .map(c => c.accion)
                                                .join(', ')}
                                        </small>
                                    </div>
                                ))}
                            </div> */}

                                    <Modal
                                        isOpen={tableModal}
                                        toggle={() => setTableModal(false)}
                                        size="lg"
                                    >
                                        <ModalHeader toggle={() => setTableModal(false)}>
                                            Configurar Auditoría de Tabla
                                        </ModalHeader>
                                        <ModalBody>
                                            <Form>
                                                <FormGroup className="mb-4">
                                                    <Label for="tableName">Nombre de la Tabla</Label>
                                                    <Input
                                                        id="tableName"
                                                        type="text"
                                                        value={newTableConfig.nombreTabla}
                                                        onChange={(e) =>
                                                            setNewTableConfig((prev) => ({
                                                                ...prev,
                                                                nombreTabla: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        placeholder="Ingrese el nombre de la tabla"
                                                    />
                                                </FormGroup>

                                                <div className="mb-3">
                                                    <Label>Acciones a Auditar</Label>
                                                    {TABLE_AUDIT_ACTIONS.map((action) => (
                                                        <FormGroup key={action} check className="ms-3 mb-2">
                                                            <Input
                                                                type="switch"
                                                                id={`table-${action}`}
                                                                checked={
                                                                    newTableConfig.configuraciones.find(
                                                                        (c) => c.accion === action
                                                                    )?.auditar || false
                                                                }
                                                                onChange={() => toggleTableAction(action)}
                                                            />
                                                            <Label check for={`table-${action}`}>
                                                                AUDIT {action}
                                                            </Label>
                                                        </FormGroup>
                                                    ))}
                                                </div>
                                            </Form>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="secondary" onClick={() => setTableModal(false)}>
                                                Cancelar
                                            </Button>
                                            <Button
                                                color="primary"
                                                onClick={handleTableConfigSubmit}
                                                disabled={loading}
                                            >
                                                <FiSave className="me-2" />
                                                {loading ? "Guardando..." : "Guardar Configuración"}
                                            </Button>
                                        </ModalFooter>
                                    </Modal>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tabId="sessions">
                    <div className="mb-4">
                        <SessionAudit />
                    </div>
                </TabPane>

                <TabPane tabId="tables">
                    <div className="mb-4">
                        <TableAudit />
                    </div>
                </TabPane>

                <TabPane tabId="actions">
                    <div className="mb-4">
                        <ActionAudit />
                    </div>
                </TabPane>
            </TabContent>
        </div>
    );
};

export default AuditManager;
