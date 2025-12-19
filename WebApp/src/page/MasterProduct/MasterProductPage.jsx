// import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MasterProductPage.css";
import UpLoadPage from "./UpLoadPage";
import AddPage from "./AddPage";
import EditPage from "./EditPage";
import DeletePage from "./DeletePage";


const API_URL = "http://localhost:5225/api/master-product";

function MasterProductPage() {
  // const navigate = useNavigate(); //BẮT BUỘC khi dùng chuyển trang
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [products, setProducts] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [field, setField] = useState("");
  const [keyword, setKeyword] = useState("");

  // add product form
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    unit: "",
    specification: "",
    quantityPerBox: "",
    productWeight: ""
  });

  // phân trang (frontend)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // LOAD ALL
  // useEffect(() => {
  //   fetch(API_URL)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setProducts(data);
  //       setCurrentPage(1);
  //     })
  //     .catch((err) => console.error(err));
  // }, []);
  const loadProducts = () => {
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setCurrentPage(1);
        })
        .catch((err) => console.error(err));
    };

  // ⭐ CHẠY 1 LẦN KHI TRANG MỞ
  useEffect(() => {
    loadProducts();
  }, []);
  // SEARCH
  const handleSearch = () => {
    let url = API_URL;

    if (field && keyword) {
      url += `?field=${field}&keyword=${encodeURIComponent(keyword)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setCurrentPage(1);
      })
      .catch((err) => console.error(err));
  };
  
// sửa
  const handleEdit = (item) => {
    setEditProduct(item);     // lưu sản phẩm đang sửa
    setShowEditPopup(true);   // mở popup
  };

  const handleDelete = (item) => {
    setDeleteProduct(item);
    setShowDeletePopup(true);
  }

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000); // tự ẩn sau 3 giây
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_URL}/download-template`;
  };

    // PAGINATION (FRONTEND)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedProducts = products.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    
    <div className="master-product-page">
      {message && (
        <div
          className={`log-message ${message.type}`}
        >
          {message.text}
        </div>
      )}
      {/* ================= SEARCH ================= */}
      <div className="top">
        <div className="search-box">
          <select value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">Tên trường</option>
            <option value="ProductCode">Mã sản phẩm</option>
            <option value="ProductName">Tên sản phẩm</option>
            <option value="Unit">Đơn vị tính</option>
            <option value="Specification">Quy cách</option>
            <option value="QuantityPerBox">Số lượng/Thùng</option>
            <option value="ProductWeight">Trọng lượng</option>
          </select>

          <input
            type="text"
            placeholder="Nội dung search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn-search" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="action-box">
          <button className="btn-add" 
                  onClick={() => setShowAddPopup(true)}>Thêm mới</button>
          <button className="btn-download"
                  onClick={handleDownloadTemplate}>Tải file mẫu</button>
          <button className="btn-upload"
                  onClick={() => setShowUpload(true)}>Upload dữ liệu</button>
        </div>
      </div>

      {/* ================= PAGE SIZE ================= */}
      <div className="page-size">
        Hiển thị&nbsp;
        <select value={pageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        &nbsp;bản ghi trên mỗi trang
      </div>

      {/* ================= TABLE ================= */}
      <div className="bottom">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Action</th>
              <th>Mã sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị tính</th>
              <th>Quy cách</th>
              <th>Số lượng/Thùng</th>
              <th>Trọng lượng</th>
            </tr>
          </thead>

          <tbody>
            {pagedProducts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {pagedProducts.map((item, index) => (
              <tr key={item.id}>
                <td>{startIndex + index + 1}</td>
                <td>
                  <div className="action-col">
                    <button className="btn btn-edit"
                    onClick={() => handleEdit(item)}>✏️</button>
                    <button className="btn btn-delete"
                    onClick={() => handleDelete(item)}>🗑️</button>
                  </div>
                </td>
                <td>{item.productCode}</td>
                <td>{item.productName}</td>
                <td>{item.unit}</td>
                <td>{item.specification}</td>
                <td>{item.quantityPerBox}</td>
                <td>{item.productWeight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddPopup && (
      <AddPage
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        setShowAddPopup={setShowAddPopup}
        setProducts={setProducts}
        showMessage={showMessage}
      />
      )}

      {showEditPopup && editProduct && (
        <EditPage
          editProduct={editProduct}
          setEditProduct={setEditProduct}
          setShowEditPopup={setShowEditPopup}
          setProducts={setProducts}
          showMessage={showMessage}
        />
      )}

      {showDeletePopup && deleteProduct && (
        <DeletePage
          deleteProduct={deleteProduct}
          setDeleteProduct={setDeleteProduct}
          setShowDeletePopup={setShowDeletePopup}
          setProducts={setProducts}
          showMessage={showMessage}
        />
      )}

      {showUpload && (
        <UpLoadPage onClose={() => setShowUpload(false)}
                    onUploaded={() => loadProducts()} />
      )}
    </div>
  );
}

export default MasterProductPage;
