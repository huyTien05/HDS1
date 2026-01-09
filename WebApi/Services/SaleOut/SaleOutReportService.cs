using Dapper;
using WebApi.Models;
using OfficeOpenXml;
using WebApi.Data;
using WebApi.Services.SaleOut;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Globalization;

public class SaleOutReportService : ISaleOutReportService
{
    private readonly DapperContext _context;

    public SaleOutReportService(DapperContext context)
    {
        _context = context;
    }

    public async Task<byte[]> ExportReportAsync(int startDate, int endDate)
    {
        using var connection = _context.CreateConnection();

        // 1. Gọi hàm SQL
        var data = (await connection.QueryAsync<SaleOutReportModel>(
            @"SELECT *
              FROM dbo.fnSaleOutReport(@StartDate, @EndDate)",
            new { StartDate = startDate, EndDate = endDate }
        )).ToList();

        DateTime fromDate = DateTime.ParseExact(
            startDate.ToString(),
            "yyyyMMdd",
            CultureInfo.InvariantCulture
        );

        DateTime toDate = DateTime.ParseExact(
            endDate.ToString(),
            "yyyyMMdd",
            CultureInfo.InvariantCulture
        );

        // 2. Tạo Excel
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("RevenueReport");

        ws.Cells[1, 1, 1, 11].Merge = true;
        ws.Cells[1, 1].Value = "BÁO CÁO DOANH THU SẢN PHẨM";
        ws.Cells[1, 1].Style.Font.Bold = true;
        ws.Cells[1, 1].Style.Font.Size = 16;
        ws.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        ws.Cells[1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

        ws.Cells[2, 1].Value = "Từ ngày:";
        ws.Cells[2, 1].Style.Font.Bold = true;
        ws.Cells[2, 2, 2, 3].Merge = true;
        ws.Cells[2, 2].Value = fromDate;
        ws.Cells[2, 2].Style.Numberformat.Format = "dd/MM/yyyy";
        ws.Cells[2, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
        ws.Cells[2, 2].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

        ws.Cells[2, 6].Value = "Đến ngày:";
        ws.Cells[2, 6].Style.Font.Bold = true;
        ws.Cells[2, 7, 2, 8].Merge = true;
        ws.Cells[2, 7].Value = toDate;
        ws.Cells[2, 7].Style.Numberformat.Format = "dd/MM/yyyy";
        ws.Cells[2, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
        ws.Cells[2, 7].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

        // Header
        int headerRow = 3;
        // STT (1 ô)
        ws.Cells[headerRow, 1].Value = "STT";
        // Mã SP
        ws.Cells[headerRow, 2, headerRow, 3].Merge = true;
        ws.Cells[headerRow, 2].Value = "Mã sản phẩm";
        ws.Cells[headerRow, 4, headerRow, 5].Merge = true;
        ws.Cells[headerRow, 4].Value = "Tên sản phẩm";
        ws.Cells[headerRow, 6, headerRow, 7].Merge = true;
        ws.Cells[headerRow, 6].Value = "Tổng số lượng";
        ws.Cells[headerRow, 8, headerRow, 9].Merge = true;
        ws.Cells[headerRow, 8].Value = "Đơn giá TB";
        ws.Cells[headerRow, 10, headerRow, 11].Merge = true;
        ws.Cells[headerRow, 10].Value = "Thành tiền";
        ws.Cells[headerRow, 1, headerRow, 11].Style.Font.Bold = true;
        ws.Cells[headerRow, 1, headerRow, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        ws.Cells[headerRow, 1, headerRow, 11].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
        ws.Cells[headerRow, 1, headerRow, 11].Style.Fill.PatternType = ExcelFillStyle.Solid;
        ws.Cells[headerRow, 1, headerRow, 11].Style.Fill.BackgroundColor.SetColor(Color.LightGray);

        int row = 4;
        int stt = 1;

        foreach (var item in data)
        {
            ws.Cells[row, 1].Value = stt++;
            ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[row, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            ws.Cells[row, 2, row, 3].Merge = true;
            ws.Cells[row, 2].Value = item.ProductCode;
            ws.Cells[row, 4, row, 5].Merge = true;
            ws.Cells[row, 4].Value = item.ProductName;
            ws.Cells[row, 6, row, 7].Merge = true;
            ws.Cells[row, 6].Value = item.TotalQuantity;
            ws.Cells[row, 8, row, 9].Merge = true;
            ws.Cells[row, 8].Value = item.AvgPrice;
            ws.Cells[row, 10, row, 11].Merge = true;
            ws.Cells[row, 10].Value = item.TotalAmount;
            row++;
        }

        ws.Cells[row, 1, row, 5].Merge = true;
        ws.Cells[row, 1].Value = "Tổng:";
        ws.Cells[row, 1].Style.Font.Bold = true;
        ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        ws.Cells[row, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

        ws.Cells[row, 6, row, 7].Merge = true;
        ws.Cells[row, 6].Formula = $"SUM(F4:F{row - 1})";
        ws.Cells[row, 6].Style.Font.Bold = true;

        ws.Cells[row, 8, row, 9].Merge = true;
        ws.Cells[row, 10, row, 11].Merge = true;
        ws.Cells[row, 10].Formula = $"SUM(J4:J{row - 1})";
        ws.Cells[row, 10].Style.Font.Bold = true;


        var tableRange = ws.Cells[3, 1, row, 11];

        tableRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        tableRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        tableRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        tableRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;

        // Viền từng ô (tương thích mọi EPPlus)
        for (int r = 3; r <= row; r++)
        {
            for (int c = 1; c <= 11; c++)
            {
                ws.Cells[r, c].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            }
        }
        ws.Cells.AutoFitColumns();

        return package.GetAsByteArray();
    }
}
