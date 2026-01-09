using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using WebApi.Models;

namespace WebApi.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendAsync(EmailRequest request)
        {
            var smtp = _config.GetSection("Smtp");

            var host = smtp.GetValue<string>("Host")
                ?? throw new Exception("SMTP Host missing");

            var port = smtp.GetValue<int>("Port");

            var username = smtp.GetValue<string>("Username")
                ?? throw new Exception("SMTP Username missing");

            var password = smtp.GetValue<string>("Password"); 
            //Password có thể null nếu dùng Integrated

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("HDSoft System", username));
            message.To.Add(MailboxAddress.Parse(
                request.To ?? throw new Exception("To email required")
            ));
            message.Subject = request.Subject ?? "";
            message.Body = new TextPart("html")
            {
                Text = request.Body ?? ""
            };

            using var client = new SmtpClient();

            // Required cho một số SMTP nội bộ
            client.CheckCertificateRevocation = false;

            if (port == 465)
            {
                await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
            }
            else
            {
                await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable);
            }

            // AUTHENTICATION LOGIC
            if (client.Capabilities.HasFlag(SmtpCapabilities.Authentication))
            {
                if (client.AuthenticationMechanisms.Contains("NTLM"))
                {
                    //Integrated Authentication (Windows / AD)
                    await client.AuthenticateAsync(new SaslMechanismNtlm());
                    // Console.WriteLine("oke");
                }
                else if (
                    client.AuthenticationMechanisms.Contains("LOGIN") ||
                    client.AuthenticationMechanisms.Contains("PLAIN")
                )
                {
                    //Basic Authentication
                    if (string.IsNullOrEmpty(password))
                        throw new Exception("Thiếu mật khẩu cho phương thức xác thực này");

                    await client.AuthenticateAsync(username, password);
                    // Console.WriteLine("not oke");
                }
                else
                {
                    throw new Exception("Không hỗ trợ phương thức xác thực integrated");
                }
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);







            // public async Task SendAsync(EmailRequest request)
    //         {
    //             var smtp = _config.GetSection("Smtp");

    //             var host = smtp.GetValue<string>("Host")
    //                 ?? throw new Exception("SMTP Host missing");

    //             var port = smtp.GetValue<int>("Port");

    //             var username = smtp.GetValue<string>("Username")
    //                 ?? throw new Exception("SMTP Username missing");

    //             var password = smtp.GetValue<string>("Password")
    //                 ?? throw new Exception("SMTP Password missing");

    //             var message = new MimeMessage();
    //             message.From.Add(new MailboxAddress("HDSoft System", username));
    //             message.To.Add(MailboxAddress.Parse(
    //                 request.To ?? throw new Exception("To email required")
    //             ));
    //             message.Subject = request.Subject ?? "";

    //             message.Body = new TextPart("html")
    //             {
    //                 Text = request.Body ?? ""
    //             };

    //             using var client = new SmtpClient();

    //             // Console.WriteLine(">>> start SEND MAIL");
    //             if (port == 465)
    //             {
    //                 // SSL IMPLICIT
    //                 await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
    //             }
    //             else
    //             {
    //                 // STARTTLS (587)
    //                 await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
    //             }
    //             await client.AuthenticateAsync(username, password);
    //             await client.SendAsync(message);
    //             await client.DisconnectAsync(true);

    //             // Console.WriteLine(">>> END SEND MAIL");
    //         }
        }
    }
}


