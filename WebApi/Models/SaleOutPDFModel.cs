namespace WebApi.Models
{
    public class SaleOutPDFModel
    {
        public string? CustomerName{get; set;}
        public string? SaleOutNo{ get; set;}
        public Guid ProductId { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public int OrderDate { get; set; }
    }
}