namespace WebApi.Models
{
    public class SaleOutReportModel
    {
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal AvgPrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}