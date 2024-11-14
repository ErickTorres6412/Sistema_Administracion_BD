using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqCrearRol
    {
        public string nombreRol { get; set; }
        public List<string> privilegios { get; set; }
    }
}
