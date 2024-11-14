using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqEliminarTablespace
    {
        public string nombreTablespace { get; set; }
        public bool incluirContenido { get; set; }
    }
}
