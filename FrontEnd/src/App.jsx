import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import FooterWithSocialLinks from "./components/Footer";
import NavbarComponent from "./components/Navbar";
import "./index.css";
import LandingPage from "./pages/LandingPages";
import RegisterPage from "./pages/RegisterPage";
import RekomendasiWisata from "./pages/RekomendasiPage";
import JelajahKalBar from "./pages/JelajahPage";
import AdminDashboard from "./pages/AdminPage";
import AboutUs from "./pages/AboutUs";

function AppWrapper() {
  // Gunakan hook useLocation untuk cek path sekarang
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/Admin");

  return (
    <>
      {!isAdminPage && <NavbarComponent />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Rekomendasi" element={<RekomendasiWisata />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/Jelajah-Kalbar" element={<JelajahKalBar />} />
        <Route path="/Admin" element={<AdminDashboard />} />
        <Route path="/AboutUs" element={<AboutUs />} />
      </Routes>
      <FooterWithSocialLinks />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
