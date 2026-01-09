
// import "./Form1.css";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box
} from "@mui/material";

const API_URL = "http://localhost:5225/api/sale-out";

function PDFForm({ saleOutNos, setShowPrintPopup }) {
//   const [saleOutNo, setSaleOutNo] = useState("");

const [saleOutNo, setSaleOutNo] = useState("");

//   useEffect(() => {
//     const loadSaleOutNo = async () => {
//       const res = await fetch(`${API_URL}/generate-no`);
//       const data = await res.json();
//       setSaleOutNo(data.saleOutNo);
//     };

//     loadSaleOutNo();
//   }, []);

  // const handlePrint = () => {
  //   if (!saleOutNo) {
  //     alert("Vui lòng chọn số phiếu");
  //     return;
  //   }

    // window.open(
    //   `${API_URL}/${saleOutNo}`,
    //    "_blank"
    // );

    const handlePrint = async () => {
    if (!saleOutNo) {
      alert("Vui lòng chọn số phiếu");
      return;
    }

    const res = await fetch(`${API_URL}/${saleOutNo}`);
    if (!res.ok) {
      alert("Không thể xuất PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SaleOut_${saleOutNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    // <div className="modal-overlay">
    //   <div className="modal-content">
    //     <h3>In phiếu</h3>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label> Số phiếu <span className="required">*</span> </label>

    //         <select value={saleOutNo}
    //                 onChange={(e) => setSaleOutNo(e.target.value)}>
    //             <option value="">-- Chọn số phiếu --</option>
    //           {saleOutNos.map(no => (
    //             <option key={no} value={no}>{no}</option>))}
    //         </select>
    //       </div>
    //     </div>

    //     <div className="form-actions">
    //       <button className="btn-cancel"
    //               onClick={() => setShowPrintPopup(false)}> Đóng </button>

    //       <button className="btn-save"
    //               onClick={handlePrint}> Xuất dữ liệu </button>
    //     </div>
    //   </div>
    // </div>

    <Dialog
      open
      onClose={() => setShowPrintPopup(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>In phiếu</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            label={<>Số phiếu <span style={{ color: "red" }}>*</span></>}
            value={saleOutNo}
            onChange={(e) => setSaleOutNo(e.target.value)}
          >
            <MenuItem value="">-- Chọn số phiếu --</MenuItem>
            {saleOutNos.map(no => (
              <MenuItem key={no} value={no}>
                {no}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setShowPrintPopup(false)}>
          Đóng
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handlePrint}
          disabled={!saleOutNo}
        >
          Xuất dữ liệu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PDFForm;