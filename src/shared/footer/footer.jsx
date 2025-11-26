import React from 'react';
import { MapPin ,Plane , Mail , Phone, Facebook  , Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold">Gawalaty</span>
            </div>
            <p className="text-gray-300 mb-4">
              Discover the wonders of Egypt with our expertly guided tours. From ancient pyramids to pristine beaches, 
              we offer unforgettable experiences that showcase the best of Egyptian culture and history.
            </p>
            <div className="flex space-x-4">
              <Facebook  className="h-5 w-5 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">

              <li><Link href="/about" className="hover:text-amber-600 transition-colors">About Us</Link></li>

              <li><Link href="/" className="hover:text-amber-600 transition-colors">Our Tours</Link></li>

              <li><Link href="/contact" className="hover:text-amber-600 transition-colors">Contact</Link></li>
              
              <li><Link href="/FAQ" className="hover:text-amber-600 transition-colors">FAQ</Link></li>

              <li><Link href="/terms-of-service" className="hover:text-amber-600 transition-colors">Terms of Service</Link></li>
              
              <li><Link href="/privacy-policy" className="hover:text-amber-600 transition-colors">Privacy & Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail  className="h-4 w-4" />
                <Link className='underline' href={"mailto:support@gawalaty.com"}>support@gawalaty.com</Link>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(+20) 2-XXXX-XXXX</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>123 Tahrir Square<br />Cairo, Egypt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Gawalaty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}