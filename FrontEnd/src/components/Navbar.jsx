import {
  Button,
  Collapse,
  IconButton,
  Navbar,
  Typography,
} from "@material-tailwind/react";
import {
  Globe,
  Home,
  InfoCircle,
  Menu,
  Train,
  Xmark,
} from "iconoir-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginModal from "../pages/LoginPage";

const LINKS = [
  {
    icon: Home,
    title: "Beranda",
    href: "/",
  },
  {
    icon: Globe,
    title: "Jelajah Kalbar",
    href: "/Jelajah-Kalbar",
  },
  {
    icon: Train,
    title: "Rekomendasi Wisata",
    href: "/rekomendasi",
  },
  {
    icon: InfoCircle,
    title: "Tentang Kami",
    href: "/AboutUs",
  },
];

function NavList() {
  const location = useLocation();

  return (
    <ul className="mt-4 flex flex-col gap-x-3 gap-y-1.5 lg:mt-0 lg:flex-row lg:items-center lg:justify-center">
      {LINKS.map(({ icon: Icon, title, href }) => {
        const isActive = location.pathname === href;

        return (
          <li key={title}>
            <a
              href={href}
              className="group relative flex flex-col items-center px-4 py-2"
            >
              <div
                className={`flex items-center gap-x-2 text-sm font-medium transition-all duration-300
                  ${isActive ? "text-teal-500" : "text-gray-900 group-hover:text-teal-500"}
                `}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-teal-500" : "text-gray-900"
                    }`}
                />
                <span>{title}</span>
              </div>
              <div
                className={`mt-1 h-0.5 w-full rounded-full transition-all duration-300 ${isActive
                    ? "bg-teal-500"
                    : "group-hover:bg-teal-300"
                  }`}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function NavbarDemo() {
  const [openNav, setOpenNav] = React.useState(false);
  const [scrolling, setScrolling] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [loginModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token"); // hapus token saat logout
    setUser(null);
  };
  

  return (
    <>
      <Navbar
        className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
          ${scrolling ? "bg-white shadow-md" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between w-full px-6 py-4 lg:px-12">
          <Typography
            as="a"
            href="/"
            type="medium"
            className="ml-2 mr-2 text-gray-900 font-semibold text-2xl"
          >
            Arkanaya
          </Typography>
          <div className="hidden lg:block flex-grow">
            <NavList />
          </div>
          {user ? (
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-gray-800 font-semibold">Hi, {user.username}</span>
              <Button
                size="sm"
                onClick={handleLogout}
                className="rounded-md px-6 py-2.5 bg-red-500 text-white font-medium shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="hidden lg:inline-block rounded-md px-6 py-2.5 bg-customBlue text-white font-medium shadow-sm hover:bg-teal-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200"
              onClick={() => setLoginModalOpen(true)}
            >
              <span className="flex items-center">Login</span>
            </Button>
          )}
          <IconButton
            size="sm"
            variant="ghost"
            color="secondary"
            onClick={() => setOpenNav(!openNav)}
            className="ml-auto grid lg:hidden"
          >
            {openNav ? (
              <Xmark className="h-5 w-5 text-gray-900" />
            ) : (
              <Menu className="h-5 w-5 text-gray-900" />
            )}
          </IconButton>
        </div>

        {/* Collapse menu untuk mobile */}
        <div className="lg:hidden">
          <Collapse open={openNav}>
            <div className="px-6 pb-4">
              <NavList />
              {user ? (
                <>
                  <div className="mt-2 text-gray-800 font-semibold">Hi, {user.username}</div>
                  <Button
                    fullWidth
                    size="sm"
                    onClick={handleLogout}
                    className="mt-2 bg-red-500 text-white font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  size="sm"
                  className="mt-4 bg-customBlue text-white font-medium rounded-md shadow-sm hover:bg-teal-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200"
                  onClick={() => setLoginModalOpen(true)}
                >
                  Login
                </Button>
              )}
            </div>
          </Collapse>
        </div>
      </Navbar>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setUser(user);        // Update state di navbar langsung
          setLoginModalOpen(false);
        }}
      />

    </>
  );
}