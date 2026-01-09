namespace WebApi.Services.SaleOut
{
    public interface ISaleOutReportService
    {
        Task<byte[]> ExportReportAsync(int startDate, int endDate);
    }
}