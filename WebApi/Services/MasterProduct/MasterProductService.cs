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
        // public async Task<MasterProductResultModel<MasterProductPageModel>> GetListAsync(
        //     int pageIndex,
        //     int pageSize,
        // string? field,
        // string? keyword)
        // {

        //     var sql = new StringBuilder(" WHERE 1 = 1 ");
        //     var parameters = new DynamicParameters();
        //     using var connection = _context.CreateConnection();

        //     field = field?.Trim().ToLower();
        //     keyword = keyword?.Trim();

        //     // CHỈ FILTER KHI ĐỦ ĐIỀU KIỆN TÌM KIẾM
        //     if (!string.IsNullOrWhiteSpace(field) && 
        //         !string.IsNullOrWhiteSpace(keyword))
        //     {
        //         switch (field)
        //         {
        //             case "id":
        //                 if (Guid.TryParse(keyword, out var id))
        //                     sql.Append(" AND Id = @Id ");
        //                 break;

        //             case "productcode":
        //                 sql.Append(" AND ProductCode LIKE @Keyword ");
        //                 break;

        //             case "productname":
        //                 sql.Append(" AND ProductName LIKE @Keyword ");
        //                 break;

        //             case "unit":
        //                 sql.Append(" AND Unit LIKE @Keyword ");
        //                 break;

        //             case "specification":
        //                 sql.Append(" AND Specification LIKE @Keyword ");
        //                 break;

        //             case "quantityperbox":
        //                 if (int.TryParse(keyword, out var qty))
        //                     sql.Append(" AND QuantityPerBox = @Quantity ");
        //                 break;

        //             case "productweight":
        //                 if (decimal.TryParse(keyword, out var weight))
        //                     sql.Append(" AND ProductWeight = @Weight ");
        //                 break;
        //         }
        //     }

        //     // return await connection.QueryAsync<MasterProductPageModel>(
        //     //     sql.ToString(),
        //     //     new
        //     //     {
        //     //         Id = Guid.TryParse(keyword, out var gid) ? gid : Guid.Empty,
        //     //         Keyword = $"%{keyword}%",
        //     //         Quantity = int.TryParse(keyword, out var q) ? q : 0,
        //     //         Weight = decimal.TryParse(keyword, out var w) ? w : 0
        //     //     }
        //     // );

        //     var countSql = $@"
        //         SELECT COUNT(1)
        //         FROM MasterProduct
        //         {sql};
        //     ";
        //     var totalItems = await connection.ExecuteScalarAsync<int>(
        //         countSql, parameters);
            
        //     var dataSql = $@"
        //         SELECT
        //             Id,
        //             ProductCode,
        //             ProductName,
        //             Unit,
        //             Specification,
        //             QuantityPerBox,
        //             ProductWeight
        //         FROM MasterProduct
        //         {sql}
        //         ORDER BY ProductName
        //         OFFSET @Offset ROWS
        //         FETCH NEXT @PageSize ROWS ONLY;
        //     ";

        //     parameters.Add("@Offset", (pageIndex - 1) * pageSize);
        //     parameters.Add("@PageSize", pageSize);

        //     var items = await connection.QueryAsync<MasterProductPageModel>(
        //         dataSql, parameters);

        //     return new MasterProductResultModel<MasterProductPageModel>
        //     {
        //         Items = items,
        //         PageIndex = pageIndex,
        //         PageSize = pageSize,
        //         TotalItems = totalItems
        //     };
        // }
        public async Task<MasterProductResultModel<MasterProductPageModel>> GetListAsync(
            int pageIndex,
            int pageSize,
            string? field,
            string? keyword)
        {
            var sql = new StringBuilder(" WHERE 1 = 1 ");
            var parameters = new DynamicParameters();

            using var connection = _context.CreateConnection();

            field = field?.Trim().ToLower();
            keyword = keyword?.Trim();

            if (!string.IsNullOrWhiteSpace(field) &&
                !string.IsNullOrWhiteSpace(keyword))
            {
                switch (field)
                {
                    case "id":
                        if (Guid.TryParse(keyword, out var id))
                        {
                            sql.Append(" AND Id = @Id ");
                            parameters.Add("@Id", id);
                        }
                        break;

                    case "productcode":
                        sql.Append(" AND ProductCode LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "productname":
                        sql.Append(" AND ProductName LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "unit":
                        sql.Append(" AND Unit LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "specification":
                        sql.Append(" AND Specification LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "quantityperbox":
                        if (int.TryParse(keyword, out var qty))
                        {
                            sql.Append(" AND QuantityPerBox = @Quantity ");
                            parameters.Add("@Quantity", qty);
                        }
                        break;

                    case "productweight":
                        if (decimal.TryParse(keyword, out var weight))
                        {
                            sql.Append(" AND ProductWeight = @Weight ");
                            parameters.Add("@Weight", weight);
                        }
                        break;
                }
            }

            // COUNT
            var countSql = $@"
                SELECT COUNT(1)
                FROM MasterProduct
                {sql}
            ";

            var totalItems = await connection.ExecuteScalarAsync<int>(
                countSql, parameters);

            // DATA
            var dataSql = $@"
                SELECT
                    Id,
                    ProductCode,
                    ProductName,
                    Unit,
                    Specification,
                    QuantityPerBox,
                    ProductWeight
                FROM MasterProduct
                {sql}
                ORDER BY ProductName
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            ";

            parameters.Add("@Offset", (pageIndex - 1) * pageSize);
            parameters.Add("@PageSize", pageSize);

            var items = await connection.QueryAsync<MasterProductPageModel>(
                dataSql, parameters);

            return new MasterProductResultModel<MasterProductPageModel>
            {
                Items = items,
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalItems = totalItems
            };
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