import { Link } from 'react-router-dom';
import { Palette, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'Gallery', path: '/gallery' },
      { name: 'Artists', path: '/artists' },
      { name: 'Store', path: '/store' },
      { name: 'Categories', path: '/categories' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Refund Policy', path: '/refund' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-[#f5f5f3] dark:bg-[#2d2a27] text-[#2d2a27] dark:text-[#fafaf9] border-t border-[#e8e7e5] dark:border-[#4a4642]">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-xl shadow-lg shadow-[#6d2842]/20">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">
                Artvinci
              </span>
            </Link>
            
            <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-6 max-w-md">
              Empowering global artists by connecting creativity with technology. 
              Discover, collect, and celebrate art from talented creators worldwide.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                <span className="text-[#5d5955] dark:text-[#c4bfb9]">info@artvinci.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                <span className="text-[#5d5955] dark:text-[#c4bfb9]">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                <span className="text-[#5d5955] dark:text-[#c4bfb9]">123 Art Street, Creative City, CC 12345</span>
              </div>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-[#2d2a27] dark:text-white font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[#2d2a27] dark:text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-[#2d2a27] dark:text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-[#e8e7e5] dark:border-[#4a4642]">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-[#2d2a27] dark:text-white font-semibold text-xl mb-3">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-6">
              Get the latest art news, featured artists, and exclusive offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] text-[#2d2a27] dark:text-white placeholder-[#9b9791] dark:placeholder-[#6d6762] focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] focus:border-[#6d2842] dark:focus:border-[#d4a343] transition-all"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:shadow-lg hover:shadow-[#6d2842]/30 text-white font-medium rounded-xl transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#e8e7e5] dark:border-[#4a4642]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-[#5d5955] dark:text-[#c4bfb9] text-sm">
              © {currentYear} Artvinci. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] hover:bg-gradient-to-br hover:from-[#6d2842] hover:to-[#a64d6d] text-[#5d5955] dark:text-[#c4bfb9] hover:text-white hover:border-transparent transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
