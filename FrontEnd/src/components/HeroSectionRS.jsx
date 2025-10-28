import React from 'react';
import RSimg from '../assets/RS.png'

const HeroSectionRS = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image - Venice with gondolas */}
      <div className="absolute inset-0 bg-cover bg-center" 
           style={{ backgroundImage: `url(${RSimg})` }}>
      </div>
      
      <div className="relative z-10 flex items-center justify-between h-full min-h-screen px-8">
        {/* Left side content - now vertically centered */}
        <div className="text-white max-w-md">
          {/* Main Title */}
          <h1 className="text-5xl font-bold mb-4">Rekomendasi Wisata</h1>
          
          {/* Description - Lorem ipsum placeholder text as shown in the image */}
          <p className="mb-6 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, 
            purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor 
            rhoncus dolor purus non enim luctus venenatis, lectus magna fringilla 
            urna, porttitor rhoncus dolor purus non eni
          </p>
          
          {/* CTA Button */}
          <button className="bg-teal-500 text-white px-6 py-2 rounded text-sm">
            Temukan Rekomendasi Untuk Anda!
          </button>
        </div>
        
        {/* Category Cards - now positioned in the flex container */}
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          {/* Card 1 - Wisata Alam */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center w-36 h-32">
            <div className="w-8 h-8 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9l7-7 7 7v11a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="text-gray-800 text-center text-sm">Wisata Alam</p>
          </div>
          
          {/* Card 2 - Wisata Sejarah */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center w-36 h-32">
            <div className="w-8 h-8 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-800 text-center text-sm">Wisata Sejarah</p>
          </div>
          
          {/* Card 3 - Akomodasi menginap */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center w-36 h-32">
            <div className="w-8 h-8 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-gray-800 text-center text-sm">Akomodasi menginap</p>
          </div>
          
          {/* Card 4 - Wisata Kuliner */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center w-36 h-32">
            <div className="w-8 h-8 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-800 text-center text-sm">Wisata Kuliner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionRS;