using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqModificarUsuario
    {
        public string nombreUsuario { get; set; }
        public string nuevoPassword { get; set; }
        public bool bloquear { get; set; }
    }

}
