import { useState } from "react";
// import "./Form1.css";
import { useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem
} from "@mui/material";


const API_URL = "http://localhost:5225/api/sale-out/add-form";

function AddForm({ newSaleOut, setNewSaleOut, setShowAddPopup, setSaleOuts, showMessage, loadSaleOuts })
{

  const [products, setProducts] = useState([]);

//   useEffect(() => {
//   fetch("http://localhost:5225/api/master-product")
//     .then(res => res.json())
//     .then(data => setProducts(data));
// }, []);

    useEffect(() => {
    fetch("http://localhost:5225/api/master-product")
      .then(res => res.json())
      .then(data => {
        setProducts(data.items || []);
      });
  }, []);

  const handleSelectProduct = (e) => {
    const code = e.target.value;
    const p = products.find(x => x.productCode === code);

    setNewSaleOut(prev => ({
      ...prev,
      productCode: code,
      unit: p ? p.unit : "",
      quantityPerBox: p ? p.quantityPerBox : ""
    }));
  };

  const handleAddSave = async () => {
    if (
      !newSaleOut.customerPoNo ||
      !newSaleOut.orderDate ||
      !newSaleOut.customerName ||
      !newSaleOut.productCode ||
      !newSaleOut.unit ||
      Number(newSaleOut.price) <= 0 ||
      Number(newSaleOut.quantity) <= 0 ||
      Number(newSaleOut.quantityPerBox) <= 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CustomerPoNo: newSaleOut.customerPoNo,
          // OrderDate: newSaleOut.orderDate,
          OrderDate: Number(newSaleOut.orderDate.replaceAll("-", "")),
          CustomerName: newSaleOut.customerName,
          ProductCode: newSaleOut.productCode,
          Unit: newSaleOut.unit,
          Price: Number(newSaleOut.price),
          Quantity: Number(newSaleOut.quantity),
          QuantityPerBox: Number(newSaleOut.quantityPerBox)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ||"Không thể thêm đơn hàng");
        return;
      }

      showMessage("✅ Thêm đơn hàng thành công");
      loadSaleOuts();

      setSaleOuts(prev => [...prev, data]);
      setShowAddPopup(false);

      // reset form đúng
      setNewSaleOut({
        customerPoNo: "",
        orderDate: "",
        customerName: "",
        productCode: "",
        unit: "",
        price: "",
        quantity: "",
        quantityPerBox: ""
      });

    } catch (err) {
      alert("Lỗi hệ thống");
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewSaleOut(prev => ({
      ...prev,
      [name]: value
    }));
  };


    return (
       <Dialog
      open
      onClose={() => setShowAddPopup(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Thêm đơn hàng</DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2
          }}
        >
          {/* Số PO */}
          <TextField
            label={<>Số PO Khách hàng <span style={{ color: "red" }}>*</span></>}
            name="customerPoNo"
            value={newSaleOut.customerPoNo}
            onChange={handleAddChange}
          />

          {/* Ngày đặt hàng */}
          <TextField
            label={<>Ngày đặt hàng <span style={{ color: "red" }}>*</span></>}
            type="date"
            name="orderDate"
            value={newSaleOut.orderDate}
            onChange={handleAddChange}
            InputLabelProps={{ shrink: true }}
          />

          {/* Khách hàng */}
          <TextField
            label={<>Khách hàng <span style={{ color: "red" }}>*</span></>}
            name="customerName"
            value={newSaleOut.customerName}
            onChange={handleAddChange}
          />

          {/* Sản phẩm */}
          <TextField
            select
            label={<>Sản phẩm <span style={{ color: "red" }}>*</span></>}
            name="productCode"
            value={newSaleOut.productCode}
            onChange={handleSelectProduct}
          >
            <MenuItem value="">-- Chọn sản phẩm --</MenuItem>
            {products.map(p => (
              <MenuItem key={p.productCode} value={p.productCode}>
                {p.productCode} ({p.productName})
              </MenuItem>
            ))}
          </TextField>

          {/* Đơn vị tính */}
          <TextField
            label={<>Đơn vị tính <span style={{ color: "red" }}>*</span></>}
            name="unit"
            value={newSaleOut.unit}
            InputProps={{ readOnly: true }}
          />

          {/* Đơn giá */}
          <TextField
            label={<>Đơn giá <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="price"
            value={newSaleOut.price}
            onChange={handleAddChange}
          />

          {/* Số lượng */}
          <TextField
            label={<>Số lượng <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="quantity"
            value={newSaleOut.quantity}
            onChange={handleAddChange}
          />

          {/* Số lượng / thùng */}
          <TextField
            label={<>Số lượng / thùng <span style={{ color: "red" }}>*</span></>}
            type="number"
            name="quantityPerBox"
            value={newSaleOut.quantityPerBox}
            onChange={handleAddChange}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setShowAddPopup(false)}>Đóng</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAddSave}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
      // <div className="modal-overlay">
      // <div className="modal-content">
      //   <div className="form-row">
      //     <div className="form-group">
      //       <label>Số PO Khách hàng <span className="required">*</span></label>
      //       <input 
      //         type="text" 
      //         name="customerPoNo"
      //         value={newSaleOut.customerPoNo}
      //         onChange={handleAddChange}
      //       />
      //     </div>

      //     <div className="form-group">
      //       <label>Ngày đặt hàng <span className="required">*</span></label>
      //       <input 
      //         type="date"
      //         name="orderDate"
      //         value={newSaleOut.orderDate}
      //         onChange={handleAddChange}
      //       />
      //     </div>
      //   </div>

      //   <div className="form-row">
      //     <div className="form-group">
      //       <label>Khách hàng <span className="required">*</span></label>
      //       <input 
      //         type="text"
      //         name="customerName"
      //         value={newSaleOut.customerName}
      //         onChange={handleAddChange}
      //       />
      //     </div>

      //     <div className="form-group">
      //       <label>Sản phẩm <span className="required">*</span></label>
      //       <select 
      //         name="productCode"
      //         value={newSaleOut.productCode}
      //         onChange={handleSelectProduct}
      //       >
      //         <option value="">-- Chọn sản phẩm --</option>
      //         {products.map(p => (
      //           <option key={p.productCode} value={p.productCode}>
      //             {p.productCode}({p.productName})
      //           </option>
      //         ))}
      //       </select>
      //     </div>
      //   </div>

      //   <div className="form-row">
      //     <div className="form-group">
      //       <label>Đơn vị tính <span className="required">*</span></label>
      //       <input 
      //         type="text"
      //         name="unit"
      //         value={newSaleOut.unit}
      //         readOnly
      //       />
      //     </div>

      //     <div className="form-group">
      //       <label>Đơn giá <span className="required">*</span></label>
      //       <input 
      //         type="number"
      //         name="price"
      //         value={newSaleOut.price}
      //         onChange={handleAddChange}
      //       />
      //     </div>
      //   </div>

      //   <div className="form-row">
      //     <div className="form-group">
      //       <label>Số lượng <span className="required">*</span></label>
      //       <input 
      //         type="number"
      //         name="quantity"
      //         value={newSaleOut.quantity}
      //         onChange={handleAddChange}
      //       />
      //     </div>

      //     <div className="form-group">
      //       <label>Số lượng/Thùng <span className="required">*</span></label>
      //       <input 
      //         type="number"
      //         name="quantityPerBox"
      //         value={newSaleOut.quantityPerBox}
      //         onChange={handleAddChange}
      //       />
      //     </div>
      //   </div>

      //   <div className="form-actions">
      //     <button className="btn-cancel" onClick={() => setShowAddPopup(false)}>Đóng</button>
      //     <button className="btn-save"  onClick={handleAddSave}>Lưu</button>
      //   </div>
      // </div>
      // </div>
    )
}
export default AddForm;