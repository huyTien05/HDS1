using Microsoft.AspNetCore.Mvc;
using WebApi.Services.MasterProduct;
using WebApi.Models;

namespace WebApi.Controllers
{
    [ApiController]
    // [Route("api/[controller]")]
    [Route("api/master-product")]

    public class MasterProductController : ControllerBase
    {
        private readonly IMasterProductService _service;
        private readonly IMasterProductTemplateService _productService;

        public MasterProductController(IMasterProductService service, IMasterProductTemplateService productService)
        {
            _service = service;
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] string? field,
            [FromQuery] string? keyword)
        {
            var result = await _service.GetListAsync(field, keyword);
            return Ok(result);
        }

        [HttpPost("add-page")]
        public async Task<IActionResult> Create(
            [FromBody] MasterProductPageModel model)
        {
            try
            {
                var created = await _service.CreateAsync(model);
                return Ok(created);
            }
            catch (Exception ex) when (ex.Message == "PRODUCT_CODE_EXISTS")
            {
                return BadRequest(new { message = "Mã sản phẩm đã tồn tại" });
            }
        }

        [HttpPut("edit-page/{id}")]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] MasterProductPageModel model)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, model);
                return Ok(updated);
            }
            catch (Exception ex) when (ex.Message == "NOT_FOUND")
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("delete-page/{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(); // hoặc NoContent()
            }
            catch (Exception ex) when (ex.Message == "NOT_FOUND")
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }
        }

        [HttpGet("download-template")]
        public IActionResult DownloadTemplate()
        {
            var bytes = _productService.GenerateTemplate();

            return File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "MasterProduct_Template.xlsx"
            );
        }

        [HttpPost("upload-excel")]
        public async Task<IActionResult> UploadExcel([FromForm] IFormFile file)
        {
            try
            {
                var result = await _productService.UploadExcelAsync(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}