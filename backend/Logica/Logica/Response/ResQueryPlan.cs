using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Logica.Response
{
    public class ResQueryPlan
    {
        public List<OperacionPlan> Operaciones { get; set; }
        public EstadisticasEjecucion Estadisticas { get; set; }
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; }

        public class OperacionPlan
        {
            public int Id { get; set; }
            public int ParentId { get; set; }
            public int Nivel { get; set; }
            public string TipoOperacion { get; set; }
            public string OpcionesOperacion { get; set; }
            public string ObjetoAccedido { get; set; }
            public int Filas { get; set; }
            public int Bytes { get; set; }
            public int Costo { get; set; }
            public int CostoCPU { get; set; }
            public string TiempoEstimado { get; set; }
        }

        public class EstadisticasEjecucion
        {
            public int CostoTotal { get; set; }
            public string TiempoEstimado { get; set; }
            public int FilasTotales { get; set; }
            public string PlanHashValue { get; set; }
            public List<string> PredicateInformation { get; set; }
        }
    }
}