namespace WebApi.Models
{
    public class SaleOutResultModel<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    }
}