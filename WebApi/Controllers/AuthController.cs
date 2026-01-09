using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Gmail.v1;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
public class AuthController : ControllerBase
{
    private const string RedirectUri = "http://localhost:5225/signin-google";

    [HttpGet("/signin-google")]
    public async Task<IActionResult> SignInGoogle([FromQuery] string? code)
    {
        var secrets = GoogleClientSecrets
            .FromFile("credentials.json")
            .Secrets;

        var flow = new GoogleAuthorizationCodeFlow(
            new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = secrets,
                Scopes = new[] { GmailService.Scope.GmailSend }
            }
        );

        //Chưa có code → redirect Google (YÊU CẦU REFRESH TOKEN)
        if (string.IsNullOrEmpty(code))
        {
           var authRequest = new GoogleAuthorizationCodeRequestUrl(
                new Uri("https://accounts.google.com/o/oauth2/auth"))
            {
                ClientId = secrets.ClientId,
                RedirectUri = RedirectUri,
                Scope = GmailService.Scope.GmailSend,
                AccessType = "offline",   //refresh
                Prompt = "consent"        
            };

            return Redirect(authRequest.Build().ToString());
        }

        //Có code → đổi token
        TokenResponse token = await flow.ExchangeCodeForTokenAsync(
            userId: "gmail-user",
            code: code,
            redirectUri: RedirectUri,
            taskCancellationToken: CancellationToken.None
        );

        //Lưu token
        System.IO.File.WriteAllText(
            "gmail_token.json",
            JsonSerializer.Serialize(token)
        );

        return Ok("✅ OAuth Gmail thành công – token đã được lưu");
    }
}

