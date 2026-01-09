namespace WebApi.Models
{
    public class SaleOutPageModel
    {
        public required Guid Id { get; set; }
        public string? CustomerPoNo { get; set; }
        public int OrderDate { get; set; }
        public string? CustomerName { get; set; }
        public Guid ProductId { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? Price { get; set; }
        public decimal? Amount { get; set; }
        public decimal? QuantityPerBox { get; set; }
        public decimal? BoxQuantity { get; set; }
    }
}
