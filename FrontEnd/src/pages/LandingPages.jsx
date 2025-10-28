import HeroSection from "../components/HeroSection";
import { destinations } from '../components/Destinations';
import DestinasiPage from "./DestinasiPage";
import TestimonialSection from "./TestimonialSections";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginPage";
import {Link} from "react-scroll"

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("autologin") === "true") {
      setShowLoginModal(true);
      setTimeout(() => {
        params.delete("autologin");
        navigate({ pathname: "/", search: "" }, { replace: true });
      }, 500);
    }
  }, [location, navigate]);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Hero Section */}
      <HeroSection />

      {/* Jelajah Kal-Bar Section */}
      <section id="destination-section" className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-16"
        >
          {/* Galeri Gambar */}
          <div className="lg:w-3/5 grid grid-cols-2 gap-4 relative">
            <div className="col-span-2 lg:col-span-1">
              <img
                src={destinations[0].image}
                alt={destinations[0].title}
                className="w-full h-80 object-cover rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="col-span-1 space-y-4">
              <img
                src={destinations[1].image}
                alt={destinations[1].title}
                className="w-full h-[9.5rem] object-cover rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
              />
              <img
                src={destinations[2].image}
                alt={destinations[2].title}
                className="w-full h-[9.5rem] object-cover rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>

          {/* Teks dan Statistik */}
          <div className="lg:w-2/5 relative z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                Jelajah <span className="text-teal-600">Kalimantan Barat</span>
              </h2>
              <div className="w-20 h-1 bg-teal-500 mb-6"></div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Temukan keindahan tersembunyi Kalimantan Barat yang menakjubkan. Dari pantai eksotis hingga hutan hujan tropis yang memukau, setiap sudut menawarkan petualangan dan pengalaman budaya yang tak terlupakan.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Divider dengan Ornamen */}
      <div className="relative py-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gradient-to-b from-white to-gray-50 px-4">
            <svg className="w-8 h-8 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L8 6h3v14h2V6h3L12 2z"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Discover Your Love Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-800"
            >
              Temukan Destinasi Favorit Anda
            </motion.h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto my-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Eksplorasi keindahan Kalimantan Barat yang beragam, dari pantai hingga pegunungan
            </p>
          </div>
          <DestinasiPage destinations={destinations} />
        </div>
      </section>

      {/* Testimonial Section dengan Background yang Lebih Menarik */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200 rounded-full opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-800"
            >
              Apa Kata Mereka
            </motion.h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto my-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pengalaman tak terlupakan dari para pengunjung Kalimantan Barat
            </p>
          </div>
          
          <TestimonialSection />
        </div>
      </section>

     {/* Call to Action Section */}
     <section className="py-20 bg-teal-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Menjelajahi Keindahan Kalimantan Barat?</h2>
            <p className="text-lg mb-8 text-teal-100">
              Mulai petualangan Anda sekarang dan ciptakan kenangan tak terlupakan
            </p>
            <Link
              to="destination-section"  // Scroll langsung ke bagian dengan ID "destination-section"
              smooth={true}
              duration={500} 
              offset={-50}  // Memberikan jarak sedikit setelah Hero Section
            >
              <button className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                Rencanakan Perjalanan Anda
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
