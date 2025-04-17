import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FooterWithSocialLinks from './components/Footer';
import DarkNavbar from './components/Navbar';
import LandingPage from './pages/LandingPages';
import RekomendasiWisata from './pages/RekomendasiPage';

import './index.css';

function App() {
  return (
    <Router>
      <DarkNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Rekomendasi" element={<RekomendasiWisata/>}/>
      </Routes>
      <FooterWithSocialLinks />
    </Router>
  );
}


export default App
