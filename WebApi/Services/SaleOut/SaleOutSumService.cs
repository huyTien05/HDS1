using Dapper;
using WebApi.Data;
using WebApi.Models;

namespace WebApi.Services.SaleOut
{
    public class SaleOutSumService : ISaleOutSumService
    {
        private readonly DapperContext _context;

        private static readonly HashSet<string> AllowedColumns = new()
        {
            "quantity",
            "amount",
            "boxquantity"
        };

        public SaleOutSumService(DapperContext context)
        {
            _context = context;
        }

        public async Task<SaleOutSumRPModel> GetSumASyc(SaleOutSumModel model)
        {
            var response = new SaleOutSumRPModel();

            if (model?.SummaryColumns == null || !model.SummaryColumns.Any())
                return response;

            var allowed = new HashSet<string>
            {
                "quantity", "amount", "boxquantity"
            };

            var sumColumns = model.SummaryColumns
                .Where(c => allowed.Contains(c))
                .Distinct()
                .ToList();

            if (!sumColumns.Any())
                return response;

            var selectSql = string.Join(", ",
                sumColumns.Select(c => $"SUM({c}) AS [{c}]"));

            var sql = $"SELECT {selectSql} FROM SaleOut";

            using var conn = _context.CreateConnection();

            // var result = await conn.QueryFirstAsync<IDictionary<string, object>>(sql);
            var row = await conn.QueryFirstAsync<dynamic>(sql);
            var dict = (IDictionary<string, object>)row;

            foreach (var col in sumColumns)
            {
                response.Sums[col] = dict[col] == null
                    ? 0
                    : Convert.ToDecimal(dict[col]);
            }
            return response;
        }
        
    }
}