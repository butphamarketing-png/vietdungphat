import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuth } from "../lib/cms.js";
import Login from "./Login.jsx";
import { AdminShell } from "./ui.jsx";
import {
  AccountEditor,
  BookingsEditor,
  Dashboard,
  HomeEditor,
  MediaEditor,
  PagesEditor,
  PostsEditor,
  PricingEditor,
  ReviewsEditor,
  SettingsEditor,
  StudioEditor,
} from "./pages.jsx";
import "./adminbp.css";

function Guard() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    checkAuth().then(setOk);
  }, []);
  if (ok === null) return <div className="adminbp-shell" />;
  if (!ok) return <Navigate to="/adminbp/login" replace />;
  return <AdminShell />;
}

export default function AdminApp() {
  return (
    <div className="adminbp-root">
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<Guard />}>
          <Route index element={<Dashboard />} />
          <Route path="cai-dat" element={<SettingsEditor />} />
          <Route path="trang-chu" element={<HomeEditor />} />
          <Route path="mau-nha" element={<PostsEditor kind="projects" title="Mẫu nhà / công trình" hint="Toàn bộ dự án trên website." />} />
          <Route path="san-pham" element={<PostsEditor kind="products" title="Sản phẩm" hint="Nội thất và combo từ xưởng." />} />
          <Route path="dich-vu" element={<PostsEditor kind="services" title="Dịch vụ" hint="Bài viết danh mục dịch vụ." />} />
          <Route path="tin-tuc" element={<PostsEditor kind="news" title="Tin tức / SEO" hint="Bài viết tin tức gốc." />} />
          <Route path="bao-gia" element={<PricingEditor />} />
          <Route path="trang" element={<PagesEditor />} />
          <Route path="thu-vien" element={<StudioEditor />} />
          <Route path="danh-gia" element={<ReviewsEditor />} />
          <Route path="dat-lich" element={<BookingsEditor />} />
          <Route path="kho-anh" element={<MediaEditor />} />
          <Route path="tai-khoan" element={<AccountEditor />} />
        </Route>
        <Route path="*" element={<Navigate to="/adminbp" replace />} />
      </Routes>
    </div>
  );
}
