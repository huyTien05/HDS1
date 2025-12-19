import { useState } from "react";
import "./UpLoadPage.css";

const API_URL = "http://localhost:5225/api/master-product/upload-excel";

function UploadPage({ onClose, onUploaded}) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx")) {
      setMessage("❌ Vui lòng chọn file Excel (.xlsx)");
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Vui lòng chọn file trước khi tải lên");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "❌ Upload thất bại");
        return;
      }

      setMessage(`✅ Upload thành công ${data.successCount} sản phẩm`);
      onUploaded?.();
      
    } catch {
      setMessage("❌ Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-overlay">
      <div className="upload-modal">
        <h3>Tải lên tập tin</h3>

        <label className="btn-choose">
          Chọn tệp
          <input
            type="file"
            accept=".xlsx"
            hidden
            onChange={handleFileChange}
          />
        </label>

        {file && <div className="file-name">📄 {file.name}</div>}

        {message && <div className="message">{message}</div>}

        <div className="actions">
          <button onClick={onClose}>Đóng</button>
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;