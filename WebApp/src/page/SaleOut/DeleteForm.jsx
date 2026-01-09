// import "./form1.css"
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button
} from "@mui/material";

const API_URL = "http://localhost:5225/api/sale-out/delete-form";

function DeleteForm({ deleteSaleOut, setShowDeletePopup, setSaleOuts, showMessage, setSummaryTrigger }) {

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/${deleteSaleOut.id}`, {
      method: "DELETE"
    });

    // const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Không thể xoá");
      return;
    }

    showMessage("🗑️ Đã xoá thành công");

    setSaleOuts(prev => prev.filter(x => x.id !== deleteSaleOut.id));
    setSummaryTrigger(t => t + 1);

    setShowDeletePopup(false);
  };

  return (
    //  <div className="modal-overlay">
    //     <div className="modal-content">
    //         <h3>Xác nhận xóa</h3>

    //         <p>Bạn có chắc chắn muốn xóa sản phẩm
    //             <strong> {deleteSaleOut.customerPoNo}</strong> không?</p>

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
        <Typography variant="h6" gutterBottom>
          Xác nhận xóa
        </Typography>

        <Typography>
          Bạn có chắc chắn muốn xóa đơn xuất hàng
          <strong> {deleteSaleOut.customerPoNo}</strong> không?
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3
          }}
        >
          <Button onClick={() => setShowDeletePopup(false)}>
            Không
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Có
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteForm;
