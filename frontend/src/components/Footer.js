import React from 'react';
import { MapPin, Phone, Clock, ArrowUp } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { SHOP } from "../lib/shopInfo";

const SOCIAL_ICONS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
];

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
                    {SHOP.addressLines.map((line) => (
                        <p key={line} className="text-lg font-body tracking-tight font-medium">{line}</p>
                    ))}
                </div>
                </div>
                
                <div className="flex items-start space-x-3 ml-2">
                <Clock className="w-7 h-7 text-manta" />
                <p className='text-lg font-body tracking-tight font-medium'>{SHOP.hours}</p>
                </div>
                
                {SHOP.phone && (
                <div className="flex items-start space-x-3 ml-2 pt-2">
                <Phone className="w-7 h-7 text-manta" />
                <a href={SHOP.phoneHref} className='text-lg font-body tracking-tight font-medium hover:underline'>{SHOP.phone}</a>
                </div>
                )}
            </div>

            <a
                href={SHOP.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 bg-white border border-gray-300 font-heading font-medium text-black px-6 py-3 flex items-center space-x-2 hover:bg-gray-50 transition-colors"
            >
                <MapPin className="w-4 h-4" />
                <span>DIRECTIONS</span>
            </a>

            {/* Social links: only those set in .env are shown */}
            {SOCIAL_ICONS.some(({ key }) => SHOP.social[key]) && (
            <div className="mt-8 flex space-x-6 text-manta text-2xl">
                {SOCIAL_ICONS.filter(({ key }) => SHOP.social[key]).map(({ key, label, Icon }) => (
                    <a key={key} href={SHOP.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon /></a>
                ))}
            </div>
            )}
            </div>

            {/* Map Embed */}
            <div className="col-span-2 rounded-lg overflow-hidden w-full h-[450px] shadow-lg ">
            <iframe
                title="Map to Welcome Craft"
                src={SHOP.mapsEmbedUrl}
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
            aria-label="Back to top"
            className="fixed bottom-6 right-6 p-3 rounded-full bg-manta text-white shadow-lg hover:bg-opacity-80 transition"
        >
            <ArrowUp size={20} />
        </button>
        </section>

  );
}


