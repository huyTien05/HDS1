using OfficeOpenXml;
using Dapper;
using WebApi.Data;

namespace WebApi.Services.MasterProduct
{
    public class MasterProductTemplateService : IMasterProductTemplateService
    {
        private readonly DapperContext _context;

        public MasterProductTemplateService(DapperContext context)
        {
            _context = context;
        }
        public byte[] GenerateTemplate()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Products");

            worksheet.Cells[1, 1].Value = "ProductCode";
            worksheet.Cells[1, 2].Value = "ProductName";
            worksheet.Cells[1, 3].Value = "Unit";
            worksheet.Cells[1, 4].Value = "Specification";
            worksheet.Cells[1, 5].Value = "QuantityPerBox";
            worksheet.Cells[1, 6].Value = "ProductWeight";

            worksheet.Cells[1, 1, 1, 6].Style.Font.Bold = true;
            worksheet.Cells.AutoFitColumns();

            return package.GetAsByteArray();
        }

        public async Task<object> UploadExcelAsync(IFormFile file)
        {
            // 1. Validate file
            if (file == null || file.Length == 0)
                throw new Exception("File không được để trống");

            if (!Path.GetExtension(file.FileName).Equals(".xlsx"))
                throw new Exception("File không đúng định dạng Excel (.xlsx)");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var package = new ExcelPackage(stream);

            var worksheet = package.Workbook.Worksheets.FirstOrDefault();
            if (worksheet == null)
                throw new Exception("File Excel không có dữ liệu");

            var errors = new List<object>();
            var successCount = 0;

            using var connection = _context.CreateConnection();

            // 2. Read rows
            for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
            {
                var productCode = worksheet.Cells[row, 1].Text?.Trim();
                var productName = worksheet.Cells[row, 2].Text?.Trim();
                var unit = worksheet.Cells[row, 3].Text?.Trim();
                var specification = worksheet.Cells[row, 4].Text?.Trim();
                var qtyText = worksheet.Cells[row, 5].Text?.Trim();
                var weightText = worksheet.Cells[row, 6].Text?.Trim();

                // 3. Validate required fields
                if (string.IsNullOrEmpty(productCode))
                {
                    errors.Add(new { row, message = "Mã sản phẩm không được để trống" });
                    continue;
                }

                if (string.IsNullOrEmpty(productName))
                {
                    errors.Add(new { row, message = "Tên sản phẩm không được để trống" });
                    continue;
                }

                if (!int.TryParse(qtyText, out var quantity))
                {
                    errors.Add(new { row, message = "Số lượng/Thùng không hợp lệ" });
                    continue;
                }

                if (!decimal.TryParse(weightText, out var weight))
                {
                    errors.Add(new { row, message = "Trọng lượng không hợp lệ" });
                    continue;
                }

                // 4. Check duplicate ProductCode
                var exists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM MasterProduct WHERE ProductCode = @ProductCode",
                    new { ProductCode = productCode });

                if (exists > 0)
                {
                    errors.Add(new
                    {
                        row,
                        message = $"Mã sản phẩm: {productCode} đã có trên hệ thống"
                    });
                    continue;
                }

                // 5. Insert
                await connection.ExecuteAsync(@"
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
                    )",
                    new
                    {
                        Id = Guid.NewGuid(),
                        ProductCode = productCode,
                        ProductName = productName,
                        Unit = unit,
                        Specification = specification,
                        QuantityPerBox = quantity,
                        ProductWeight = weight
                    });

                successCount++;
            }

            return new
            {
                successCount,
                errorCount = errors.Count,
                errors
            };
        }
    }
}