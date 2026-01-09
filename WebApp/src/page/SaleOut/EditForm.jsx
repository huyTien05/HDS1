// import "./Form1.css";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  TextField,
  Button
} from "@mui/material";

const API_URL = "http://localhost:5225/api/sale-out/edit-form";

function EditForm({ editSaleOut, setEditSaleOut, setShowEditPopup, setSaleOuts, showMessage }) {

  // Chỉ update 3 trường được phép
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditSaleOut(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/${editSaleOut.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSaleOut)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Không thể cập nhật");
        return;
      }

      showMessage("🟢 Cập nhật thành công");

      // update danh sách tại FE
      setSaleOuts(prev =>
        prev.map(x => x.id === data.id ? data : x)
      );

      setShowEditPopup(false);

    } catch {
      alert("Lỗi hệ thống");
    }
  };

  return (
    // <div className="modal-overlay">
    //   <div className="modal-content">
    //     <h3>Chỉnh sửa đơn xuất hàng</h3>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label>Số PO</label>
    //         <input type="text" value={editSaleOut.customerPoNo} disabled />
    //       </div>

    //       <div className="form-group">
    //         <label>Ngày đặt hàng</label>
    //         <input type="text" value={editSaleOut.orderDate} disabled />
    //       </div>
    //     </div>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label>Khách hàng</label>
    //         <input type="text" value={editSaleOut.customerName} disabled />
    //       </div>

    //       <div className="form-group">
    //         <label>Mã sản phẩm</label>
    //         <input type="text" value={editSaleOut.productCode} disabled />
    //       </div>
    //     </div>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label>Đơn vị tính</label>
    //         <input type="text" value={editSaleOut.unit} disabled />
    //       </div>

    //       <div className="form-group">
    //         <label>Đơn giá <span className="required">*</span></label>
    //         <input
    //           type="number"
    //           name="price"
    //           value={editSaleOut.price}
    //           onChange={handleEditChange}
    //         />
    //       </div>
    //     </div>

    //     <div className="form-row">
    //       <div className="form-group">
    //         <label>Số lượng <span className="required">*</span></label>
    //         <input
    //           type="number"
    //           name="quantity"
    //           value={editSaleOut.quantity}
    //           onChange={handleEditChange}
    //         />
    //       </div>

    //       <div className="form-group">
    //         <label>Số lượng/Thùng <span className="required">*</span></label>
    //         <input
    //           type="number"
    //           name="quantityPerBox"
    //           value={editSaleOut.quantityPerBox}
    //           onChange={handleEditChange}
    //         />
    //       </div>
    //     </div>

    //     <div className="form-actions">
    //       <button className="btn-cancel" onClick={() => setShowEditPopup(false)}>Đóng</button>
    //       <button className="btn-save" onClick={handleEdit}>Lưu</button>
    //     </div>
    //   </div>
    // </div>
    <Dialog
      open
      onClose={() => setShowEditPopup(false)}
      hideBackdrop
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="h6" mb={2}>
          Chỉnh sửa đơn xuất hàng
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            maxWidth: 900
          }}
        >
          {/* Số PO */}
          <TextField
            label="Số PO"
            value={editSaleOut.customerPoNo}
            disabled
            fullWidth
          />

          {/* Ngày đặt hàng */}
          <TextField
            label="Ngày đặt hàng"
            value={editSaleOut.orderDate}
            disabled
            fullWidth
          />

          {/* Khách hàng */}
          <TextField
            label="Khách hàng"
            value={editSaleOut.customerName}
            disabled
            fullWidth
          />

          {/* Mã sản phẩm */}
          <TextField
            label="Mã sản phẩm"
            value={editSaleOut.productCode}
            disabled
            fullWidth/>

          <TextField
            label="Đơn vị tính"
            value={editSaleOut.unit}
            disabled
            fullWidth/>

          <TextField
            label={<>Đơn giá <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="price"
            value={editSaleOut.price}
            onChange={handleEditChange}
            fullWidth/>

          <TextField
            label={<>Số lượng <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="quantity"
            value={editSaleOut.quantity}
            onChange={handleEditChange}
            fullWidth
          />

          <TextField
            label={<>Số lượng / Thùng <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="quantityPerBox"
            value={editSaleOut.quantityPerBox}
            onChange={handleEditChange}
            fullWidth
          />

          {/* Buttons */}
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 1
            }}
          >
            <Button onClick={() => setShowEditPopup(false)}>
              Đóng
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleEdit}
            >
              Lưu
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditForm;
