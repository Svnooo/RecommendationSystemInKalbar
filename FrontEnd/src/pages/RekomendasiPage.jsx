import { destinations } from '../components/Destinations'; // Pastikan path benar
import HeroSectionRS from "../components/HeroSectionRS";
import RecommendationForm from "./form";
import DestinasiPage from "./DestinasiPage"; 

const RekomendasiWisata = () => {
    return (
        <div>
            <HeroSectionRS />
            <br />
            <RecommendationForm />
            <br />
            {/* Kirim destinations sebagai props ke DestinasiPage */}
            {/* <DestinasiPage destinations={destinations} /> */}
        </div>
    );
};

export default RekomendasiWisata;
