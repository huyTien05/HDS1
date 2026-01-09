using WebApi.Models;

namespace WebApi.Services.SaleOut
{
    public interface ISaleOutSumService
    {
        Task<SaleOutSumRPModel> GetSumASyc(SaleOutSumModel model);
    }
}