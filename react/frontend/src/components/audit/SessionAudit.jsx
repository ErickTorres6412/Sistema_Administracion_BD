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
  Badge
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const SessionAudit = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(),
    fechaFin: new Date(),
    exitoso: '',
    limiteRegistros: 100
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7200/api/auditoria/consultar/sesiones', {
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

  return (
    <Card>
      <CardHeader>
        <h3>Auditoría de Sesiones</h3>
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
            <div className="d-flex gap-3">
              <Badge color="primary" className="p-2">
                Total: {data.estadisticas.totalConexiones}
              </Badge>
              <Badge color="success" className="p-2">
                Exitosas: {data.estadisticas.conexionesExitosas}
              </Badge>
              <Badge color="danger" className="p-2">
                Fallidas: {data.estadisticas.conexionesFallidas}
              </Badge>
            </div>
          </div>
        )}

        {data?.registros && (
          <Table striped responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Estado</th>
                <th>Terminal</th>
                <th>IP</th>
                <th>Código</th>
              </tr>
            </thead>
            <tbody>
              {data.registros.map((registro, index) => (
                <tr key={index}>
                  <td>{new Date(registro.fechaEvento).toLocaleString()}</td>
                  <td>{registro.tipoEvento}</td>
                  <td>
                    <Badge color={registro.exitoso ? 'success' : 'danger'}>
                      {registro.exitoso ? 'Exitoso' : 'Fallido'}
                    </Badge>
                  </td>
                  <td>{registro.terminal}</td>
                  <td>{registro.direccionIP}</td>
                  <td>{registro.codigoError}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};