using WebApi.Models;
using WebApi.Services.SaleOut;
using WebApi.Data;
using Dapper;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using QRCoder;

namespace WebApi.Services.SaleOut
{
    public class SaleOutPDFService : ISaleOutPDFService
    {
        private readonly DapperContext _context;

        public SaleOutPDFService(DapperContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateSaleOutNoAsync()
        {
            using var connection = _context.CreateConnection();

            var prefix = $"STO{DateTime.Now:yyyyMM}";

            var lastNo = await connection.ExecuteScalarAsync<string>(
                @"SELECT MAX(SaleOutNo)
                FROM SaleOut
                WHERE SaleOutNo LIKE @Prefix + '%'",
                new { Prefix = prefix });

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastNo))
            {
                var current = int.Parse(lastNo.Substring(9));
                nextNumber = current + 1;
            }

            return $"{prefix}{nextNumber:D4}";
        }
        public async Task<List<SaleOutPDFModel>> GetSaleOutPDFAsync(string saleOutNo)
        {
            using var connection = _context.CreateConnection();

            var sql = @"
                SELECT
                    so.SaleOutNo,
                    so.CustomerName,
                    so.ProductId,
                    mp.ProductCode,
                    mp.ProductName,
                    so.Quantity,
                    so.Price,
                    so.Amount
                FROM SaleOut so
                JOIN MasterProduct mp ON mp.Id = so.ProductId
                WHERE so.SaleOutNo = @SaleOutNo
                ORDER BY mp.ProductCode";

            var result = await connection.QueryAsync<SaleOutPDFModel>( sql, new { SaleOutNo = saleOutNo });
            return result.ToList();
        }

         public async Task<byte[]> PrintSaleOutPdfAsync(string saleOutNo)
        {
            var data = await GetSaleOutPDFAsync(saleOutNo);

            if (!data.Any())
                throw new Exception("Không tìm thấy phiếu xuất");

            QuestPDF.Settings.License = LicenseType.Community;

            var header = data.First();
            var totalQuantity = data.Sum(x => x.Quantity);
            var totalPrice = data.Sum(x => x.Price);
            var totalAmount = data.Sum(x => x.Amount);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(25);
                    page.DefaultTextStyle(x =>
                        x.FontSize(11).FontFamily("Times New Roman"));

                    page.Content().Column(col =>
                    {
                        col.Item().Border(1).Padding(10).Column(column =>
                        {
                            // ===== TITLE =====
                            column.Item().AlignCenter()
                                .Text("PHIẾU XUẤT HÀNG")
                                .FontSize(18)
                                .Bold();

                            column.Item().PaddingTop(10);

                            // ===== INFO + QR =====
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().PaddingTop(20).Column(left =>
                                {
                                    left.Item().Row(r =>
                                    {
                                        r.ConstantItem(100).Text("Khách hàng:").Bold();
                                        r.RelativeItem().Text(header.CustomerName);
                                    });

                                    left.Item().PaddingTop(20).Row(r =>
                                    {
                                        r.ConstantItem(100).Text("Ngày xuất kho:").Bold();
                                        r.RelativeItem()
                                            .Text(DateTime.Today.ToString("dd/MM/yyyy"));
                                    });
                                });

                                row.ConstantItem(260).Row(right =>
                                {
                                    right.RelativeItem().PaddingTop(20).Row(r =>
                                    {
                                        r.ConstantItem(70).Text("Số phiếu:").Bold();
                                        r.RelativeItem().Text(header.SaleOutNo);
                                    });

                                    // --- QR ---
                                    right.ConstantItem(100).PaddingTop(-30).Column
                                    (qr =>{
                                            if (string.IsNullOrWhiteSpace(header.SaleOutNo))
                                            throw new Exception("SaleOutNo không hợp lệ để tạo QR Code");
                                            var qrBytes = GenerateQrCode(header.SaleOutNo);
                                            qr.Item().Image(qrBytes);
                                        });
                                });
                            });
                        });

                        col.Item().PaddingVertical(10);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(35); 
                                c.RelativeColumn(2); 
                                c.RelativeColumn(3);  
                                c.RelativeColumn(2);  
                                c.RelativeColumn(2); 
                                c.RelativeColumn(2);  
                            });

                            // ===== HEADER =====
                            table.Header(h =>
                            {
                                h.Cell().Element(CellHeader).Text("STT");
                                h.Cell().Element(CellHeader).Text("Mã sản phẩm");
                                h.Cell().Element(CellHeader).Text("Tên sản phẩm");
                                h.Cell().Element(CellHeader).Text("Số lượng");
                                h.Cell().Element(CellHeader).Text("Đơn giá");
                                h.Cell().Element(CellHeader).Text("Thành tiền");
                            });

                            // ===== BODY =====
                            int index = 1;
                            foreach (var item in data)
                            {
                                table.Cell().Element(CellBody).AlignCenter()
                                    .Text(index++.ToString());

                                table.Cell().Element(CellBody)
                                    .Text(item.ProductCode);

                                table.Cell().Element(CellBody)
                                    .Text(item.ProductName);

                                table.Cell().Element(CellBody).AlignRight()
                                    .Text(item.Quantity.ToString("N0"));

                                table.Cell().Element(CellBody).AlignRight()
                                    .Text(item.Price.ToString("N0"));

                                table.Cell().Element(CellBody).AlignRight()
                                    .Text(item.Amount.ToString("N0"));
                            }

                            // ===== TOTAL ROW=====
                            table.Cell().ColumnSpan(3)
                                .Element(CellBody).AlignCenter().Text("Tổng:").Bold();

                            table.Cell().Element(CellBody).AlignRight()
                                .Text(totalQuantity.ToString("N0")).Bold();
                            table.Cell().Element(CellBody).AlignRight()
                                .Text(totalPrice.ToString("N0")).Bold();
                            table.Cell().Element(CellBody).AlignRight()
                                .Text(totalAmount.ToString("N0")).Bold();
                        });

                        col.Item().PaddingTop(30);

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().Text("Người lập phiếu").Bold();
                                c.Item().Height(60); 
                            });

                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().Text("Người duyệt").Bold();
                                c.Item().Height(60);
                            });

                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().Text("Thủ kho").Bold();
                                c.Item().Height(60);
                            });

                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().Text("Người nhận").Bold();
                                c.Item().Height(60);
                            });
                        });
                    });
                });
            });

            return document.GeneratePdf();
        }

        static IContainer CellHeader(IContainer container)
        {
            return container
                .Border(1)
                .Padding(5)
                .AlignMiddle()
                .AlignCenter()
                .DefaultTextStyle(x => x.Bold());
        }
        IContainer CellBody(IContainer container)
        {
            return container
                .Border(1)
                .Padding(5)
                .AlignMiddle();
        }

        private static byte[] GenerateQrCode(string content)
        {
            using var generator = new QRCodeGenerator();
            using var data = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(data);

            return qrCode.GetGraphic(20);
        }


    }
}
