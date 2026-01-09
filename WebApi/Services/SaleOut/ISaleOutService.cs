using WebApi.Models;

namespace WebApi.Services.SaleOut
{
    public interface ISaleOutService
    {
                // Task<IEnumerable<SaleOutViewModel>> GetListAsync( string? field, string? keyword);
                Task<SaleOutResultModel<SaleOutViewModel>> GetListAsync(int pageIndex, int pageSize, string? field, string? keyword, string? sort);

                Task<SaleOutViewModel> AddAsync(SaleOutAdd add);
                Task<SaleOutViewModel> UpdateAsync(SaleOutUpdate model);
                Task DeleteAsync(Guid id);

    }
}


