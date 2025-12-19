namespace WebApi.Models
{
    public class UploadExcelResult
        {
            public int SuccessCount { get; set; }
            public int ErrorCount { get; set; }
            public List<UploadExcelError> Errors { get; set; } = new();
        }

        public class UploadExcelError
        {
            public int Row { get; set; }
            public string Message { get; set; } = string.Empty;
        }
}
