namespace WebApi.Models
{
    public class SaleOutSumRPModel
    {
        // key = column_key, value = tổng
        public Dictionary<string, decimal> Sums { get; set; } = new();
    }
}