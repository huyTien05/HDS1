using Dapper;
using WebApi.Models;
using WebApi.Data;
using System.Text;
using System.Globalization;

namespace WebApi.Services.SaleOut
{
    public class SaleOutService : ISaleOutService
    {
        private readonly DapperContext _context;
        private readonly ISaleOutPDFService _pdfService;

        public SaleOutService(DapperContext context, ISaleOutPDFService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        private static readonly Dictionary<string, string> SortColumns = new(StringComparer.OrdinalIgnoreCase)
        {
            { "customerpono", "so.CustomerPoNo" },
            { "orderdate",    "so.OrderDate" },
            { "customername", "so.CustomerName" },
            { "productcode",  "mp.ProductCode" },
            { "productname",  "mp.ProductName" },
            { "quantity",     "so.Quantity" },
            { "boxquantity",  "so.BoxQuantity" },
            { "price",        "so.Price" },
            { "amount",       "so.Amount" }
        };

        private static string BuildOrderBy(string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
                return " ORDER BY so.OrderDate DESC ";

            var parts = new List<string>();

            foreach (var item in sort.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                var arr = item.Split(':', StringSplitOptions.RemoveEmptyEntries);

                var field = arr[0].Trim();
                var dir = arr.Length > 1 && arr[1].Equals("desc", StringComparison.OrdinalIgnoreCase)
                    ? "DESC"
                    : "ASC";

                if (!SortColumns.TryGetValue(field, out var column))
                    continue;

                parts.Add($"{column} {dir}");
            }

            return parts.Count > 0
                ? " ORDER BY " + string.Join(", ", parts)
                : " ORDER BY so.OrderDate DESC ";
        }
        public async Task<SaleOutResultModel<SaleOutViewModel>> GetListAsync(int pageIndex, int pageSize, string? field, string? keyword, string? sort)
        {

            
            var sql = new StringBuilder(" WHERE 1 = 1 ");
            var parameters = new DynamicParameters();
            using var connection = _context.CreateConnection();

            field = field?.Trim().ToLower();
            keyword = keyword?.Trim();
            
            // CHỈ FILTER KHI ĐỦ ĐIỀU KIỆN
            if (!string.IsNullOrWhiteSpace(field) &&
                !string.IsNullOrWhiteSpace(keyword))
            {
                switch (field)
                {
                    case "customerpono":
                        sql.Append(" AND so.CustomerPoNo LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "customername":
                        sql.Append(" AND so.CustomerName LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "orderdate":
                        if (DateTime.TryParseExact(keyword, "dd/MM/yyyy",
                        CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                        {
                            int searchDate = int.Parse(date.ToString("yyyyMMdd"));
                            sql.Append($" AND so.OrderDate = {searchDate} ");
                            parameters.Add("@Keyword", $"%{keyword}%");
                        }
                        break;

                    case "productcode":
                        sql.Append(" AND mp.ProductCode LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;

                    case "productname":
                        sql.Append(" AND mp.ProductName LIKE @Keyword ");
                        parameters.Add("@Keyword", $"%{keyword}%");
                        break;
                }
            }

            var countSql = $@"SELECT COUNT(1) FROM SaleOut so
                JOIN MasterProduct mp ON so.ProductId = mp.Id {sql}";

            var totalItems = await connection.ExecuteScalarAsync<int>(
                countSql, parameters);

            // string orderBySql = " ORDER BY so.OrderDate DESC "; // mặc định

            // if ()
            // {
            //     var dir = sortDirection.ToLower() == "desc" ? "DESC" : "ASC";

            //     orderBySql = sortField.ToLower() switch
            //     {
            //         "customerpono" => $" ORDER BY so.CustomerPoNo {dir} ",
            //         "orderdate"    => $" ORDER BY so.OrderDate {dir} ",
            //         "customername" => $" ORDER BY so.CustomerName {dir} ",
            //         "productcode"  => $" ORDER BY mp.ProductCode {dir} ",
            //         "productname"  => $" ORDER BY mp.ProductName {dir} ",
            //         "quantity"     => $" ORDER BY so.Quantity {dir} ",
            //         "boxquantity"  => $" ORDER BY so.BoxQuantity {dir} ",
            //         "price"        => $" ORDER BY so.Price {dir} ",
            //         "amount"       => $" ORDER BY so.Amount {dir} ",
            //         _ => orderBySql
            //     };
            // }
            
            var dataSql = $@"
                SELECT
                so.Id,
                so.CustomerPoNo,
                so.OrderDate,
                so.CustomerName,
                mp.ProductCode,
                mp.ProductName,
                mp.Unit,
                so.Quantity,
                so.QuantityPerBox,
                so.BoxQuantity,
                so.Price,
                so.Amount, 
                so.saleOutNo
            FROM SaleOut so
            JOIN MasterProduct mp ON so.ProductId = mp.Id {sql}
            {BuildOrderBy(sort)}
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;";

            parameters.Add("@Offset", (pageIndex - 1) * pageSize);
            parameters.Add("@PageSize", pageSize);

            var items = await connection.QueryAsync<SaleOutViewModel>(
                dataSql, parameters);

            return new SaleOutResultModel<SaleOutViewModel>
            {
                Items = items,
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalItems = totalItems
            };
        }

        public async Task<SaleOutViewModel> AddAsync(SaleOutAdd add)
        {
            using var conn = _context.CreateConnection();

            // 1. Validate
            if (string.IsNullOrWhiteSpace(add.CustomerPoNo) ||
                string.IsNullOrWhiteSpace(add.CustomerName) ||
                string.IsNullOrWhiteSpace(add.ProductCode) ||
                add.Price <= 0 ||
                add.Quantity <= 0)
            {
                throw new Exception("Thiếu thông tin bắt buộc");
            }

            // 2. Check trùng CustomerPoNo + ProductCode
            var exists = await conn.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*)
                FROM SaleOut so
                JOIN MasterProduct mp ON so.ProductId = mp.Id
                WHERE so.CustomerPoNo = @CustomerPoNo
                AND mp.ProductCode = @ProductCode
            ", new { add.CustomerPoNo, add.ProductCode });

            if (exists > 0)
            {
                throw new Exception($"Số PO khách hàng: {add.CustomerPoNo}; Mã sản phẩm: {add.ProductCode} đã có trên hệ thống");
            }

            // 3. Lấy thông tin Product master
            var master = await conn.QueryFirstOrDefaultAsync<dynamic>(@"
                SELECT Id, ProductName, Unit, QuantityPerBox
                FROM MasterProduct
                WHERE ProductCode = @ProductCode
            ", new { add.ProductCode });

            if (master == null)
                throw new Exception("Mã sản phẩm không tồn tại");

            // decimal perBox = master.QuantityPerBox;
            decimal perBox = add.QuantityPerBox ?? master.QuantityPerBox;
            // decimal boxQty = (int)Math.Ceiling((decimal)add.Quantity / perBox);
            decimal boxQty = Math.Ceiling(add.Quantity / perBox);
            decimal amount = add.Price * add.Quantity;
            // int orderDate = int.Parse(add.OrderDate.ToString("yyyyMMdd"));
            int orderDate = add.OrderDate;
            var id = Guid.NewGuid();
            var saleOutNo = await _pdfService.GenerateSaleOutNoAsync();
            // var saleOutNo = "TEST-9999";

            // 4. Insert SaleOut
            var insertSql = @"
                INSERT INTO SaleOut (
                    Id, CustomerPoNo, OrderDate, CustomerName,
                    ProductId, Quantity, QuantityPerBox, BoxQuantity,
                    Price, Amount, SaleOutNo
                ) 
                VALUES (
                    @Id, @CustomerPoNo, @OrderDate, @CustomerName,
                    @ProductId, @Quantity, @QuantityPerBox, @BoxQuantity,
                    @Price, @Amount, @SaleOutNo
                )
            ";

            var newId = await conn.ExecuteAsync(insertSql, new
            {
                Id = id,
                add.CustomerPoNo,
                OrderDate = orderDate, 
                add.CustomerName,
                ProductId = (Guid)master.Id,
                add.Quantity,
                QuantityPerBox = perBox,
                BoxQuantity = boxQty,
                add.Price,
                Amount = amount,
                SaleOutNo = saleOutNo
            });

            // 5. Trả lại record để FE thêm vào grid
            var result = await conn.QueryFirstAsync<SaleOutViewModel>(@"
                SELECT
                    so.Id,
                    so.CustomerPoNo,
                    so.OrderDate,
                    so.CustomerName,
                    mp.ProductCode,
                    mp.ProductName,
                    mp.Unit,
                    so.Quantity,
                    so.QuantityPerBox,
                    so.BoxQuantity,
                    so.Price,
                    so.Amount,
                    so.SaleOutNo
                FROM SaleOut so
                JOIN MasterProduct mp ON so.ProductId = mp.Id
                WHERE so.Id = @Id
            ", new { Id = id });

            return result;
        }

        public async Task<SaleOutViewModel> UpdateAsync(SaleOutUpdate model)
        {
            using var conn = _context.CreateConnection();
            // Lấy master Product để lấy Unit, ProductName,...
            var master = await conn.QueryFirstOrDefaultAsync<dynamic>(@"
                SELECT mp.Id, mp.ProductCode, mp.ProductName, mp.Unit, mp.QuantityPerBox
                FROM SaleOut so
                JOIN MasterProduct mp ON so.ProductId = mp.Id
                WHERE so.Id = @Id
            ", new { model.Id });

            if (master == null)
                throw new Exception("Không tìm thấy đơn");

            decimal perBox = model.QuantityPerBox ?? master.QuantityPerBox;
            decimal boxQty = Math.Ceiling(model.Quantity / perBox);
            decimal amount = model.Price * model.Quantity;

            var sql = @"
                UPDATE SaleOut
                SET 
                    Quantity = @Quantity,
                    QuantityPerBox = @QuantityPerBox,
                    BoxQuantity = @BoxQuantity,
                    Price = @Price,
                    Amount = @Amount
                WHERE Id = @Id
            ";

            await conn.ExecuteAsync(sql, new {
                model.Id,
                model.Quantity,
                QuantityPerBox = perBox,
                BoxQuantity = boxQty,
                model.Price,
                Amount = amount
            });

            // Trả về ViewModel mới
            return await conn.QueryFirstAsync<SaleOutViewModel>(@"
                SELECT
                    so.Id,
                    so.CustomerPoNo,
                    so.OrderDate,
                    so.CustomerName,
                    mp.ProductCode,
                    mp.ProductName,
                    mp.Unit,
                    so.Quantity,
                    so.QuantityPerBox,
                    so.BoxQuantity,
                    so.Price,
                    so.Amount
                FROM SaleOut so
                JOIN MasterProduct mp ON so.ProductId = mp.Id
                WHERE so.Id = @Id
            ", new { model.Id });
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = _context.CreateConnection();

            var sql = @"DELETE FROM SaleOut WHERE Id = @Id";

            var rows = await conn.ExecuteAsync(sql, new { Id = id });

            if (rows == 0)
                throw new Exception("NOT_FOUND");
        }



    }
}


