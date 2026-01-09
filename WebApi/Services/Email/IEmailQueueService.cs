using WebApi.Models;

namespace WebApi.Services.Email
{
    public interface IEmailQueueService
    {
        void AddSuccess(EmailRequest request);
        void AddFail(EmailRequest request, string error);
        List<EmailQueue> GetAll();
    }
}
