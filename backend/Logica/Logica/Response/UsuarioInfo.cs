using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class UsuarioInfo
    {
        public string nombreUsuario { get; set; }
        public string estado { get; set; }
        public DateTime? fechaBloqueo { get; set; }
        public DateTime fechaCreacion { get; set; }
        public string perfil { get; set; }
        public string tablespaceDefault { get; set; }
    }
}
