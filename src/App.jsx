import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import ListPage from "./pages/ListPage.jsx";
import Article from "./pages/Article.jsx";
import Contact from "./pages/Contact.jsx";
import Services from "./pages/Services.jsx";
import Pricing from "./pages/Pricing.jsx";
import LoBan from "./pages/LoBan.jsx";
import Album from "./pages/Album.jsx";
import { KeywordHub, KeywordPage } from "./pages/Keywords.jsx";
import AdminApp from "./adminbp/AdminApp.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/adminbp/*" element={<AdminApp />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gioi-thieu" element={<About />} />
        <Route path="/du-an" element={<ListPage kind="projects" />} />
        <Route path="/mau-nha" element={<ListPage kind="projects" />} />
        <Route path="/album" element={<Album />} />
        <Route path="/san-pham" element={<ListPage kind="products" />} />
        <Route path="/dich-vu" element={<Services />} />
        <Route path="/bao-gia" element={<Pricing />} />
        <Route path="/thuoc-lo-ban" element={<LoBan />} />
        <Route path="/tin-tuc" element={<ListPage kind="news" />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/tu-khoa" element={<KeywordHub />} />
        <Route path="/tu-khoa/:slug" element={<KeywordPage />} />
        <Route path="/:slug" element={<Article />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
