using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqCrearUsuario
    {
        public string nombreUsuario { get; set; }
        public string password { get; set; }
        public List<string> roles { get; set; }
    }

}
