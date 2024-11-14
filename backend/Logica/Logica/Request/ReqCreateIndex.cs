using System;
using System.Collections.Generic;

namespace Logica.Request
{
    public class ReqCreateIndex
    {
        public string NombreTabla { get; set; }
        public string NombreIndice { get; set; }
        public List<string> Columnas { get; set; }
        public bool Unico { get; set; } = false;  // opcional, por si queremos índices únicos
    }
}