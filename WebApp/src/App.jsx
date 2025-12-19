import { Routes, Route, Navigate } from "react-router-dom";
import MasterProductPage from "./page/MasterProduct/MasterProductPage";
// import SaleOutPage from "./pages/SaleOut/SaleOutPage";

function App() {
  return (
    <Routes>
      {/* Trang mặc định */}
      <Route path="/" element={<Navigate to="/master-product" />} />

      {/* Master Product */}
      <Route path="/master-product" element={<MasterProductPage />} />

      {/* Sale Out */}
      {/* <Route path="/sale-out" element={<SaleOutPage />} /> */}

      {/* 404 */}
      <Route path="*" element={<h2>404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;