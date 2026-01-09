// import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import "./MasterProductPage.css";
import UpLoadPage from "./UpLoadPage";
import AddPage from "./AddPage";
import EditPage from "./EditPage";
import DeletePage from "./DeletePage";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Typography
} from "@mui/material";


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

  const [totalItems, setTotalItems] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);


  // add product form
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    unit: "",
    specification: "",
    quantityPerBox: "",
    productWeight: ""
  });


  // LOAD ALL
  // const loadProducts = () => {
  //     fetch(API_URL)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setProducts(data);
  //         setCurrentPage(1);
  //       })
  //       .catch((err) => console.error(err));
  //   };
  const loadProducts = () => {
  const params = new URLSearchParams({
    pageIndex: currentPage,
    pageSize: pageSize
  });

  if (field && keyword) {
    params.append("field", field);
    params.append("keyword", keyword);
  }

  fetch(`${API_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(res => {
      setProducts(res.items);       //chỉ data 1 trang
      setTotalItems(res.totalItems);
    })
    .catch(err => console.error(err));
};

  // CHẠY 1 LẦN KHI TRANG MỞ
  useEffect(() => {
    loadProducts();
  }, [currentPage,pageSize]);

  //search
  // const handleSearch = () => {
  //   let url = API_URL;

  //   if (field && keyword) {
  //     url += `?field=${field}&keyword=${encodeURIComponent(keyword)}`;
  //   }
  //   fetch(url)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setProducts(data);
  //       setCurrentPage(1);
  //     })
  //     .catch((err) => console.error(err));
  // };
  const handleSearch = () =>{
    setCurrentPage(1);
    loadProducts();
  }
  
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
    setTimeout(() => {setMessage(null);}, 3000); 
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_URL}/download-template`;
  };

    // PAGINATION (FRONTEND)
  // const startIndex = (currentPage - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const pagedProducts = products.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page) => {
  if (page < 1 || page > totalPages) return;
  setCurrentPage(page);
};

  return (
    <Box sx={{display:"flex", justifyContent:"center"}}>
    <Box sx={{
    // height: "100vh",          
    // display: "flex",
    // flexDirection: "column",
    // p: 2,
    // boxSizing: "border-box",
    // backgroundColor: "#f5f5f5"
    display: "flex",
    flexDirection: "column",
    p:3,
    boxSizing: "border-box",
    borderCollapse: "collapse",
    backgroundColor: "#f5f5f5",
    }}>
      <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center"
      }}>

        <Select
          size="small"
          value={field}
          onChange={(e) => setField(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}>
          <MenuItem value="">Tên trường</MenuItem>
          <MenuItem value="ProductCode">Mã sản phẩm</MenuItem>
          <MenuItem value="ProductName">Tên sản phẩm</MenuItem>
          <MenuItem value="Unit">Đơn vị tính</MenuItem>
          <MenuItem value="Specification">Quy cách</MenuItem>
          <MenuItem value="QuantityPerBox">Số lượng/Thùng</MenuItem>
          <MenuItem value="ProductWeight">Trọng lượng</MenuItem>
        </Select>

        <TextField
          sx={{width:270}}
          size="small"
          placeholder="Nội dung search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}/>


        <Button
          sx={{marginLeft:1}}
          variant="contained"
          color="success"
          onClick={handleSearch}>Tìm kiếm</Button>
      </Box>

      <Box sx={{ display: "flex", gap: 3, marginTop: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => setShowAddPopup(true)}>Thêm mới</Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}>Tải file mẫu</Button>

        <Button
          variant="contained"
          color="warning"
          startIcon={<UploadIcon />}
          onClick={() => setShowUpload(true)}>Upload dữ liệu</Button>
      </Box>

      <Box sx={{display: "flex", alignItems: "center", gap: 1, my: 3}}>
        <Typography>Hiển thị</Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={handlePageSizeChange}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
        <Typography>bản ghi trên mỗi trang</Typography>
      </Box>

       <Table sx={{borderCollapse: "collapse", border: "2px solid #000"}}>
        <TableHead >
          <TableRow sx={{backgroundColor: "#04ba47","& th": 
          {
            color: "#000",
            fontWeight: 700,
            textAlign: "center",
            border: "2px solid #000",
            px:4
          }
        }}>
            <TableCell sx={{ fontWeight: "bold", fontSize:16}}>STT</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Action</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Mã sản phẩm</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Tên sản phẩm</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Đơn vị tính</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Quy cách</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Số lượng/Thùng</TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize:16 }}>Trọng lượng</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}

          {products.map((item, index) => (
            <TableRow
              key={item.id}
              sx={{
                "& td": {
                  border: "2px solid #000",
                  textAlign: "center",
                  padding: "6px 8px"},
                "&:hover": { backgroundColor: "#f2f2f2"}
              }}
            >
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>

              <TableCell align="center">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(item)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap" }}>{item.productCode}</TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.specification}</TableCell>
              <TableCell align="right">{item.quantityPerBox}</TableCell>
              <TableCell align="right">{item.productWeight}</TableCell>
            </TableRow>
          ))}
        </TableBody> 
      </Table>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(e, page) => handlePageChange(page)}
        color="success"
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{mt:2,
          "& .MuiPaginationItem-root": {
            border: "1px solid #000",
            borderRadius: "4px",
            minWidth: 36,
            height: 36,
            fontWeight: 600,
          },
          "& .Mui-selected": {
            backgroundColor: "#04ba47",
            color: "#fff",
            border: "1px solid #000",
            "&:hover": {backgroundColor: "#039b3c"}},
          "& .MuiPaginationItem-ellipsis": {border: "none"}
        }}/>

        <Dialog open={showAddPopup} onClose={() => setShowAddPopup(false)} fullWidth maxWidth="md" hideBackdrop disableEnforceFocus disableAutoFocus>
        <DialogContent >
          <AddPage
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            setShowAddPopup={setShowAddPopup}
            setProducts={setProducts}
            showMessage={showMessage}/>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showEditPopup}
        onClose={() => setShowEditPopup(false)}
        fullWidth
        maxWidth="md"
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
      >
        <DialogContent>
          <EditPage
            editProduct={editProduct}
            setEditProduct={setEditProduct}
            setShowEditPopup={setShowEditPopup}
            setProducts={setProducts}
            showMessage={showMessage}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        maxWidth="xs"
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
      >
        <DialogContent>
          <DeletePage
            deleteProduct={deleteProduct}
            setDeleteProduct={setDeleteProduct}
            setShowDeletePopup={setShowDeletePopup}
            setProducts={setProducts}
            showMessage={showMessage}/>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        maxWidth="sm"
        fullWidth
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
      >
        <DialogContent>
          <UpLoadPage
            onClose={() => setShowUpload(false)}
            onUploaded={loadProducts}/>
        </DialogContent>
      </Dialog>
    </Box>
    </Box>
    

    // <div className="master-product-page">
    //   {message && (
    //     <div className={`log-message ${message.type}`}>
    //       {message.text}
    //     </div>
    //   )}

    //   <div className="top">
    //     <div className="search-box">
    //       <select value={field} onChange={(e) => setField(e.target.value)}>
    //         <option value="">Tên trường</option>
    //         <option value="ProductCode">Mã sản phẩm</option>
    //         <option value="ProductName">Tên sản phẩm</option>
    //         <option value="Unit">Đơn vị tính</option>
    //         <option value="Specification">Quy cách</option>
    //         <option value="QuantityPerBox">Số lượng/Thùng</option>
    //         <option value="ProductWeight">Trọng lượng</option>
    //       </select>

    //       <input
    //         type="text"
    //         placeholder="Nội dung search"
    //         value={keyword}
    //         onChange={(e) => setKeyword(e.target.value)}
    //       />
    //       <button className="btn-search" onClick={handleSearch}>
    //         Tìm kiếm
    //       </button>
    //     </div>

    //     {/* ================= ACTIONS ================= */}
    //     <div className="action-box">
    //       <button className="btn-add" 
    //               onClick={() => setShowAddPopup(true)}>Thêm mới</button>
    //       <button className="btn-download"
    //               onClick={handleDownloadTemplate}>Tải file mẫu</button>
    //       <button className="btn-upload"
    //               onClick={() => setShowUpload(true)}>Upload dữ liệu</button>
    //     </div>
    //   </div>

    //   {/* ================= PAGE SIZE ================= */}
    //   <div className="page-size">
    //     Hiển thị&nbsp;
    //     <select value={pageSize} onChange={handlePageSizeChange}>
    //       <option value={10}>10</option>
    //       <option value={20}>20</option>
    //       <option value={50}>50</option>
    //     </select>
    //     &nbsp;bản ghi trên mỗi trang
    //   </div>
    

    //   {/* ================= TABLE ================= */}
      
    //     <table className="data-table">
    //       <thead>
    //         <tr>
    //           <th>STT</th>
    //           <th>Action</th>
    //           <th>Mã sản phẩm</th>
    //           <th>Tên sản phẩm</th>
    //           <th>Đơn vị tính</th>
    //           <th>Quy cách</th>
    //           <th>Số lượng/Thùng</th>
    //           <th>Trọng lượng</th>
    //         </tr>
    //       </thead>

    //       <tbody>
    //         {products.length === 0 && (
    //           <tr>
    //             <td colSpan="8" style={{ textAlign: "center" }}>Không có dữ liệu</td>
    //           </tr>
    //         )}

    //         {products.map((item, index) => (
    //           <tr key={item.id}>
    //             <td>{(currentPage-1)*pageSize+index+1}</td>
    //             <td>
    //               <div className="action-col">
    //                 <button className="btn btn-edit"onClick={() => handleEdit(item)}>✏️</button>
    //                 <button className="btn btn-delete"onClick={() => handleDelete(item)}>🗑️</button>
    //               </div>
    //             </td>
    //             <td>{item.productCode}</td>
    //             <td>{item.productName}</td>
    //             <td>{item.unit}</td>
    //             <td>{item.specification}</td>
    //             <td>{item.quantityPerBox}</td>
    //             <td>{item.productWeight}</td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //     <div className="pagination">
    //       <button
    //         disabled={currentPage === 1}
    //         onClick={() => handlePageChange(currentPage - 1)}>◀</button>

    //       {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
    //         <button
    //           key={page}
    //           className={page === currentPage ? "active" : ""}
    //           onClick={() => handlePageChange(page)}>{page}</button>))}

    //       <button
    //         disabled={currentPage === totalPages}
    //         onClick={() => handlePageChange(currentPage + 1)}>▶</button>
    //     </div>
      
    //     {showAddPopup && (
    //     <AddPage
    //       newProduct={newProduct}
    //       setNewProduct={setNewProduct}
    //       setShowAddPopup={setShowAddPopup}
    //       setProducts={setProducts}
    //       showMessage={showMessage}
    //     />
    //     )}

    //     {showEditPopup && editProduct && (
    //       <EditPage
    //         editProduct={editProduct}
    //         setEditProduct={setEditProduct}
    //         setShowEditPopup={setShowEditPopup}
    //         setProducts={setProducts}
    //         showMessage={showMessage}
    //       />
    //     )}

    //     {showDeletePopup && deleteProduct && (
    //       <DeletePage
    //         deleteProduct={deleteProduct}
    //         setDeleteProduct={setDeleteProduct}
    //         setShowDeletePopup={setShowDeletePopup}
    //         setProducts={setProducts}
    //         showMessage={showMessage}
    //       />
    //     )}

    //     {showUpload && (
    //       <UpLoadPage onClose={() => setShowUpload(false)}
    //                   onUploaded={() => loadProducts()} />
    //     )}
    // </div>
  );
}
export default MasterProductPage;
