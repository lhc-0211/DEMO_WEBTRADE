import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../pages/NotFound";
import PlaceOrderPage from "../pages/PlaceOrderPage";
import PriceBoardPage from "../pages/PriceBoardPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/price-board" replace />} />
          <Route path="/price-board" element={<PriceBoardPage />} />
          <Route path="/place-order" element={<PlaceOrderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
