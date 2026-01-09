namespace WebApi.Models
{
    public class SaleOutAdd
    {
        public string? CustomerPoNo { get; set; }
        public int OrderDate { get; set; }
        public string? CustomerName { get; set; }
        public string? ProductCode { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
        public decimal? QuantityPerBox { get; set; }
        public string? SaleOutNo{get; set;}
    }
}