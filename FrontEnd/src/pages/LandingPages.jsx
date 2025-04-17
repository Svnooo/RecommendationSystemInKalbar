import HeroSection from "../components/HeroSection"
import DestinasiPage from "./DestinasiPage"
import TestimonialSection from "./TestimonialSections"

const LandingPage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Jelajah Kal-Bar Section */}
      <div className="px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-12 lg:space-y-0">
          {/* Gambar */}
          <div className="flex flex-col items-center lg:flex-row lg:w-2/3 lg:space-x-6">
            <img
              src="https://via.placeholder.com/300x300?text=Image+1"
              alt="Destinasi 1"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg"
            />
            <img
              src="https://via.placeholder.com/300x300?text=Image+2"
              alt="Destinasi 2"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg -mt-16 lg:mt-0"
            />
            <img
              src="https://via.placeholder.com/300x300?text=Image+3"
              alt="Destinasi 3"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg -mt-16 lg:mt-0"
            />
          </div>

          {/* Teks dan Statistik */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <h2 className="text-3xl font-semibold text-gray-800">Jelajah Kal-Bar</h2>
            <p className="mt-4 text-lg text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
              purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor
              rhoncus dolor purus non enim praesent elementum facilisis leo, vel
              fringilla est ullamcorper eget nulla facilisi.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-teal-500">200+</span>
                <span className="text-lg text-gray-700">Destinasi Wisata</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-teal-500">500+</span>
                <span className="text-lg text-gray-700">Akomodasi</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-teal-500">500+</span>
                <span className="text-lg text-gray-700">Destinasi Kuliner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />

      {/* Discover Your Love Section */}
      <div className="px-1 py-2">
        <DestinasiPage /> {/* Komponen yang sudah Anda buat */}
      </div>

      {/* Testimonial Section */}
      <div className="bg-white-100 px-6 py-12">
        <TestimonialSection /> {/* Komponen Testimonial yang sudah Anda buat */}
      </div>
    </div>
  );
};

export default LandingPage;
