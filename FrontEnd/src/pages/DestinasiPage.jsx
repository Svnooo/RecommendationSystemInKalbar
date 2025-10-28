import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { destinations } from "../components/Destinations";

const DestinasiPage = ({ destinations }) => {
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="rounded-lg overflow-hidden shadow-md border border-gray-200 flex flex-col"
            >
              <img
                src={destination.image}
                alt={destination.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col">
                <h4 className="font-semibold text-lg mb-2">{destination.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
                {/* Explore button */}
                <Link
                  to="/Jelajah-Kalbar" 
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium mt-auto flex items-center justify-center"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinasiPage;
