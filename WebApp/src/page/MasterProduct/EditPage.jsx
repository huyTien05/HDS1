import "./Form.css";

const API_URL = "http://localhost:5225/api/master-product/edit-page";

function EditPage({editProduct, setEditProduct, setShowEditPopup, setProducts, showMessage })
{
    // const handleEdit = (item) => {
    //     setEditProduct(item);     // lưu sản phẩm đang sửa
    //     setShowEditPopup(true);   // mở popup
    // };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditProduct((prev) => ({
        ...prev,
        [name]: value
        }));
    };

    const handleEdit = async () => {
        try {
        const res = await fetch(`${API_URL}/${editProduct.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editProduct)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Không thể cập nhật");
            // const data = await res.json();
            return;
        }
        showMessage("✅ Cập nhật sản phẩm thành công");
        // cập nhật lại danh sách
        setProducts((prev) =>
            prev.map((p) => (p.id === data.id ? data : p))
        );
        setShowEditPopup(false);
        } catch {
        alert("Lỗi hệ thống");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Chỉnh sửa sản phẩm</h3>

                <div className="form-row">
                    <div className="form-group">
                    <label>Mã sản phẩm</label>
                    <input name="productCode"
                        value={editProduct.productCode}
                        disabled/>
                    </div>

                    <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input name="productName"
                        value={editProduct.productName}
                        disabled/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                    <label>Đơn vị</label>
                    <input name="unit"
                        value={editProduct.unit || ""}
                        onChange={handleEditChange}/>
                    </div>

                    <div className="form-group">
                    <label>Quy cách</label>
                    <input name="specification"
                        value={editProduct.specification || ""}
                        onChange={handleEditChange}/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                    <label>Số lượng / Thùng</label>
                    <input type="number"
                        name="quantityPerBox"
                        value={editProduct.quantityPerBox ?? ""}
                        onChange={handleEditChange}/>
                    </div>

                    <div className="form-group">
                    <label>Trọng lượng</label>
                    <input type="number"
                        step="0.001"
                        name="productWeight"
                        value={editProduct.productWeight ?? ""}
                        onChange={handleEditChange}/>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button"
                            className="btn-cancel"
                            onClick={() => { setShowEditPopup(false);
                                            setEditProduct(null); }}>Hủy</button>

                    <button type="button"
                            className="btn-save"
                            onClick={handleEdit}>Lưu</button>
                </div>
            </div>
        </div>
    )
}
export default EditPage;