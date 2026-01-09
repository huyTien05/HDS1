// import "./Form.css";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box
} from "@mui/material";
const API_URL = "http://localhost:5225/api/master-product";

function DeletePage({deleteProduct, setDeleteProduct, setShowDeletePopup, setProducts, showMessage })
{
  if (!deleteProduct) return null;
    const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${deleteProduct.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        // const data = await res.json();
        const data = await res.text();
        alert(data.message || "Không thể xóa sản phẩm");
        return;
      }

      showMessage("✅ Xóa sản phẩm thành công");
      // cập nhật lại danh sách sau khi xóa
      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteProduct.id)
      );


      setShowDeletePopup(false);
      setDeleteProduct(null);

    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống");
    }
  };

  return(
    // <div className="modal-overlay">
    //     <div className="modal-content">
    //         <h3>Xác nhận xóa</h3>

    //         <p>Bạn có chắc chắn muốn xóa sản phẩm
    //             <strong> {deleteProduct.productName}</strong> không?</p>

    //         <div className="modal-actions">
    //             <button
    //             type="button"
    //             className="btn-cancel"
    //             onClick={() => setShowDeletePopup(false)}>Không</button>

    //             <button
    //             type="button"
    //             className="btn-save"
    //             onClick={handleDelete}>Có</button>
    //         </div>
    //     </div>
    // </div>
    <Dialog
      open
      onClose={() => setShowDeletePopup(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Typography variant="h6" gutterBottom>Xác nhận xóa</Typography>

        <Typography>
          Bạn có chắc chắn muốn xóa sản phẩm
          <strong> {deleteProduct.productName}</strong> không?</Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3}}>
          <Button onClick={() => setShowDeletePopup(false)}>Không</Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}>Có</Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
export default DeletePage;