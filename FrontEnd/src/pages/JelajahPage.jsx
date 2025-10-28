import { useState, useEffect, useRef } from 'react';
import BukitKelam from '../assets/Kelam.jpg';
import DanauSentarum from '../assets/sentarum.jpg';
import TuguKhatulistiwa from '../assets/khatulistiwa.jpg';
import TuguDigulis from '../assets/digulis.jpg';
import JelajahKalbarImg from '../assets/Jelajah Kalbar.png'
import Kelam2 from '../assets/kelam2.jpg'
import Kelam3 from '../assets/bukitkelam3.jpg'
import Sentarum2 from '../assets/sentarum2.jpeg'
import Sentarum3 from '../assets/sentarum3.jpg'
import Khatulistiwa2 from '../assets/khatulistiwa2.jpg'
import Khatulistiwa3 from '../assets/khatulistiwa3.jpg'
import Digulis2 from '../assets/digulis2.jpg'
import Digulis3 from '../assets/digulis3.jpeg'


export default function JelajahKalBar() {
  // Sample data for destinations
  const destinations = [
    {
      id: 1,
      title: 'Bukit Kelam',
      location: 'Kabupaten Sintang',
      description: 'Bukit Kelam is a promising tourist destination in West Kalimantan. Famous for its majestic rock formations and panoramic views.',
      fullDescription: `Bukit Kelam is a monolithic rock and one of the most majestic natural wonders in West Kalimantan. Standing at approximately 900 meters above sea level, this massive black rock formation is often referred to as the "Black Rock" by locals. Visitors can enjoy hiking trails, breathtaking panoramic views, and experience the rich local culture surrounding this natural monument.`,
      highlights: ['Panoramic Views', 'Hiking Trails', 'Rock Climbing', 'Local Culture'],
      image: BukitKelam,
      gallery: [
        BukitKelam,
        Kelam2,
        Kelam3
      ]
    },
    {
      id: 2,
      title: 'Danau Sentarum',
      location: 'Kapuas Hulu',
      description: 'Danau Sentarum is a unique ecosystem of interconnected seasonal lakes in West Kalimantan, home to diverse wildlife and floating villages.',
      fullDescription: `Danau Sentarum National Park is a unique wetland ecosystem located in West Kalimantan. This extraordinary natural wonder consists of a complex system of interconnected seasonal lakes, flooding forests, and peat swamp forests. The park is home to various endemic species and indigenous communities living in floating villages, offering a glimpse into a harmonious relationship between humans and nature.`,
      highlights: ['Floating Villages', 'Endemic Wildlife', 'Boat Tours', 'Bird Watching'],
      image: DanauSentarum,
      gallery: [
        DanauSentarum,
        Sentarum2,
        Sentarum3
      ]
    },
    {
      id: 3,
      title: 'Tugu Khatulistiwa',
      location: 'Kota Pontianak',
      description: 'An iconic monument marking the equator line passing through Pontianak, offering a unique geographical experience.',
      fullDescription: `The Equator Monument (Tugu Khatulistiwa) is an iconic landmark located in Pontianak, marking the exact point where the equator line passes through the city. This monument offers visitors a unique geographical experience of standing in two hemispheres at once. The site includes a museum with exhibits about the equator and its significance, making it an educational as well as cultural landmark.`,
      highlights: ['Equator Experience', 'Museum', 'Cultural Significance', 'Solar Phenomena'],
      image: TuguKhatulistiwa,
      gallery: [
        TuguKhatulistiwa,
        Khatulistiwa2,
        Khatulistiwa3
      ]
    },
    {
      id: 4,
      title: 'Tugu Digulis',
      location: 'Kota Pontianak',
      description: 'A historical monument commemorating national heroes from West Kalimantan who fought for independence.',
      fullDescription: `Tugu Digulis is a historical monument located in Pontianak that commemorates the struggle and sacrifice of national heroes from West Kalimantan who fought for Indonesia's independence. The monument serves as an important reminder of the region's contribution to the nation's freedom and stands as a symbol of patriotism and courage.`,
      highlights: ['Historical Site', 'Cultural Heritage', 'Educational Value', 'Architectural Design'],
      image: TuguDigulis,
      gallery: [
        TuguDigulis,
        Digulis2,
        Digulis3
      ]
    },
  ];

  // State management
  const [featuredDestination, setFeaturedDestination] = useState(destinations[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  // Effect for parallax scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle destination selection
  const handleExplore = (destination) => {
    setFeaturedDestination(destination);
    setActiveTab('overview');
    setShowAllDestinations(false);
    window.scrollTo(0, 0);
  };

  // Toggle gallery
  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Carousel navigation
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculate parallax effect
  const parallaxStyle = {
    transform: `translateY(${scrollPosition * 0.3}px)`,
    opacity: 1 - scrollPosition / 1000
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner with Parallax Effect */}
      <div className="relative h-screen w-full overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${JelajahKalbarImg})`,
            ...parallaxStyle
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Jelajah Kal-Bar
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl">
            Discover the untamed beauty and rich cultural heritage of West Kalimantan
          </p>
          <div className="mt-8">
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-md text-white border border-white border-opacity-30 rounded-full px-8 py-3 font-medium hover:bg-opacity-30 transition duration-300"
            >
              Explore Destinations
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="animate-bounce">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Featured Destinations Carousel */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Destinations</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {destinations.map((destination) => (
            <div 
              key={destination.id}
              className="flex-none w-80 group"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{destination.title}</h3>
                  <div className="flex items-center text-white text-sm mb-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{destination.location}</span>
                  </div>
                  <button
                    onClick={() => handleExplore(destination)}
                    className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Featured Image Header */}
          <div className="relative h-96">
            <img
              src={featuredDestination.image}
              alt={featuredDestination.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{featuredDestination.title}</h1>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{featuredDestination.location}, Kalimantan Barat</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'gallery'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'highlights'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Highlights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {featuredDestination.fullDescription}
                </p>
                <div className="mt-8 flex flex-col md:flex-row md:space-x-4">
                  <div className="bg-gray-50 rounded-lg p-6 mb-4 md:mb-0 md:w-1/2">
                    <h3 className="text-xl font-semibold mb-4">Best Time to Visit</h3>
                    <p className="text-gray-600">
                      The best time to visit {featuredDestination.title} is during the dry season from May to September. During these months, the weather is pleasant with lower humidity and rainfall, making it ideal for outdoor activities and sightseeing.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 md:w-1/2">
                    <h3 className="text-xl font-semibold mb-4">How to Get There</h3>
                    <p className="text-gray-600">
                      {featuredDestination.title} is accessible via regular flights to Supadio International Airport in Pontianak, followed by a scenic drive through the countryside. Local transportation options include car rentals, guided tours, and public buses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredDestination.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => openGallery(index)}
                  >
                    <img src={image} alt={`${featuredDestination.title} - ${index + 1}`} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity duration-300">
                      <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'highlights' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-4">What to Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredDestination.highlights.map((highlight, index) => (
                      <div 
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 flex items-center"
                      >
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Local Insider Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Engage with local guides for authentic cultural experiences</li>
                    <li>Try traditional Dayak cuisine for a taste of authentic West Kalimantan</li>
                    <li>Respect local customs and traditions when visiting indigenous communities</li>
                    <li>Bring appropriate gear for outdoor activities and changing weather conditions</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exploration Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
              <p className="text-gray-300 mb-6">
                Discover more incredible destinations across West Kalimantan. From pristine beaches to lush rainforests, ancient temples to vibrant cultural festivals, there's always something new to experience.
              </p>
              <button className="bg-teal-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-teal-700 transition duration-300">
                View All Destinations
              </button>
            </div>
            {/* <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden">
                <img src="/api/placeholder/300/200" alt="Destination" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden">
                <img src="/api/placeholder/300/200" alt="Destination" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden">
                <img src="/api/placeholder/300/200" alt="Destination" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden">
                <img src="/api/placeholder/300/200" alt="Destination" className="w-full h-full object-cover" />
              </div>
            </div> */}
          </div>
        </div>
      </div>

      

      {/* Fullscreen Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            onClick={closeGallery}
            className="absolute top-6 right-6 text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="max-w-4xl max-h-full">
            <img 
              src={featuredDestination.gallery[currentImageIndex]} 
              alt={`${featuredDestination.title} gallery ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {featuredDestination.gallery.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  currentImageIndex === index ? 'bg-white' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : featuredDestination.gallery.length - 1))}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentImageIndex((prev) => (prev < featuredDestination.gallery.length - 1 ? prev + 1 : 0))}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}