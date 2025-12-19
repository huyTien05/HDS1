using WebApi.Models;

namespace WebApi.Services.MasterProduct
{
    public interface IMasterProductService
    {
        Task<IEnumerable<MasterProductPageModel>> GetListAsync(
            string? field,
            string? keyword);
        Task<MasterProductPageModel> CreateAsync(MasterProductPageModel model);
        // Task<MasterProductPageModel> UpdateAsync(MasterProductPageModel model);
        Task<MasterProductPageModel> UpdateAsync(Guid id, MasterProductPageModel model);
        Task DeleteAsync(Guid id);
    }

}