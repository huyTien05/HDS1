using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Email;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IEmailQueueService _emailQueueService;

        public EmailController(IEmailService emailService, IEmailQueueService emailQueueService)
        {
            _emailService = emailService;
            _emailQueueService = emailQueueService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
        {
            try
            {
                await _emailService.SendAsync(request);
                _emailQueueService.AddSuccess(request);

                return Ok(new
                {
                    message = "Gửi Email thành công!"
                });
            }
            catch (ArgumentException ex)
            {
                _emailQueueService.AddFail(request, ex.Message);
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                // Lỗi cấu hình SMTP
                _emailQueueService.AddFail(request, ex.Message);
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                // Lỗi không lường trước (SMTP connect, auth fail...)
                _emailQueueService.AddFail(request, ex.Message);
                return StatusCode(500, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("send-gmail")]
        public async Task<IActionResult> SendGmail([FromBody] EmailRequest request)
        {
            try
            {
                await _emailService.SendAsync(request);
                _emailQueueService.AddSuccess(request);

                return Ok(new
                {
                    message = "Gửi Email qua Gmail API thành công!"
                });
            }
            catch (ArgumentException ex)
            {
                _emailQueueService.AddFail(request, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Thường là chưa OAuth / thiếu gmail_token.json
                _emailQueueService.AddFail(request, ex.Message);
                return BadRequest(new
                {
                    message = "Chưa xác thực Gmail hoặc token không hợp lệ",
                    detail = ex.Message
                });
            }
            catch (Exception ex)
            {
                _emailQueueService.AddFail(request, ex.Message);
                return StatusCode(500, new
                {
                    message = "Lỗi khi gửi Gmail API",
                    detail = ex.Message
                });
            }
        }


        [HttpGet("queue")]
        public IActionResult GetQueue()
        {
            return Ok(_emailQueueService.GetAll());
        }
    }
}
