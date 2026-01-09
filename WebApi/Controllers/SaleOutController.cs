using Microsoft.AspNetCore.Mvc;
using WebApi.Services.SaleOut;
using WebApi.Models;
using WebApi.Data;
using Dapper;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/sale-out")]
    public class SaleOutController : ControllerBase
    {
        private readonly ISaleOutService _saleOutService;
        private readonly ISaleOutTemplateService _templateService;
        private readonly ISaleOutReportService _reportService;
        private readonly ISaleOutSumService _sumService;
        private readonly ISaleOutPDFService _pdfService;
        private readonly DapperContext _context;

        public SaleOutController(DapperContext context, ISaleOutService saleOutService, ISaleOutTemplateService templateService, ISaleOutReportService reportService,ISaleOutPDFService pdfService, ISaleOutSumService sumService)
        {
            _saleOutService = saleOutService;
            _templateService = templateService;
            _reportService = reportService;
            _pdfService = pdfService;
            _context = context;
            _sumService = sumService;
        }

        // [HttpGet]
        // public async Task<IActionResult> GetList(
        //     [FromQuery] string? field,
        //     [FromQuery] string? keyword)
        // {
        //     var result = await _saleOutService.GetListAsync(field, keyword);
        //     return Ok(result);
        // }

        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? field = null,
            [FromQuery] string? keyword = null,
            [FromQuery] string? sort = null)
        {
            var result = await _saleOutService.GetListAsync(
                pageIndex,
                pageSize,
                field,
                keyword,
                sort
            );
            return Ok(result);
        }

        [HttpPost("add-form")]
        public async Task<IActionResult> Add([FromBody] SaleOutAdd add)
        {
            try
            {
                var result = await _saleOutService.AddAsync(add);
                return Ok(result);
            }
            // catch (Exception ex)
            // {
            //     return BadRequest(new { message = ex.Message });
            // }
            catch (Exception ex)
{
    return BadRequest(new
    {
        message = ex.Message,
        stack = ex.StackTrace
    });
}
        }

        [HttpPut("edit-form/{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SaleOutUpdate model)
        {
            if (id != model.Id) return BadRequest();

            try
            {
                var result = await _saleOutService.UpdateAsync(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-form/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _saleOutService.DeleteAsync(id);
                return Ok(new { message = "Deleted" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("download-template")]
        public IActionResult DownloadTemplate()
        {
            var bytes = _templateService.GenerateTemplate();

            return File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "SaleOut_Template.xlsx"
            );
        }

        [HttpPost("upload-template")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            var result = await _templateService.UploadExAsync(file);
            return Ok(result);
        }

        [HttpGet("export-report")]
        public async Task<IActionResult> ExportReport(
            [FromQuery] int startDate,
            [FromQuery] int endDate)
            {
                var fileBytes = await _reportService.ExportReportAsync(startDate, endDate);

                var fileName = $"BaoCaoDoanhThu_{startDate}_{endDate}.xlsx";

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName
                );
            }

        // [HttpGet("generate-no")]
        // public async Task<IActionResult> GenerateNo()
        // {
        //     var no = await _pdfService.GenerateSaleOutNoAsync();
        //     return Ok(new { saleOutNo = no });
        // }

        [HttpGet("nos")]
        public async Task<IActionResult> GetSaleOutNos()
        {
            using var conn = _context.CreateConnection();

            var list = await conn.QueryAsync<string>(
                @"SELECT DISTINCT SaleOutNo
                FROM SaleOut
                WHERE SaleOutNo IS NOT NULL
                ORDER BY SaleOutNo DESC");

            return Ok(list.ToList()); // ✅ List<string>
        }

        [HttpGet("{saleOutNo}")]
        public async Task<IActionResult> PrintSaleOut(string saleOutNo)
        {
            if (string.IsNullOrWhiteSpace(saleOutNo))
                return BadRequest("SaleOutNo không hợp lệ");

            try
            {
                var pdfBytes = await _pdfService.PrintSaleOutPdfAsync(saleOutNo);

                return File(
                    pdfBytes,
                    "application/pdf",
                    $"PhieuXuat_{saleOutNo}.pdf"
                );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("sum")]
        public async Task<IActionResult> GetSaleOutSum(
            [FromBody] SaleOutSumModel model)
        {
            var result = await _sumService.GetSumASyc(model);
            return Ok(result);
        }
    }
}