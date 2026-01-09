import { useEffect, useState, useMemo  } from "react";
// import "./SaleOutPage.css";
import AddForm from "./AddForm";
import EditForm from "./EditForm"
import DeleteForm from "./DeleteForm";
import UploadForm from "./UpLoadForm";
import SaleOutReport from "./SaleOutReport";
import PDFForm from "./PDFform";



import {
  Box, Button, TextField, Select, MenuItem, Container , Menu,
  Table, TableBody, TableCell, TableHead, TableRow, Grid, FormControl,
  Dialog, DialogContent, Pagination, Typography, FormControlLabel, Checkbox   
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTheme, useMediaQuery } from "@mui/material";
import 'bootstrap/dist/css/bootstrap.min.css';


const API_URL = "http://localhost:5225/api/sale-out";

function SaleOutPage() {
  const [saleOuts, setSaleOuts] = useState([]);
  const [pageSaleOuts, setPageSaleOuts] = useState([]);
  const [field, setField] = useState("");
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState(null);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editSaleOut, setEditSaleOut] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSaleOut, setDeleteSaleOut] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [reportFilter, setReportFilter] = useState({ startDate: "", endDate: ""});

  const [showPrintPopup, setShowPrintPopup] = useState(false);
  const [saleOutNos, setSaleOutNos] = useState([]);

  //total
  const [summaryTrigger, setSummaryTrigger] = useState(0);
  const [summary, setSummary] = useState({});

  const [totalItems, setTotalItems] = useState(0);

  //filter column
  const [openFilter, setOpenFilter] = useState(null); // key cột
  const [anchorEl, setAnchorEl] = useState(null); 
  const [filterInput, setFilterInput] = useState("");

  //sort
  const [sortConfig, setSortConfig] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const COLUMNS = [
    { key: "customerPoNo", label: "Số PO", filterable: true },
    { key: "orderDate", label: "Ngày đặt hàng", filterable: true },
    { key: "customerName", label: "Khách hàng", filterable: true },
    { key: "productCode", label: "Mã sản phẩm", filterable: true },
    { key: "productName", label: "Tên sản phẩm", filterable: true },
    { key: "unit", label: "ĐVT", filterable: true },
    { key: "quantity", label: "Số lượng", filterable: true },
    { key: "quantityPerBox", label: "SL / Thùng", filterable: true },
    { key: "boxQuantity", label: "Số thùng", filterable: true },
    { key: "price", label: "Đơn giá", filterable: true },
    { key: "amount", label: "Thành tiền", filterable: true },
  ];

  const getUniqueValues = (key) => {
    return [...new Set(
      saleOuts
        .map(row => row[key])
        .filter(Boolean)
    )];
  };

  const [newSaleOut, setNewSaleOut] = useState({
    customerPoNo: "",
    orderDate: "",
    customerName: "",
    productCode: "",
    unit: "",
    price: "",
    quantity: "",
    quantityPerBox: ""
  });

  const [columnFilters, setColumnFilters] = useState({
    customerPoNo: "",
    customerName: "",
    productCode: "",
    productName: "",
  });

  const filteredSaleOuts = useMemo(() => {
    return saleOuts.filter(row =>
      Object.entries(columnFilters).every(([key, filterValue]) => {
        if (
          filterValue === "" ||
          filterValue === null ||
          filterValue === undefined
        ) {
          return true;
        }

        const cellValue = row[key]; // ✅ DÒNG BỊ THIẾU

        if (cellValue === null || cellValue === undefined) {
          return false;
        }

        return String(cellValue)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      })
    );
  }, [saleOuts, columnFilters]);

  useEffect(() => {
    setFilterInput("");
  }, [openFilter]);

  useEffect(() => {
    fetch(`${API_URL}/sum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summaryColumns: ["quantity", "boxquantity", "amount"],
        field,
        keyword
      })
    })
      .then(res => res.json())
      .then(data => setSummary(data.sums || {}));
  }, [summaryTrigger, field, keyword]);

  const loadSaleOutNo = async () => {
    try {
      const res = await fetch(`${API_URL}/nos`);

      if (!res.ok) {
        console.error("Load SaleOutNo failed", res.status);
        return;
      }

      const data = await res.json();
      setSaleOutNos(data);
    } catch (err) {
      console.error("Error loading SaleOutNos", err);
    }
  };

  const handleDownloadTemplate = () => {
  window.location.href = "http://localhost:5225/api/sale-out/download-template";
  };

  const loadSaleOuts = () => {
    const params = new URLSearchParams({
      pageIndex: currentPage,
      pageSize: pageSize
    });

    // SEARCH
    if (field && keyword) {
      params.append("field", field);
      params.append("keyword", keyword);
    }

    // SORT (chỉ gửi khi khác mặc định)
    if (sortConfig.length > 0) {
      const sortParam = sortConfig
        .map(x => `${x.field}:${x.direction}`)
        .join(",");
      params.append("sort", sortParam);
    }

    fetch(`${API_URL}?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        setSaleOuts(res.items);       // data 1 trang
        setTotalItems(res.totalItems);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadSaleOuts();
    }, [currentPage, pageSize, sortConfig]);
  // useEffect(() => {
  //   loadSaleOuts();
  // }, [currentPage,pageSize]);

  const handleEditSaleOut = (x) => {
        setEditSaleOut(x);     // lưu sản phẩm đang sửa
        setShowEditPopup(true); // mở popup
    };

  const handleDeleteSaleOut = (x) => {
    setDeleteSaleOut(x);
    setShowDeletePopup(true);
  }

  const handleSearch = () => {
    let url = API_URL;
    if (field && keyword) {
      url += `?field=${field}&keyword=${encodeURIComponent(keyword)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSaleOuts(data.items);
        setCurrentPage(1);
      });
  };

  function formatDate(yyyymmdd) {
    if (!yyyymmdd) return "";
    const s = yyyymmdd.toString();
    return `${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
  }

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000); // tự ẩn sau 3 giây
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page) => {
  if (page < 1 || page > totalPages) return;
  setCurrentPage(page);
  };

  //sort
  const renderSortIcon = (colKey) => {
    const idx = sortConfig.findIndex(x => x.field === colKey);
    if (idx === -1) return null;

    const dir = sortConfig[idx].direction;
    return dir === "asc" ? ` ▲${idx + 1}` : ` ▼${idx + 1}`;
  };

  const handleSort = (columnKey, event) => {
    setSortConfig(prev => {
      const isCtrl = event.ctrlKey || event.metaKey;
      const idx = prev.findIndex(x => x.field === columnKey);
      // CLICK THƯỜNG → reset sort
      if (!isCtrl) {
        if (idx === -1) {
          return [{ field: columnKey, direction: "asc" }];
        }
        // asc → desc
        if (prev[idx].direction === "asc") {
          return [{ field: columnKey, direction: "desc" }];
        }
        // desc → reset (về mặc định backend)
        return [];
      }

    // CTRL + CLICK
    if (idx === -1) {
      return [...prev, { field: columnKey, direction: "asc" }];
    }

    return prev.map((x, i) =>
      i === idx
        ? { ...x, direction: x.direction === "asc" ? "desc" : "asc" }
        : x
    );
  });

  setCurrentPage(1);
  };


  const cellCenter = {
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  const cellRight = {
    textAlign: "right",
    whiteSpace: "nowrap",
  };

  const headerCell = {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    border: "2px solid #000",
    px: 1,
    cursor: "pointer",
    userSelect: "none",
  };

  const rowSx = {
    "& td": {
      border: "2px solid #000",
      fontSize: 14,
      px: 2,
      py: 1.25,
    },
    "&:hover": { backgroundColor: "#f5f5f5" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflowX: "auto",
        backgroundColor: "#f5f5f5",
        p:"16px",
        minWidth: 0}}>
      {/* ================= SEARCH ================= */}
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Select
            size="small"
            value={field}
            displayEmpty
            onChange={(e) => setField(e.target.value)}
            sx={{width: { xs: '100%', md: 200 } }}>
            <MenuItem value="">Tên trường</MenuItem>
            <MenuItem value="CustomerPoNo">Số PO KH</MenuItem>
            <MenuItem value="OrderDate">Ngày đặt hàng</MenuItem>
            <MenuItem value="CustomerName">Khách hàng</MenuItem>
            <MenuItem value="ProductCode">Mã sản phẩm</MenuItem>
            <MenuItem value="ProductName">Tên sản phẩm</MenuItem>
          </Select>

          <TextField
            size="small"
            placeholder="Nội dung tìm kiếm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ width: { xs: 'calc((100% - 16px) * 7 / 10)', md: 250 } }}/>

          <Button
            variant="contained"
            color="success"
            onClick={handleSearch}
            sx={{ width: { xs: 'calc((100% - 16px) * 3 / 10)', md: 100 } }}>
            {isMobile ? "Tìm" : "Tìm kiếm"}
          </Button>
        </Box>

        {/* ================= ACTION ================= */}
        <Box display="flex" gap={2} flexWrap="wrap">
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

          <Button
            variant="contained"
            color="info"
            startIcon={<PrintIcon />}
            onClick={() => {
              loadSaleOutNo();
              setShowPrintPopup(true);
             }}>In phiếu</Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowReport(true)}>Báo cáo doanh thu</Button>
        </Box>

        {/* ================= PAGE SIZE ================= */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>Hiển thị</Typography>
          <Select size="small" value={pageSize} onChange={handlePageSizeChange}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
          <Typography>bản ghi / trang</Typography>
        </Box>

        {/* ================= TABLE ================= */}
        <Table sx={{ border: "2px solid #ccc" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#04ba47" }}>
              {["STT", "Action"].map((label) => (
                <TableCell key={label} sx={headerCell}>
                  {label}
                </TableCell>
              ))}

              {COLUMNS.map((col) => (
                <TableCell
                  key={col.key}
                  sx={headerCell}
                  onClick={(e) => handleSort(col.key, e)}
                >
                  <Box display="inline-flex" alignItems="center" gap={0.25}>
                    {col.label}
                    {renderSortIcon(col.key)}

                    {col.filterable && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilter(col.key);
                          setAnchorEl(e.currentTarget);
                        }}
                        sx={{
                          p: 0,
                          color: columnFilters[col.key]
                            ? "success.main"
                            : "inherit",
                        }}
                      >
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {saleOuts.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}

            {filteredSaleOuts.map((x, i) => (
              <TableRow key={x.id} sx={rowSx}>
                <TableCell sx={cellCenter}>
                  {(currentPage - 1) * pageSize + i + 1}
                </TableCell>

                <TableCell sx={cellCenter}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditSaleOut(x)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSaleOut(x)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>

                <TableCell sx={cellCenter}>{x.customerPoNo}</TableCell>
                <TableCell sx={cellCenter}>{formatDate(x.orderDate)}</TableCell>
                <TableCell sx={cellCenter}>{x.customerName}</TableCell>
                <TableCell sx={cellCenter}>{x.productCode}</TableCell>
                <TableCell sx={cellCenter}>{x.productName}</TableCell>
                <TableCell sx={cellCenter}>{x.unit}</TableCell>
                <TableCell sx={cellRight}>{x.quantity}</TableCell>
                <TableCell sx={cellRight}>{x.quantityPerBox}</TableCell>
                <TableCell sx={cellRight}>
                  {x.boxQuantity?.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell sx={cellRight}>
                  {x.price?.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell sx={{ ...cellRight, fontWeight: "bold" }}>
                  {x.amount?.toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
            ))}

            {Object.keys(summary).length > 0 && (
              <TableRow sx={{
                backgroundColor: "#e8f5e9",
                "& td": {
                  border: "2px solid #000",   
                  fontWeight: "bold"}}}>
                <TableCell colSpan={8} sx={cellCenter}> TỔNG</TableCell>
                <TableCell sx={cellRight}>
                  {summary.quantity?.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell />
                <TableCell sx={cellRight}>
                  {summary.boxquantity?.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell />
                <TableCell sx={cellRight}>
                  {summary.amount?.toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ================= FILTER MENU ================= */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(openFilter)}
          onClose={() => {
            setOpenFilter(null);
            setAnchorEl(null);
          }}>

            <MenuItem disableRipple>
              <TextField
                size="small"
                placeholder="Nhập để lọc..."
                value={filterInput}
                fullWidth
                autoFocus
                onChange={(e) => setFilterInput(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()} // QUAN TRỌNG
                onClick={(e) => e.stopPropagation()}/>
            </MenuItem>

          <MenuItem
            onClick={() => {
              setColumnFilters((p) => ({ ...p, [openFilter]: "" }));
              setOpenFilter(null);
              setAnchorEl(null);
            }}> Tất cả </MenuItem>

          {getUniqueValues(openFilter)
            .filter((value) =>
              String(value)
                .toLowerCase()
                .includes(filterInput.toLowerCase())
            )
            .map((value) => (
              <MenuItem
                key={value}
                onClick={() => {
                  setColumnFilters((p) => ({ ...p, [openFilter]: value }));
                  setOpenFilter(null);
                  setAnchorEl(null);
                }}> {String(value)} </MenuItem>
            ))}
        </Menu>

        {/* ================= PAGINATION ================= */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => handlePageChange(page)}
          color="success"
          shape="rounded"
          showFirstButton
          showLastButton
        />

        <Dialog
          open={showAddPopup}
          onClose={() => setShowAddPopup(false)}
          fullWidth
          maxWidth="md">
          <DialogContent>
            <AddForm
              newSaleOut={newSaleOut}
              setNewSaleOut={setNewSaleOut}
              setShowAddPopup={setShowAddPopup}
              setSaleOuts={setSaleOuts}
              showMessage={showMessage}
              loadSaleOuts={loadSaleOuts}
              setSummaryTrigger={setSummaryTrigger}
              />
          </DialogContent>
        </Dialog>
        <Dialog
          open={showEditPopup}
          onClose={() => setShowEditPopup(false)}
          fullWidth
          maxWidth="md">
          <DialogContent>
            <EditForm
              editSaleOut={editSaleOut}
              setEditSaleOut={setEditSaleOut}
              setShowEditPopup={setShowEditPopup}
              setSaleOuts={setSaleOuts}
              showMessage={showMessage}
              setSummaryTrigger={setSummaryTrigger}/>
          </DialogContent>
        </Dialog>
        <Dialog
          open={showDeletePopup}
          onClose={() => setShowDeletePopup(false)}
          maxWidth="xs">
          <DialogContent>
            <DeleteForm
              deleteSaleOut={deleteSaleOut}
              setShowDeletePopup={setShowDeletePopup}
              setSaleOuts={setSaleOuts}
              showMessage={showMessage}
              setSummaryTrigger={setSummaryTrigger}/>
          </DialogContent>
        </Dialog>
        <Dialog
          open={showUpload}
          onClose={() => setShowUpload(false)}
          maxWidth="sm">
          <DialogContent>
            <UploadForm
              onClose={() => setShowUpload(false)}
              onUploaded={loadSaleOuts}/>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showPrintPopup}
          onClose={() => setShowPrintPopup(false)}
          maxWidth="md">
          <DialogContent>
            <PDFForm
              saleOutNos={saleOutNos}
              setShowPrintPopup={setShowPrintPopup}/>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showReport}
          onClose={() => setShowReport(false)}
          maxWidth="md">
          <DialogContent>
            <SaleOutReport
              onClose={() => setShowReport(false)}
              reportFilter={reportFilter}
              setReportFilter={setReportFilter}/>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}
export default SaleOutPage;