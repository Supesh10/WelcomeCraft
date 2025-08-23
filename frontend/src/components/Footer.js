import React from 'react';
import { MapPin, Phone, Clock, ArrowUp } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <section className="bg-ggrey bg-opacity-35 py-16 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Store Info */}
            <div className="col-span-1 flex flex-col justify-normal items-start">
            <h2 className="text-4xl font-teachers font-semibold tracking-tight text-manta mb-8">OUR STORE</h2>
            <div className="space-y-4 text-gray-600">
                <div className="flex items-start space-x-3">
                <MapPin className="w-10 h-12 pt-4 text-manta mt-1" />
                <div className='mr-4'>
                    <p className="text-lg font-body tracking-tight font-medium">Mahabuddhа Temple Road,</p>
                    <p className="text-lg font-body tracking-tight font-medium">Patan Sundhara</p>
                    <p className="text-lg font-body tracking-tight font-medium">Lalitpur, Nepal</p>
                </div>
                </div>
                
                <div className="flex items-start space-x-3 ml-2">
                <Clock className="w-7 h-7 text-manta" />
                <p className='text-lg font-body tracking-tight font-medium'>Sun-Fri 10am - 7pm</p>
                </div>
                
                <div className="flex items-start space-x-3 ml-2 pt-2">
                <Phone className="w-7 h-7 text-manta" />
                <p className='text-lg font-body tracking-tight font-medium'>Contact No : 9981267123</p>
                </div>
            </div>

            <a
                href="https://www.google.com/maps/place/Welcome+Handicraft+Center/@27.6694709,85.3267291,17z/data=!4m6!3m5!1s0x39eb190024179ed7:0x86947efc747405ad!8m2!3d27.669319!4d85.327684!16s%2Fg%2F11y674bk3_?entry=ttu&g_ep=EgoyMDI1MDcxNS4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 bg-white border border-gray-300 font-heading font-medium text-black px-6 py-3 flex items-center space-x-2 hover:bg-gray-50 transition-colors"
            >
                <span>DIRECTIONS</span>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </a>

            {/* Social Links */}
      {/* Social Icons */}
            <div className="mt-8 flex space-x-6 text-manta text-2xl">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
            </div>
            </div>

            {/* Map Embed */}
            <div className="col-span-2 rounded-lg overflow-hidden w-full h-[450px] shadow-lg ">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3533.547418712462!2d85.3267291!3d27.6694709!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190024179ed7%3A0x86947efc747405ad!2sWelcome%20Handicraft%20Center!5e0!3m2!1sen!2snp!4v1752839804910!5m2!1sen!2snp"
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
            ></iframe>
            </div>
        </div>

        {/* Scroll to Top Button */}
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-manta text-white shadow-lg hover:bg-opacity-80 transition"
        >
            <ArrowUp size={20} />
        </button>
        </section>

  );
}


