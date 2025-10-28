import { Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { Dribbble, Facebook, Github, Instagram, X } from "iconoir-react";

const LINKS = [
  {
    title: "Product",
    items: [
      {
        title: "Overview",
        href: "#",
      },
      {
        title: "Features",
        href: "#",
      },
      {
        title: "Solutions",
        href: "#",
      },
      {
        title: "Tutorials",
        href: "#",
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        title: "About us",
        href: "#",
      },
      {
        title: "Careers",
        href: "#",
      },
      {
        title: "Press",
        href: "#",
      },
      {
        title: "News",
        href: "#",
      },
    ],
  },
  {
    title: "Resource",
    items: [
      {
        title: "Blog",
        href: "#",
      },
      {
        title: "Newsletter",
        href: "#",
      },
      {
        title: "Events",
        href: "#",
      },
      {
        title: "Help center",
        href: "#",
      },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "#",
    ariaLabel: "Facebook",
    hoverColor: "hover:text-blue-500"
  },
  {
    icon: Instagram,
    href: "#",
    ariaLabel: "Instagram",
    hoverColor: "hover:text-pink-500"
  },
  {
    icon: X,
    href: "#",
    ariaLabel: "X",
    hoverColor: "hover:text-blue-400"
  },
  {
    icon: Github,
    href: "#",
    ariaLabel: "GitHub",
    hoverColor: "hover:text-gray-700"
  },
  {
    icon: Dribbble,
    href: "#",
    ariaLabel: "Dribbble",
    hoverColor: "hover:text-pink-400"
  },
];

const YEAR = new Date().getFullYear();

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function FooterWithSocialLinks() {
  return (
    <footer className="relative w-full bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500 opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="mx-auto w-full max-w-7xl px-8 py-16 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Brand Section */}
          <motion.div 
            className="md:col-span-4 lg:col-span-5"
            variants={itemVariants}
          >
            <Typography 
              variant="h4" 
              className="mb-4 text-white font-bold tracking-tight"
            >
              Arkanaya
            </Typography>
            <div className="h-1 w-16 bg-teal-500 mb-6"></div>
            <Typography className="mb-6 text-gray-400 text-base max-w-md">
              Jelajahi keindahan dan keunikan budaya Kalimantan Barat bersama Arkanaya. 
              Kami menawarkan pengalaman wisata yang tak terlupakan.
            </Typography>
            
            {/* Newsletter */}
            <div className="mt-8">
              <Typography className="text-white mb-3 font-medium">
                Subscribe to our newsletter
              </Typography>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="bg-teal-500 hover:bg-teal-600 text-white rounded px-4 py-2 transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Links Section */}
          <motion.div 
            className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {LINKS.map(({ title, items }) => (
              <motion.div key={title} variants={itemVariants}>
                <Typography className="mb-4 font-semibold text-white">
                  {title}
                </Typography>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.title}>
                      <Typography
                        as="a"
                        href={item.href}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-300 flex items-center gap-1 group"
                      >
                        <span className="h-px w-0 bg-teal-400 group-hover:w-3 transition-all duration-300"></span>
                        {item.title}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Typography className="text-gray-400 text-sm">
            &copy; {YEAR}{" "}
            <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
              Arkanaya
            </a>. All Rights Reserved.
          </Typography>
          
          {/* Social Links */}
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                aria-label={link.ariaLabel}
                className={`text-gray-400 ${link.hoverColor} transition-colors duration-300`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
          
          {/* Secondary Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}