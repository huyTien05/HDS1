using Dapper;
using System.Text;
using WebApi.Data;
using WebApi.Models;
using OfficeOpenXml;

namespace WebApi.Services.MasterProduct
{
    public class MasterProductService : IMasterProductService
    {
        private readonly DapperContext _context;
        public MasterProductService(DapperContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<MasterProductPageModel>> GetListAsync(
        string? field,
        string? keyword)
        {
            using var connection = _context.CreateConnection();

            var sql = new StringBuilder(@"
                SELECT
                    Id,
                    ProductCode,
                    ProductName,
                    Unit,
                    Specification,
                    QuantityPerBox,
                    ProductWeight
                FROM MasterProduct
                WHERE 1 = 1
            ");

            field = field?.Trim().ToLower();
            keyword = keyword?.Trim();

            // CHỈ FILTER KHI ĐỦ ĐIỀU KIỆN TÌM KIẾM
            if (!string.IsNullOrWhiteSpace(field) && 
                !string.IsNullOrWhiteSpace(keyword))
            {
                switch (field)
                {
                    case "id":
                        if (Guid.TryParse(keyword, out var id))
                            sql.Append(" AND Id = @Id ");
                        break;

                    case "productcode":
                        sql.Append(" AND ProductCode LIKE @Keyword ");
                        break;

                    case "productname":
                        sql.Append(" AND ProductName LIKE @Keyword ");
                        break;

                    case "unit":
                        sql.Append(" AND Unit LIKE @Keyword ");
                        break;

                    case "specification":
                        sql.Append(" AND Specification LIKE @Keyword ");
                        break;

                    case "quantityperbox":
                        if (int.TryParse(keyword, out var qty))
                            sql.Append(" AND QuantityPerBox = @Quantity ");
                        break;

                    case "productweight":
                        if (decimal.TryParse(keyword, out var weight))
                            sql.Append(" AND ProductWeight = @Weight ");
                        break;
                }
            }

            return await connection.QueryAsync<MasterProductPageModel>(
                sql.ToString(),
                new
                {
                    Id = Guid.TryParse(keyword, out var gid) ? gid : Guid.Empty,
                    Keyword = $"%{keyword}%",
                    Quantity = int.TryParse(keyword, out var q) ? q : 0,
                    Weight = decimal.TryParse(keyword, out var w) ? w : 0
                }
            );
        }

        public async Task<MasterProductPageModel> CreateAsync(
        MasterProductPageModel model)
            {
                using var connection = _context.CreateConnection();
                // check trùng
                var exists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM MasterProduct WHERE ProductCode = @ProductCode",
                    new { model.ProductCode });

                if (exists > 0)
                    throw new Exception("PRODUCT_CODE_EXISTS");

                var sql = @"
                    INSERT INTO MasterProduct
                    (
                        Id,
                        ProductCode,
                        ProductName,
                        Unit,
                        Specification,
                        QuantityPerBox,
                        ProductWeight
                    )
                    VALUES
                    (
                        @Id,
                        @ProductCode,
                        @ProductName,
                        @Unit,
                        @Specification,
                        @QuantityPerBox,
                        @ProductWeight
                    );
                ";

                var newId = Guid.NewGuid();

                await connection.ExecuteAsync(sql, new
                {
                    Id = newId,
                    model.ProductCode,
                    model.ProductName,
                    model.Unit,
                    model.Specification,
                    model.QuantityPerBox,
                    model.ProductWeight
                });

                // trả lại object đã lưu
                model.Id = newId;
                return model;
            }

            public async Task<MasterProductPageModel> UpdateAsync(
            Guid id,
            MasterProductPageModel model)
            {
                using var connection = _context.CreateConnection();

                var sql = @"
                    UPDATE MasterProduct
                    SET
                        Unit = @Unit,
                        Specification = @Specification,
                        QuantityPerBox = @QuantityPerBox,
                        ProductWeight = @ProductWeight
                    WHERE Id = @Id
                ";

                var rows = await connection.ExecuteAsync(sql, new
                {
                    Id = id,
                    model.Unit,
                    model.Specification,
                    model.QuantityPerBox,
                    model.ProductWeight
                });

                if (rows == 0)
                    throw new Exception("NOT_FOUND");

                model.Id = id;
                return model;
            }

            public async Task DeleteAsync(Guid id)
            {
                using var connection = _context.CreateConnection();

                var rows = await connection.ExecuteAsync(
                    "DELETE FROM MasterProduct WHERE Id = @Id",
                    new { Id = id });

                if (rows == 0)
                    throw new Exception("NOT_FOUND");
            }

    }
    
}