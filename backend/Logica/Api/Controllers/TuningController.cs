using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    public class TuningController : ControllerBase
    {
        private readonly Tuning _tuning;

        public TuningController(Tuning tuning)
        {
            _tuning = tuning;
        }

        [HttpPost]
        [Route("api/tuning/analizarConsulta")]
        public IActionResult analizarConsulta([FromBody] ReqAnalisisConsulta req)
        {
            ResAnalisisConsulta res = _tuning.AnalizarConsulta(req);
            if (res.Resultado)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest(res);
            }
        }

        [HttpGet]
        [Route("api/tuning/obtenerEstadisticasTabla/{schema}/{tabla}")]
        public IActionResult obtenerEstadisticasTabla(string schema, string tabla)
        {
            ResAnalisisConsulta res = _tuning.ObtenerEstadisticasTabla(schema, tabla);
            if (res.Resultado)
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