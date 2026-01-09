namespace WebApi.Models
{
    public class EmailQueue
    {
        public Guid Id { get; set; }
        public string To { get; set; } = "";
        public string Subject { get; set; } = "";
        public string Body { get; set; } = "";
        public DateTime SentAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
    }
}