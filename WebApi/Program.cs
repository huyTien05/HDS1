using WebApi.Data;
using WebApi.Services.MasterProduct;
using OfficeOpenXml;
using WebApi.Services.SaleOut;
using WebApi.Services.Email;



var builder = WebApplication.CreateBuilder(args);

// =====================
// SERVICES
// =====================

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.OperationFilter<FileUploadOperationFilter>();
// });

// Dapper
// builder.Services.AddSingleton<DapperContext>();

// CORS
// Frontend khác domain gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Services
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
builder.Services.AddScoped<IMasterProductService, MasterProductService>();
builder.Services.AddScoped<IMasterProductTemplateService, MasterProductTemplateService>();
// ExcelPackage.License = License.NonCommercial;

builder.Services.AddScoped<DapperContext>();
builder.Services.AddScoped<ISaleOutService, SaleOutService>();
builder.Services.AddScoped<ISaleOutTemplateService, SaleOutTemplateService>();
builder.Services.AddScoped<ISaleOutReportService, SaleOutReportService>();
builder.Services.AddScoped<ISaleOutPDFService, SaleOutPDFService>();
builder.Services.AddScoped<ISaleOutSumService, SaleOutSumService>();

builder.Services.AddScoped<IEmailService, EmailService>();
// builder.Services.AddScoped<IEmailQueueService, EmailQueueService>();
builder.Services.AddSingleton<IEmailQueueService, EmailQueueService>();


// =====================
// BUILD APP
// =====================
var app = builder.Build();

// =====================
// MIDDLEWARE
// =====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS phải đặt TRƯỚC MapControllers
app.UseCors("AllowAll");

// app.UseHttpsRedirection();

// Map controller
app.MapControllers();
app.Run();
