using WebApi.Models;

namespace WebApi.Services.MasterProduct
{
    public interface IMasterProductService
    {
        Task<MasterProductResultModel<MasterProductPageModel>> GetListAsync(
            int pageIndex,
            int pageSize,
            string? field,
            string? keyword);
        Task<MasterProductPageModel> CreateAsync(MasterProductPageModel model);
        // Task<MasterProductPageModel> UpdateAsync(MasterProductPageModel model);
        Task<MasterProductPageModel> UpdateAsync(Guid id, MasterProductPageModel model);
        Task DeleteAsync(Guid id);
    }

}