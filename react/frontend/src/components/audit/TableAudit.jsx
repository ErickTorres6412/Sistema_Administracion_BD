import React, { useState } from 'react';
import {
  Table,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Badge,
  Collapse
} from 'reactstrap';
import DatePicker from 'react-datepicker';

export const TableAudit = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(),
    fechaFin: new Date(),
    exitoso: '',
    limiteRegistros: 100
  });
  const [expandedRows, setExpandedRows] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7200/api/auditoria/consultar/tablas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          exitoso: filters.exitoso === '' ? null : filters.exitoso === 'true'
        })
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <h3>Auditoría de Tablas</h3>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-3">
              <FormGroup>
                <Label>Fecha Inicio</Label>
                <DatePicker
                  selected={filters.fechaInicio}
                  onChange={date => setFilters(prev => ({ ...prev, fechaInicio: date }))}
                  className="form-control"
                  showTimeSelect
                  dateFormat="yyyy-MM-dd HH:mm"
                />
              </FormGroup>
            </div>
            <div className="col-md-3">
              <FormGroup>
                <Label>Fecha Fin</Label>
                <DatePicker
                  selected={filters.fechaFin}
                  onChange={date => setFilters(prev => ({ ...prev, fechaFin: date }))}
                  className="form-control"
                  showTimeSelect
                  dateFormat="yyyy-MM-dd HH:mm"
                />
              </FormGroup>
            </div>
            <div className="col-md-3">
              <FormGroup>
                <Label>Estado</Label>
                <Input
                  type="select"
                  value={filters.exitoso}
                  onChange={e => setFilters(prev => ({ ...prev, exitoso: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Exitoso</option>
                  <option value="false">Fallido</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-3">
              <FormGroup>
                <Label>Límite</Label>
                <Input
                  type="number"
                  value={filters.limiteRegistros}
                  onChange={e => setFilters(prev => ({ ...prev, limiteRegistros: e.target.value }))}
                />
              </FormGroup>
            </div>
          </div>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar'}
          </Button>
        </Form>

        {error && <Alert color="danger">{error}</Alert>}

        {data?.estadisticas && (
          <div className="mb-4">
            <h4>Estadísticas</h4>
            <div className="d-flex gap-3 flex-wrap">
              <Badge color="primary" className="p-2">
                Total: {data.estadisticas.totalOperaciones}
              </Badge>
              {Object.entries(data.estadisticas.porOperacion).map(([key, value]) => (
                <Badge key={key} color="info" className="p-2">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data?.registros && (
          <Table striped responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tabla</th>
                <th>Esquema</th>
                <th>Operación</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.registros.map((registro, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>{new Date(registro.fechaEvento).toLocaleString()}</td>
                    <td>{registro.tabla}</td>
                    <td>{registro.esquema}</td>
                    <td>{registro.operacion}</td>
                    <td>
                      <Badge color={registro.exitoso ? 'success' : 'danger'}>
                        {registro.exitoso ? 'Exitoso' : 'Fallido'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        color="link"
                        size="sm"
                        onClick={() => toggleRow(index)}
                      >
                        {expandedRows[index] ? 'Ocultar SQL' : 'Ver SQL'}
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="p-0">
                      <Collapse isOpen={expandedRows[index]}>
                        <div className="bg-light p-3">
                          <pre className="mb-0">
                            {registro.sentenciaSQL}
                          </pre>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};