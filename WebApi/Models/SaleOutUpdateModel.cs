namespace WebApi.Models
{
    public class SaleOutUpdate
    {
        public Guid Id { get; set; }
        public decimal Quantity { get; set; }
        public decimal? QuantityPerBox { get; set; }
        public decimal Price { get; set; }
    }
}