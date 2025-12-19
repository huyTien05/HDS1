namespace WebApi.Models
{
    public class MasterProductPageModel
    {
        public Guid Id { get; set; }
        public required string ProductCode { get; set; }
        public required string ProductName { get; set; }
        public required string Unit { get; set; }
        public required string Specification { get; set; }
        public int QuantityPerBox { get; set; }
        public decimal ProductWeight { get; set; }
    }

}