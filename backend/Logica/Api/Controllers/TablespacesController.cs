using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    public class TablespaceController : ControllerBase
    {
        private readonly Tablespaces _tablespaces;

        public TablespaceController(Tablespaces tablespaces)
        {
            _tablespaces = tablespaces;
        }

        [HttpPost]
        [Route("api/tablespace/crear")]
        public IActionResult CrearTablespace([FromBody] ReqCrearTablespace req)
        {
            ResTablespace res = _tablespaces.CrearTablespace(req);
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
        [Route("api/tablespace/modificar")]
        public IActionResult ModificarTablespace([FromBody] ReqModificarTablespace req)
        {
            ResTablespace res = _tablespaces.ModificarTablespace(req);
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
        [Route("api/tablespace/eliminar")]
        public IActionResult EliminarTablespace([FromBody] ReqEliminarTablespace req)
        {
            ResTablespace res = _tablespaces.EliminarTablespace(req);
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
        [Route("api/tablespace/obtenerInformacion")]
        public IActionResult ObtenerInformacionTablespaces()
        {
            ResInfoTablespace res = _tablespaces.ObtenerInformacionTablespaces();
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
        [Route("api/tablespace/compactar")]
        public IActionResult CompactarTablespace([FromBody] ReqCompactarTablespace req)
        {
            ResTablespace res = _tablespaces.CompactarTablespace(req);
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