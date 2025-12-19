using WebApi.Data;
using WebApi.Services.MasterProduct;
using OfficeOpenXml;

var builder = WebApplication.CreateBuilder(args);

// =====================
// SERVICES
// =====================

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Dapper
builder.Services.AddSingleton<DapperContext>();

// CORS
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
