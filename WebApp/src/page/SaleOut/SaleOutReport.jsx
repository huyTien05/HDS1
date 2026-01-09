// import "./SaleOutReport.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from "@mui/material";

function SaleOutReport({ onClose, reportFilter, setReportFilter }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    if (!reportFilter.startDate || !reportFilter.endDate) {
      alert("Vui lòng chọn đầy đủ từ ngày - đến ngày");
      return;
    }

    // yyyy-MM-dd -> yyyyMMdd
    const startDate = reportFilter.startDate.replaceAll("-", "");
    const endDate = reportFilter.endDate.replaceAll("-", "");

    window.location.href =
      `http://localhost:5225/api/sale-out/export-report?startDate=${startDate}&endDate=${endDate}`;
  };

  return (
    // <div className="modal-overlay">
    //   <div className="modal-content">
    //     <h3>Báo cáo doanh thu</h3>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label>Từ ngày</label>
    //         <input
    //           type="date"
    //           name="startDate"
    //           value={reportFilter.startDate}
    //           onChange={handleChange}
    //         />
    //       </div>

    //       <div className="form-group">
    //         <label>Đến ngày</label>
    //         <input
    //           type="date"
    //           name="endDate"
    //           value={reportFilter.endDate}
    //           onChange={handleChange}
    //         />
    //       </div>
    //     </div>

    //     <div className="modal-actions">
    //       <button className="btn-cancel" onClick={onClose}>Đóng</button>
    //       <button className="btn-save1" onClick={handleExport}>Xuất dữ liệu</button>
    //     </div>
    //   </div>
    // </div>

    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Báo cáo doanh thu</DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            mt: 1
          }}
        >
          {/* Từ ngày */}
          <TextField
            label="Từ ngày"
            type="date"
            name="startDate"
            value={reportFilter.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Đến ngày */}
          <TextField
            label="Đến ngày"
            type="date"
            name="endDate"
            value={reportFilter.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Đóng
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handleExport}
          disabled={!reportFilter.startDate || !reportFilter.endDate}
        >
          Xuất dữ liệu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaleOutReport;