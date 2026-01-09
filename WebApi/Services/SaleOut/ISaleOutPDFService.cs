using WebApi.Models;

namespace WebApi.Services.SaleOut
{
    public interface ISaleOutPDFService
    {
        Task<string> GenerateSaleOutNoAsync();
        Task<List<SaleOutPDFModel>> GetSaleOutPDFAsync(string saleOutNo);
        Task<byte[]> PrintSaleOutPdfAsync(string saleOutNo);
    }
}