namespace WebApi.Models
{
    public class MasterProductResultModel<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    }
}