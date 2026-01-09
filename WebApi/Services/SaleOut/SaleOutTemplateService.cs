using OfficeOpenXml;
using Dapper;
using WebApi.Data;

namespace WebApi.Services.SaleOut
{
    public class SaleOutTemplateService : ISaleOutTemplateService
    {
        private readonly DapperContext _context;
        private readonly ISaleOutPDFService _pdfService;

        public SaleOutTemplateService(DapperContext context, ISaleOutPDFService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }
        
        public byte[] GenerateTemplate()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("SaleOut");

            worksheet.Cells[1, 1].Value = "CustomerPoNo";
            worksheet.Cells[1, 2].Value = "OrderDate";
            worksheet.Cells[1, 3].Value = "CustomerName";
            worksheet.Cells[1, 4].Value = "ProductCode";
            worksheet.Cells[1, 5].Value = "ProductName";
            worksheet.Cells[1, 6].Value = "Unit";
            worksheet.Cells[1, 7].Value = "Quantity";
            worksheet.Cells[1, 8].Value = "QuantityPerBox";
            worksheet.Cells[1, 9].Value = "Price";
            worksheet.Cells[1, 10].Value = "BoxQuantity";
            worksheet.Cells[1, 11].Value = "Amount";


            worksheet.Cells[1, 1, 1, 11].Style.Font.Bold = true;
            worksheet.Cells.AutoFitColumns();

            return package.GetAsByteArray();
        }

        public async Task<object> UploadExAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không được để trống");

            if (Path.GetExtension(file.FileName).ToLower() != ".xlsx")
                throw new Exception("File phải là .xlsx");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var package = new ExcelPackage(stream);

            var ws = package.Workbook.Worksheets.FirstOrDefault();
            if (ws?.Dimension == null)
                throw new Exception("File Excel không có dữ liệu");

            var errors = new List<object>();
            var successCount = 0;

            using var conn = _context.CreateConnection();
            conn.Open();

            using var tran = conn.BeginTransaction();

            try
            {
                //SINH SALEOUTNO 1 LẦN
                var saleOutNo = await _pdfService.GenerateSaleOutNoAsync();

                for (int row = 2; row <= ws.Dimension.End.Row; row++)
                {
                    try
                    {
                        var customerPoNo   = ws.Cells[row, 1].Text?.Trim() ?? "";
                        var orderDateText = ws.Cells[row, 2].Text?.Trim() ?? "";
                        var customerName  = ws.Cells[row, 3].Text?.Trim() ?? "";
                        var productCode   = ws.Cells[row, 4].Text?.Trim() ?? "";
                        var qtyText       = ws.Cells[row, 7].Text?.Trim() ?? "";
                        var qtyPerBoxText = ws.Cells[row, 8].Text?.Trim() ?? "";
                        var priceText     = ws.Cells[row, 9].Text?.Trim() ?? "";

                        if (!int.TryParse(orderDateText, out var orderDate))
                            throw new Exception("OrderDate phải yyyyMMdd");

                        if (!decimal.TryParse(qtyText, out var quantity))
                            throw new Exception("Quantity không hợp lệ");

                        if (!decimal.TryParse(qtyPerBoxText, out var quantityPerBox))
                            throw new Exception("QuantityPerBox không hợp lệ");

                        if (!decimal.TryParse(priceText, out var price))
                            throw new Exception("Price không hợp lệ");

                        var product = await conn.QueryFirstOrDefaultAsync<dynamic>(
                            @"SELECT Id FROM MasterProduct WHERE ProductCode = @ProductCode",
                            new { ProductCode = productCode },
                            tran
                        );

                        if (product == null)
                            throw new Exception($"Không tồn tại ProductCode {productCode}");

                        var exists = await conn.ExecuteScalarAsync<int>(
                            @"SELECT COUNT(1)
                            FROM SaleOut
                            WHERE CustomerPoNo = @CustomerPoNo
                                AND ProductId = @ProductId",
                            new
                            {
                                CustomerPoNo = customerPoNo,
                                ProductId = product.Id
                            },
                            tran
                        );

                        if (exists > 0)
                        {
                            throw new Exception(
                                $"Số PO khách hàng: {customerPoNo}; Mã sản phẩm: {productCode} đã có trên hệ thống"
                            );
                        }

                        var boxQuantity = Math.Ceiling(quantity / quantityPerBox);
                        var amount = quantity * price;

                        //INSERT SALEOUT (KHÔNG DETAIL)
                        await conn.ExecuteAsync(@"
                            INSERT INTO SaleOut
                            (
                                Id, SaleOutNo, CustomerPoNo, OrderDate, CustomerName,
                                ProductId, Quantity, QuantityPerBox, BoxQuantity,
                                Price, Amount
                            )
                            VALUES
                            (
                                @Id, @SaleOutNo, @CustomerPoNo, @OrderDate, @CustomerName,
                                @ProductId, @Quantity, @QuantityPerBox, @BoxQuantity,
                                @Price, @Amount
                            )",
                            new
                            {
                                Id = Guid.NewGuid(),     // 🔹 MỖI DÒNG 1 ID
                                SaleOutNo = saleOutNo,   // 🔹 DÙNG CHUNG
                                CustomerPoNo = customerPoNo,
                                OrderDate = orderDate,
                                CustomerName = customerName,
                                ProductId = product.Id,
                                Quantity = quantity,
                                QuantityPerBox = quantityPerBox,
                                BoxQuantity = boxQuantity,
                                Price = price,
                                Amount = amount
                            },
                            tran
                        );

                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add(new { row, message = ex.Message });
                    }
                }

                tran.Commit();

                return new
                {
                    saleOutNo,
                    successCount,
                    errorCount = errors.Count,
                    errors
                };
            }
            catch
            {
                tran.Rollback();
                throw;
            }
        }
    }
}
    

