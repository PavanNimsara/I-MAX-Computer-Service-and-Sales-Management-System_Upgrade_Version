import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscribeStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus({ type: 'success', message: 'Successfully subscribed to newsletter!' });
      setEmail('');
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubscribeStatus(null);
      }, 5000);
    }, 1000);
  };

  const productCategories = [
    { name: 'CPUs & Processors', path: '/shop?category=CPU' },
    { name: 'Graphics Cards', path: '/shop?category=GPU' },
    { name: 'Motherboards', path: '/shop?category=Motherboard' },
    { name: 'Memory (RAM)', path: '/shop?category=RAM' },
    { name: 'Storage Devices', path: '/shop?category=Storage' },
    { name: 'Power Supplies', path: '/shop?category=PSU' }
  ];

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Shop', path: '/shop' },
    { name: 'Book Repair', path: '/create-appointment' },
    { name: 'Track Order', path: '/my-orders' },
    { name: 'Support', path: '/dashboard' }
  ];

  const customerService = [
    { name: 'Help Center', path: '/help' },
    { name: 'Returns & Refunds', path: '/returns' },
    { name: 'Shipping Info', path: '/shipping' },
    { name: 'Warranty', path: '/warranty' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:text-sky-400' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:text-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com', color: 'hover:text-blue-600' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: 'hover:text-red-500' }
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-sky-400 text-3xl font-bold mb-4">IMAX</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your trusted destination for premium computer parts, components, and expert repair services. Building better PCs since 2024.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h4 className="font-semibold text-lg mb-3 text-white">Subscribe to Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get updates on new products and special offers!
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-3 bg-sky-400 text-black font-semibold rounded-lg hover:bg-sky-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </button>
                {subscribeStatus && (
                  <div className={`flex items-center p-3 rounded-lg text-sm ${
                    subscribeStatus.type === 'success' 
                      ? 'bg-green-900/30 text-green-400 border border-green-700' 
                      : 'bg-red-900/30 text-red-400 border border-red-700'
                  }`}>
                    {subscribeStatus.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    )}
                    <span>{subscribeStatus.message}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-sky-400">Product Categories</h4>
            <ul className="space-y-2">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => navigate(category.path)}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-sky-400">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Customer Service */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-sky-400">Customer Service</h4>
            <ul className="space-y-2 mb-6">
              {customerService.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-sky-400 mb-3">Contact Us</h4>
              <a 
                href="mailto:support@imax.com" 
                className="flex items-start text-gray-400 hover:text-white transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 mr-3 mt-0.5 text-sky-400 flex-shrink-0" />
                <span>support@imax.com</span>
              </a>
              <a 
                href="tel:+94112345678" 
                className="flex items-start text-gray-400 hover:text-white transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 mr-3 mt-0.5 text-sky-400 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </a>
              <div className="flex items-start text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-sky-400 flex-shrink-0" />
                <span>123 Tech Street, Colombo 00700, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} IMAX. All rights reserved.</p>
              <p className="mt-1">
                Made with <span className="text-red-500">❤</span> by IMAX Team
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-lg text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-700`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm mr-2">We Accept:</span>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs font-semibold text-gray-300 border border-gray-700">
                  VISA
                </div>
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs font-semibold text-gray-300 border border-gray-700">
                  MASTER
                </div>
                <div className="px-3 py-1.5 bg-gray-800 rounded text-xs font-semibold text-gray-300 border border-gray-700">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-black/30 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-sky-400/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Genuine Products</p>
                <p className="text-gray-400 text-xs">100% Authentic</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-sky-400/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Fast Delivery</p>
                <p className="text-gray-400 text-xs">2-3 Business Days</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-sky-400/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Secure Payment</p>
                <p className="text-gray-400 text-xs">SSL Protected</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-sky-400/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">24/7 Support</p>
                <p className="text-gray-400 text-xs">Always Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}