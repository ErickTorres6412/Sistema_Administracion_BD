using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Request
{
    public class ReqModificarTablespace
    {
        public string nombreTablespace { get; set; }
        public bool? autoextend { get; set; }
        public int? incrementoSize { get; set; }
        public int? tamanioMaximo { get; set; }
    }
}
