using WebApi.Models;
using System.Threading.Tasks;

namespace WebApi.Services.Email
{
    public interface IEmailService
    {
        Task SendAsync(EmailRequest request);
    }
}