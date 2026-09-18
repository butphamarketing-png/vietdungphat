import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import ListPage from "./pages/ListPage.jsx";
import Article from "./pages/Article.jsx";
import Contact from "./pages/Contact.jsx";
import Services from "./pages/Services.jsx";
import Pricing from "./pages/Pricing.jsx";
import LoBan from "./pages/LoBan.jsx";
import AdminApp from "./adminbp/AdminApp.jsx";

export default function App() {
  useEffect(() => {
    if (!document.title || !document.title.trim()) {
      document.title = "Việt Dũng Phát — Atelier kiến trúc & nội thất";
    }
  }, []);

  return (
    <Routes>
      <Route path="/adminbp/*" element={<AdminApp />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gioi-thieu" element={<About />} />
        <Route path="/du-an" element={<ListPage kind="projects" />} />
        <Route path="/mau-nha" element={<ListPage kind="projects" />} />
        <Route path="/san-pham" element={<ListPage kind="products" />} />
        <Route path="/dich-vu" element={<Services />} />
        <Route path="/bao-gia" element={<Pricing />} />
        <Route path="/thuoc-lo-ban" element={<LoBan />} />
        <Route path="/tin-tuc" element={<ListPage kind="news" />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/:slug" element={<Article />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
