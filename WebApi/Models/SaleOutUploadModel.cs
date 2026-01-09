namespace WebApi.Models
{
    public class UploadExResult
        {
            public int SuccessCount { get; set; }
            public int ErrorCount { get; set; }
            public List<UploadExError> Errors { get; set; } = new();
        }

        public class UploadExError
        {
            public int Row { get; set; }
            public string Message { get; set; } = string.Empty;
        }
}