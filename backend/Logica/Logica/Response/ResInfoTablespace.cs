using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResInfoTablespace
    {
        public List<string> errores { get; set; }
        public List<InfoTablespace> tablespaces { get; set; }
        public bool resultado { get; set; }
    }

}
