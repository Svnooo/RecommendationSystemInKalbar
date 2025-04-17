import React from 'react';

const HeroSection = () => {
  return (
    <div className="hero bg-cover bg-center min-h-screen relative" style={{ backgroundImage: 'url("https://example.com/your-image.jpg")' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>
      
      <div className="hero-content text-center text-white relative z-10 flex flex-col justify-center items-center min-h-screen px-4">
        <h1 className="text-5xl font-bold mb-6 leading-tight">Explore the Beauty of Kalimantan</h1>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Discover breathtaking destinations and unique experiences that Kalimantan has to offer. Start your journey today!
        </p>
        <button className="btn px-6 py-3 text-xl rounded-md bg-customBlue hover:bg-blue-700 transition duration-300 ease-in-out">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
