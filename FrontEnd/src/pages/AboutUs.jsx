import { useState, useEffect } from 'react';
import { Heart, Users, Target, Sparkles, ArrowRight, Star, Globe, Award, Zap, Coffee } from 'lucide-react';
import ariel from '../assets/ariel.jpg'

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('visi');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: '10K+', label: 'Wisatawan Puas', icon: Users },
    { number: '150+', label: 'Destinasi Wisata', icon: Globe },
    { number: '50+', label: 'Paket Wisata', icon: Star },
    { number: '5', label: 'Tahun Pengalaman', icon: Award }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion untuk Wisata",
      description: "Kecintaan mendalam terhadap keindahan Kalimantan Barat mendorong kami memberikan yang terbaik.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Zap,
      title: "Inovasi Berkelanjutan",
      description: "Terus mengembangkan teknologi terdepan untuk pengalaman wisata yang tak terlupakan.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Komunitas Solid",
      description: "Membangun ekosistem pariwisata yang saling mendukung antara wisatawan dan pelaku lokal.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Target,
      title: "Fokus pada Kualitas",
      description: "Setiap rekomendasi dianalisis dengan cermat untuk memastikan kepuasan maksimal.",
      color: "from-green-500 to-teal-500"
    }
  ];

  const teamMembers = [
    {
      name: "Ariel Stevano",
      role: "Founder & CEO",
      photo: ariel,
      bio: "Visioner di balik platform yang mengubah cara menjelajahi Kalimantan Barat.",
      expertise: ["Strategic Planning", "Leadership", "Tourism Innovation","Critical Thinking"],
      social: { linkedin: "https://www.linkedin.com/in/arielstevano/", twitter: "#" },
      gradient: "from-teal-500 to-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-teal-50 font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-gray-600/10 rounded-3xl blur-3xl"></div>
        
        <div className={`relative text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-teal-600 to-gray-700 p-4 rounded-2xl shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 bg-clip-text text-transparent leading-tight">
            Tentang Kami
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Menghadirkan pengalaman wisata Kalimantan Barat yang tak terlupakan melalui teknologi dan dedikasi
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-gradient-to-r from-teal-500 to-gray-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vision & Mission Tabs */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-teal-900 bg-clip-text text-transparent">
            Visi & Misi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fondasi yang mendorong setiap langkah perjalanan kami
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-gradient-to-br from-teal-600 to-gray-700 p-8">
              <nav className="space-y-4">
                {[
                  { key: 'visi', label: 'Visi Kami', icon: Target },
                  { key: 'misi', label: 'Misi Kami', icon: ArrowRight },
                  { key: 'nilai', label: 'Nilai-Nilai', icon: Heart }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                        activeTab === tab.key
                          ? 'bg-white text-teal-600 shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="md:w-2/3 p-12">
              {activeTab === 'visi' && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Visi Kami</h3>
                  <p className="text-lg leading-relaxed text-gray-700">
                    Menjadi platform rekomendasi wisata terdepan yang menghadirkan solusi personal, akurat, dan berkelanjutan untuk menjelajahi keindahan Kalimantan Barat. Dengan teknologi graph knowledge dan algoritma cerdas, kami memberdayakan setiap perjalanan menjadi pengalaman yang bermakna dan tak terlupakan.
                  </p>
                  <div className="bg-gradient-to-r from-teal-50 to-gray-50 p-6 rounded-2xl border border-teal-100">
                    <p className="text-teal-800 font-medium italic">
                      "Setiap perjalanan adalah cerita, dan kami hadir untuk membuatnya istimewa."
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'misi' && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h3>
                  <div className="space-y-4">
                    {[
                      "Menghadirkan rekomendasi paket wisata yang disesuaikan dengan kebutuhan dan preferensi unik setiap pengguna",
                      "Mendukung pelestarian dan pengembangan pariwisata lokal melalui kolaborasi dengan komunitas setempat",
                      "Memberikan pengalaman pengguna yang mulus, intuitif, dan menyenangkan di setiap interaksi",
                      "Terus berinovasi dengan mengadopsi teknologi terbaru untuk meningkatkan kualitas layanan",
                      "Membangun ekosistem pariwisata yang berkelanjutan dan berdampak positif bagi masyarakat lokal"
                    ].map((mission, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-teal-400 to-gray-500 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{mission}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'nilai' && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Nilai-Nilai Kami</h3>
                  <div className="grid gap-6">
                    {values.map((value, index) => {
                      const IconComponent = value.icon;
                      return (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-teal-50 border border-gray-100">
                          <div className={`bg-gradient-to-r ${value.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h4>
                            <p className="text-gray-600">{value.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Centered */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-teal-900 bg-clip-text text-transparent">
            Tim Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Individu berbakat yang bersatu untuk menciptakan pengalaman wisata terbaik
          </p>
        </div>

        {/* Centered single team member */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`h-2 bg-gradient-to-r ${member.gradient}`}></div>
                
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${member.gradient} rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className={`bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent font-semibold mb-3`}>
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>

                  <div className="w-full">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Keahlian</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-teal-600 to-gray-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-gray-700/90"></div>
          <div className="relative">
            <Coffee className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Mari Berpetualang Bersama
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Bergabunglah dengan ribuan wisatawan yang telah mempercayai kami untuk menjelajahi keindahan Kalimantan Barat
            </p>
            <button className="bg-white text-teal-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto space-x-3">
              <span>Mulai Petualangan</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}