import { useState } from "react";
// import "./Form.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from "@mui/material";

const API_URL = "http://localhost:5225/api/master-product/add-page";

function AddPage({ newProduct, setNewProduct, setShowAddPopup, setProducts, showMessage })
{
    const handleAddSave = async () => {
    if (
      !newProduct.productCode ||
      !newProduct.productName ||
      !newProduct.unit ||
      !newProduct.productWeight ||
      !newProduct.quantityPerBox ||
      !newProduct.specification
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProductCode: newProduct.productCode,
          ProductName: newProduct.productName,
          Unit: newProduct.unit,
          Specification: newProduct.specification,
          QuantityPerBox: Number(newProduct.quantityPerBox),
          ProductWeight: Number(newProduct.productWeight)
        })
      });

      // LUÔN đọc JSON trước(res phản hồi json đọc body->js object)
      const data = await res.json();
      if (!res.ok){
        alert(data.message || "Không thể thêm sản phẩm");
        return;
      }
      showMessage("✅ Thêm sản phẩm thành công");
      // THÊM THÀNH CÔNG
      setProducts((prev) => [...prev, data]);
      setShowAddPopup(false);
      setNewProduct({
        productCode: "",
        productName: "",
        unit: "",
        specification: "",
        quantityPerBox: "",
        productWeight: ""
      });

    } catch (err) {
      alert("Lỗi hệ thống");
    }
  };
//sự kiện onchange sẽ tự động gọi hàm khi input thay đổi
    const handleAddChange = (e) => {
    const { name, value } = e.target;
    // const name = e.target.name;
    // const value = e.target.value;
    setNewProduct((prev) => ({
        ...prev,
        [name]: value //cập nhật giá trị theo trường
      }));
    };

    return (
        // <div className="modal-overlay">
        //   <div className="modal-content">
        //     <h3>Thêm mới sản phẩm</h3>

        //     <div className="form-row">
        //       <div className="form-group">
        //         <label>Mã sản phẩm <span className="required">*</span></label>
        //         <input type="text"
        //           name="productCode"
        //           value={newProduct.productCode}
        //           onChange={handleAddChange}/>
        //       </div>
        //       <div className="form-group">
        //         <label>Tên sản phẩm <span className="required">*</span></label>
        //         <input type="text"
        //           name="productName"
        //           value={newProduct.productName}
        //           onChange={handleAddChange}/>
        //       </div>
        //     </div>

        //     <div className="form-row">
        //       <div className="form-group">
        //         <label>Đơn vị <span className="required">*</span></label>
        //         <input type="text"
        //           name="unit"
        //           value={newProduct.unit}
        //           onChange={handleAddChange}/>
        //       </div>
        //       <div className="form-group">
        //         <label>Quy cách <span className="required">*</span></label>
        //         <input type="text"
        //           name="specification"
        //           value={newProduct.specification}
        //           onChange={handleAddChange}/>
        //       </div>
        //     </div>

        //     <div className="form-row">
        //       <div className="form-group">
        //         <label>Số lượng / Thùng <span className="required">*</span></label>
        //         <input type="number"
        //           name="quantityPerBox"
        //           value={newProduct.quantityPerBox}
        //           onChange={handleAddChange}/>
        //       </div>
        //       <div className="form-group">
        //         <label>Trọng lượng <span className="required">*</span></label>
        //         <input type="number"
        //           step="0.001"
        //           name="productWeight"
        //           value={newProduct.productWeight}
        //           onChange={handleAddChange}/>
        //       </div>
        //     </div>

        //     <div className="modal-actions">
        //       <button
        //         className="btn-cancel" onClick={() => setShowAddPopup(false)}>Đóng</button>
        //       <button className="btn-save" onClick={handleAddSave}>Lưu</button>
        //     </div>
        //   </div>
        // </div>
        
        <Dialog
          open
          onClose={() => setShowAddPopup(false)}
          maxWidth="md"
          fullWidth>
          <DialogTitle>Tải lên tập tin</DialogTitle>

          <DialogContent dividers>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
                maxWidth:900
              }}>
              <TextField
                label={<>Mã sản phẩm <span style={{ color: "red" }}>*</span></>}
                name="productCode"
                value={newProduct.productCode}
                onChange={handleAddChange}/>

              <TextField
                label={<>Tên sản phẩm <span style={{ color: "red" }}>*</span></>}
                name="productName"
                value={newProduct.productName}
                onChange={handleAddChange}/>

              <TextField
                label={<>Đơn vị tính <span style={{ color: "red" }}>*</span></>}
                name="unit"
                value={newProduct.unit}
                onChange={handleAddChange}/>

              <TextField
                label={<>Quy cách <span style={{ color: "red" }}>*</span></>}
                name="specification"
                value={newProduct.specification}
                onChange={handleAddChange}/>

              <TextField
                label={<>Số lượng / thùng <span style={{ color: "red" }}>*</span></>}
                type="number"
                name="quantityPerBox"
                value={newProduct.quantityPerBox}
                onChange={handleAddChange}/>

              <TextField
                label={<>Trọng lượng <span style={{ color: "red" }}>*</span></>}
                type="number"
                inputProps={{ step: 0.001 }}
                name="productWeight"
                value={newProduct.productWeight}
                onChange={handleAddChange}/>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setShowAddPopup(false)}>Đóng</Button>
            <Button variant="contained" color="success" onClick={handleAddSave}>Lưu</Button>
          </DialogActions>
        </Dialog>
    )
}
export default AddPage;