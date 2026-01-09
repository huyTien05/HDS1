using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using Google.Apis.Auth.OAuth2.Responses;
using System.Text;
using System.Text.Json;
using WebApi.Models;

namespace WebApi.Services.Email
{
    public class EmailAPI : IEmailService
    {
        private const string TokenFile = "gmail_token.json";

        public async Task SendAsync(EmailRequest request)
        {
            // 1️⃣ Validate
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.To))
                throw new ArgumentException("To is required");

            // 2️⃣ Tạo GmailService
            var gmail = CreateGmailService();

            // 3️⃣ Tạo email message
            var message = CreateMessage(
                request.To,
                request.Subject,
                request.Body
            );

            // 4️⃣ Gửi email (async)
            await gmail.Users.Messages.Send(message, "me").ExecuteAsync();
        }

        // ================= PRIVATE =================

        private GmailService CreateGmailService()
        {
            if (!File.Exists(TokenFile))
                throw new Exception("Gmail token not found. Please OAuth again.");

            var token = JsonSerializer.Deserialize<TokenResponse>(
                File.ReadAllText(TokenFile)
            )!;

            var credential = GoogleCredential
                .FromAccessToken(token.AccessToken);

            return new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "Email API"
            });
        }

        private Message CreateMessage(string to, string subject, string body)
        {
            var raw = new StringBuilder();
            raw.AppendLine($"To: {to}");
            raw.AppendLine("Content-Type: text/plain; charset=utf-8");
            raw.AppendLine("MIME-Version: 1.0");
            raw.AppendLine($"Subject: {subject}");
            raw.AppendLine();
            raw.AppendLine(body ?? "");

            return new Message
            {
                Raw = Base64UrlEncode(raw.ToString())
            };
        }

        private string Base64UrlEncode(string input)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(input))
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }
    }
}