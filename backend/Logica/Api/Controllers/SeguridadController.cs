using Logica;
using Logica.Request;
using Logica.Response;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    public class SeguridadController : ControllerBase
    {
        private readonly Seguridad _seguridad;

        public SeguridadController(Seguridad seguridad)
        {
            _seguridad = seguridad;
        }

        [HttpPost]
        [Route("api/seguridad/crearUsuario")]
        public IActionResult CrearUsuario([FromBody] ReqCrearUsuario req)
        {
            ResCrearUsuario res = _seguridad.CrearUsuario(req);
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
        [Route("api/seguridad/crearRol")]
        public IActionResult CrearRol([FromBody] ReqCrearRol req)
        {
            ResCrearRol res = _seguridad.CrearRol(req);
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
        [Route("api/seguridad/modificarUsuario")]
        public IActionResult ModificarUsuario([FromBody] ReqModificarUsuario req)
        {
            ResModificarUsuario res = _seguridad.ModificarUsuario(req);
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
        [Route("api/seguridad/eliminarUsuario")]
        public IActionResult EliminarUsuario([FromBody] ReqEliminarUsuario req)
        {
            ResEliminarUsuario res = _seguridad.EliminarUsuario(req);
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
        [Route("api/seguridad/listarUsuarios")]
        public IActionResult ListarUsuarios()
        {
            ResListarUsuarios res = _seguridad.ListarUsuarios();
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
        [Route("api/seguridad/listarPrivilegios/{nombreUsuario}")]
        public IActionResult ListarPrivilegios(string nombreUsuario)
        {
            var req = new ReqListarPrivilegios { nombreUsuario = nombreUsuario };
            ResListarPrivilegios res = _seguridad.ListarPrivilegios(req);
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
        [Route("api/seguridad/listarRoles")]
        public IActionResult ListarRoles()
        {
            ResListarRoles res = _seguridad.ListarRoles();
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
        [Route("api/seguridad/obtenerPrivilegios")]
        public IActionResult ObtenerPrivilegios()
        {
            ResObtenerPrivilegios res = _seguridad.ObtenerPrivilegios();
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