import React from "react";
import DestinasiCard from "../components/DestinasiCard";

const DestinasiPage = () => {
  const destinasi = [
    {
      title: "Taman Nasional Borneo",
      image: "https://example.com/taman-borneo.jpg",
      description: "Discover the rich wildlife and forest of Borneo.",
    },
    {
      title: "Pantai Kalbar",
      image: "https://example.com/pantai-kalbar.jpg",
      description: "Relax and enjoy the stunning beaches in Kalimantan.",
    },
    {
      title: "Pantai Kalbar",
      image: "https://example.com/pantai-kalbar.jpg",
      description: "Relax and enjoy the stunning beaches in Kalimantan.",
    },
    {
      title: "Taman Nasional Borneo",
      image: "https://example.com/taman-borneo.jpg",
      description: "Discover the rich wildlife and forest of Borneo.",
    },
    {
      title: "Pantai Kalbar",
      image: "https://example.com/pantai-kalbar.jpg",
      description: "Relax and enjoy the stunning beaches in Kalimantan.",
    },
    {
      title: "Pantai Kalbar",
      image: "https://example.com/pantai-kalbar.jpg",
      description: "Relax and enjoy the stunning beaches in Kalimantan.",
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-6">
      <div className="w-full max-w-screen-xl">
        {/* Title for Discover Your Love */}
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Discover Your Love
        </h2>
        {/* Grid for Destinasi Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinasi.map((item, index) => (
            <DestinasiCard
              key={index}
              title={item.title}
              image={item.image}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinasiPage;
