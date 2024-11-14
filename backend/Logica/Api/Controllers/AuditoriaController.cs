using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    public class AuditoriaController : ControllerBase
    {
        private readonly Auditoria _auditoria;

        public AuditoriaController(Auditoria auditoria)
        {
            _auditoria = auditoria;
        }

        [HttpGet]
        [Route("api/auditoria/estado")]
        public IActionResult ObtenerEstadoAuditoria()
        {
            var res = _auditoria.ObtenerEstadoAuditoria();
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }

        [HttpPost]
        [Route("api/auditoria/configurar/conexiones")]
        public IActionResult ConfigurarAuditoriaConexiones([FromBody] ReqAuditoria req)
        {
            var res = _auditoria.ConfigurarAuditoriaConexiones(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }

        [HttpPost]
        [Route("api/auditoria/configurar/tablas")]
        public IActionResult ConfigurarAuditoriaTablas([FromBody] List<ReqAuditoriaTablas> req)
        {
            var res = _auditoria.ConfigurarAuditoriaTablas(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }

        [HttpPost]
        [Route("api/auditoria/configurar/acciones")]
        public IActionResult ConfigurarAuditoriaAcciones([FromBody] ReqAuditoriaAcciones req)
        {
            var res = _auditoria.ConfigurarAuditoriaAcciones(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }
        [HttpPost]
        [Route("api/auditoria/consultar/sesiones")]
        public IActionResult ConsultarSesiones([FromBody] ReqConsultaSesiones req)
        {
            var res = _auditoria.ObtenerRegistrosSesiones(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }

        [HttpPost]
        [Route("api/auditoria/consultar/tablas")]
        public IActionResult ConsultarTablas([FromBody] ReqConsultaTablas req)
        {
            var res = _auditoria.ObtenerRegistrosTablas(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }

        [HttpPost]
        [Route("api/auditoria/consultar/acciones")]
        public IActionResult ConsultarAcciones([FromBody] ReqConsultaAcciones req)
        {
            var res = _auditoria.ObtenerRegistrosAcciones(req);
            if (res.Exitoso)
            {
                return Ok(res);
            }
            return BadRequest(res);
        }


    }
}