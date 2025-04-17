import {
  Button,
  Collapse,
  IconButton,
  Navbar,
  Typography,
} from "@material-tailwind/react";
import {
  InfoCircle,
  Menu,
  Globe,
  Xmark,
  Home,
  Train,
} from "iconoir-react";
import * as React from "react";

const LINKS = [
  {
    icon: Home,
    title: "Beranda",
    href: "/",
  },
  {
    icon: Globe,
    title: "Jelajah Kalbar",
    href: "#",
  },
  {
    icon: Train,
    title: "Rekomendasi Wisata",
    href: "/rekomendasi", // Rujuk ke bagian rekomendasi di URL
  },
  {
    icon: InfoCircle,
    title: "Tentang Kami",
    href: "#",
  },
];

function NavList() {
  return (
    <ul className="mt-4 flex flex-col gap-x-3 gap-y-1.5 lg:mt-0 lg:flex-row lg:items-center lg:justify-center">
      {LINKS.map(({ icon: Icon, title, href }) => (
        <li key={title}>
          <Typography
            as="a"
            href={href}
            type="small"
            className="flex items-center gap-x-2 p-1 hover:text-primary font-bold"
          >
            <Icon className="h-4 w-4" />
            {title}
          </Typography>
        </li>
      ))}
    </ul>
  );
}

export default function NavbarDemo() {
  const [openNav, setOpenNav] = React.useState(false);
  const [scrolling, setScrolling] = React.useState(false);
  const [isLandingPage, setIsLandingPage] = React.useState(true); // State untuk cek halaman
  const [isRekomendasiPage, setIsRekomendasiPage] = React.useState(false); // State untuk cek halaman rekomendasi

  // Handle scroll event
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true); // Navbar berubah saat di-scroll
      } else {
        setScrolling(false); // Navbar kembali saat di atas
      }
    };

    // Cek apakah kita berada di Landing Page atau Rekomendasi Wisata
    if (window.location.pathname === "/") {
      setIsLandingPage(true);
      setIsRekomendasiPage(false);
    } else if (window.location.pathname === "/rekomendasi") {
      setIsRekomendasiPage(true);
      setIsLandingPage(false);
    } else {
      setIsLandingPage(false);
      setIsRekomendasiPage(false);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Navbar
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        (scrolling && isLandingPage) || (scrolling && isRekomendasiPage)
          ? "bg-white"
          : "bg-transparent"
      }`} // Transparan di landing page dan rekomendasi page, putih di scroll
    >
      <div className="flex items-center justify-between w-full px-4 py-2 lg:px-8">
        <Typography
          as="a"
          href="#"
          type="medium"
          className="ml-2 mr-2 block py-1 font-semibold"
        >
          Arkanaya
        </Typography>
        <div className="hidden lg:block flex-grow">
          <NavList />
        </div>
        <Button size="sm" className="hidden lg:ml-auto lg:inline-block">
          Sign In
        </Button>
        <IconButton
          size="sm"
          variant="ghost"
          color="secondary"
          onClick={() => setOpenNav(!openNav)}
          className="ml-auto grid lg:hidden"
        >
          {openNav ? (
            <Xmark className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
        <Button isFullWidth size="sm" className="mt-4">
          Sign In
        </Button>
      </Collapse>
    </Navbar>
  );
}
