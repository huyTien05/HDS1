using WebApi.Models;

namespace WebApi.Services.Email
{
    public class EmailQueueService : IEmailQueueService
    {
        private static readonly List<EmailQueue> _queue = new();
        private static readonly object _lock = new();

        public void AddSuccess(EmailRequest req)
        {
            lock (_lock)
            {
                _queue.Insert(0, new EmailQueue
                {
                    Id = Guid.NewGuid(),
                    To = req.To ?? "",
                    Subject = req.Subject ?? "",
                    Body = req.Body ?? "",
                    IsSuccess = true,
                    SentAt = DateTime.Now
                });
            }
        }

        public void AddFail(EmailRequest req, string error)
        {
            lock (_lock)
            {
                _queue.Insert(0, new EmailQueue
                {
                    Id = Guid.NewGuid(),
                    To = req.To ?? "",
                    Subject = req.Subject ?? "",
                    Body = req.Body ?? "",
                    IsSuccess = false,
                    ErrorMessage = error,
                    SentAt = DateTime.Now
                });
            }
        }
        public List<EmailQueue> GetAll()
        {
            lock (_lock)
            {
                return _queue
                    .OrderByDescending(x => x.SentAt)
                    .ToList();
            }
        }
    }
}
