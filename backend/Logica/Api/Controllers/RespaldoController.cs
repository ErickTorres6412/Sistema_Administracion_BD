using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    public class RespaldoController : ControllerBase
    {
        private readonly Respaldos _respaldos;
        public RespaldoController(Respaldos respaldos)
        {
            _respaldos = respaldos;
        }


        [HttpPost]
        [Route("api/respaldo/generarRespaldoSchema")]
        public IActionResult generarRespaldoSchema([FromBody] ReqRespaldoSchema req)
        {
            ResRespaldoSchema res = _respaldos.generarRespaldoSchema(req);
            if(res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }

        [HttpPost]
        [Route("api/respaldo/generarRespaldoTabla")]
        public IActionResult generarRespaldoTabla([FromBody] ReqRespaldoTabla req)
        {
            ResRespaldoTabla res = _respaldos.generarRespaldoTabla(req);
            if (res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }
        [HttpGet]
        [Route("api/respaldo/generarRespaldoCompleto")]
        public IActionResult generarRespaldoCompleto()
        {
            ResRespaldoCompleto res = _respaldos.generarRespaldoCompleto();
            if (res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }

        [HttpPost]
        [Route("api/respaldo/ImportarRespaldoSchema")]
        public IActionResult ImportarRespaldoSchema([FromBody] ReqRespaldoSchema req)
        {
            ResImportarRespaldoSchema res = _respaldos.ImportarRespaldoSchema(req);
            if (res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }

        [HttpPost]
        [Route("api/respaldo/ImportarRespaldoTabla")]
        public IActionResult ImportarRespaldoTabla([FromBody] ReqRespaldoTabla req)
        {
            ResImportarRespaldoTabla res = _respaldos.ImportarRespaldoTablaSchema(req);
            if (res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }

        [HttpGet]
        [Route("api/respaldo/ImportarRespaldoCompleto")]
        public IActionResult ImportarRespaldoCompleto()
        {
            ResImportarRespaldoCompleto res = _respaldos.ImportarRespaldoCompleto();
            if (res.resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }
    }
}
