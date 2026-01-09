namespace WebApi.Services.SaleOut 
{
    public interface ISaleOutTemplateService
    {
        byte[] GenerateTemplate();
        Task<object> UploadExAsync(IFormFile file);
    }
}