﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResListarUsuarios
    {
        public bool resultado { get; set; }
        public List<string> errores { get; set; }
        public List<UsuarioInfo> usuarios { get; set; }
    }
}
