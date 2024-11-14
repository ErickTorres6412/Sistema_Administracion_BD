using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        private readonly Performance _performance;

        public PerformanceController(Performance performance)
        {
            _performance = performance;
        }

        /// <summary>
        /// Obtiene el plan de ejecución para una consulta SQL
        /// </summary>
        [HttpPost]
        [Route("query-plan")]
        public IActionResult ObtenerQueryPlan([FromBody] ReqQueryPlan request)
        {
            var response = _performance.ObtenerQueryPlan(request);
            if (response.Exitoso)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        /// <summary>
        /// Crea un nuevo índice en la base de datos
        /// </summary>
        [HttpPost]
        [Route("create-index")]
        public IActionResult CrearIndice([FromBody] ReqCreateIndex request)
        {
            var response = _performance.CrearIndice(request);
            if (response.Exitoso)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }
    }
}