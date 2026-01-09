import { useState } from "react";
// import "./UpLoadPage.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

const API_URL = "http://localhost:5225/api/master-product/upload-excel";

function UploadPage({ onClose, onUploaded}) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

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
    setErrors([]);
    setSuccessCount(0);

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

      setSuccessCount(data.successCount || 0);
      setErrors(data.errors || []);

      if (data.successCount > 0) {
        onUploaded?.();
      }

      if (data.errorCount === 0) {
        setMessage(`✅ Upload thành công ${data.successCount} dòng`);
      } else {
        setMessage(`⚠️ Upload xong, có ${data.errorCount} dòng lỗi`);
      }
      
    } catch {
      setMessage("❌ Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="upload-overlay">
    //   <div className="upload-modal">
    //     <h3>Tải lên tập tin</h3>

    //     <label className="btn-choose">
    //       Chọn tệp
    //       <input
    //         type="file"
    //         accept=".xlsx"
    //         hidden
    //         onChange={handleFileChange}
    //       />
    //     </label>

    //     {file && <div className="file-name">📄 {file.name}</div>}

    //     {message && <div className="message">{message}</div>}

    //     {successCount > 0 && (
    //       <div className="success-box">
    //         ✅ Thành công: <b>{successCount}</b> dòng
    //       </div>
    //     )}

    //     {errors.length > 0 && (
    //       <div className="error-box">
    //         <div className="error-title">❌ Danh sách lỗi</div>
    //         <table className="error-table">
    //           <thead>
    //             <tr>
    //               <th>Dòng</th>
    //               <th>Lý do</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {errors.map((e, i) => (
    //               <tr key={i}>
    //                 <td>{e.row}</td>
    //                 <td>{e.message}</td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     )}

    //     <div className="actions">
    //       <button onClick={onClose}>Đóng</button>
    //       <button style={{border: "1px solid black", backgroundColor:"#13cc5dff"}} onClick={handleUpload} disabled={loading}>
    //         {loading ? "Đang tải..." : "Tải lên"}
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <Dialog open onClose={() => setShowEditPopup(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Tải lên tập tin</DialogTitle>

      <DialogContent dividers>
        {/* Chọn file */}
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" component="label">
            Chọn tệp
            <input
              type="file"
              hidden
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography sx={{ mt: 1 }}>
              📄 {file.name}
            </Typography>
          )}
        </Box>

        {message && (
          <Typography color="error" sx={{ mb: 1 }}>
            {message}
          </Typography>
        )}

        {successCount > 0 && (
          <Box sx={{ mb: 2, color: "green" }}>
            ✅ Thành công: <b>{successCount}</b> dòng
          </Box>
        )}

        {errors.length > 0 && (
          <Box>
            <Typography color="error" fontWeight="bold" mb={1}>
              ❌ Danh sách lỗi
            </Typography>

            <Table size="small" bordered>
              <TableHead>
                <TableRow>
                  <TableCell>Dòng</TableCell>
                  <TableCell>Lý do</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errors.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{e.row}</TableCell>
                    <TableCell>{e.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Tải lên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadPage;