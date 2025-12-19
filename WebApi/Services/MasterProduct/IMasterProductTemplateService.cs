namespace WebApi.Services.MasterProduct 
{
    public interface IMasterProductTemplateService
    {
        byte[] GenerateTemplate();
        Task<object> UploadExcelAsync(IFormFile file);
    }
}