import React from "react";
import { Link } from "react-router-dom";
import { Users, Award, Heart, Sparkles, MapPin, Clock, MessageCircle, Package, Shield, Phone } from "lucide-react";
import { SHOP, whatsappLink } from "../lib/shopInfo";

const VALUES = [
  {
    Icon: Heart,
    bg: "bg-blue-100",
    fg: "text-blue-600",
    title: "Spiritual Devotion",
    text: "Every piece is crafted with meditation and reverence, infusing spiritual energy into each creation.",
  },
  {
    Icon: Award,
    bg: "bg-green-100",
    fg: "text-green-600",
    title: "Authentic Craftsmanship",
    text: "Traditional techniques preserved through generations of master artisans and their disciples.",
  },
  {
    Icon: Sparkles,
    bg: "bg-purple-100",
    fg: "text-purple-600",
    title: "Modern Transparency",
    text: "Live precious metal pricing and open communication ensure fair and honest transactions.",
  },
  {
    Icon: Users,
    bg: "bg-yellow-100",
    fg: "text-yellow-600",
    title: "Personal Service",
    text: "Direct communication and personalized attention for every customer's spiritual journey.",
  },
];

const PROCESS = [
  {
    title: "Material Selection",
    text: "We source only the finest silver, copper and bronze, ensuring purity and quality before the crafting process begins.",
  },
  {
    title: "Sacred Crafting",
    text: "Master artisans use traditional tools and techniques passed down through generations. Each piece is shaped with intention and devotion.",
  },
  {
    title: "Finishing & Care",
    text: "Finished pieces are gilded, polished or oxidized as required, checked carefully and packaged for their journey to you.",
  },
];

// What the shop actually sells, matching the product categories
const COLLECTIONS = [
  {
    title: "Silver",
    text: "Statues and ornaments ready in stock, or made to your chosen weight, size and design. Priced on the day's silver rate plus making charge.",
    link: "/products?categoryName=Silver",
  },
  {
    title: "Gold finishes",
    text: "Oxidized, color, half gold and full gold statues. Full gold pieces are electroplated or fire gold plated.",
    link: "/products?categoryName=Gold",
  },
  {
    title: "Copper & Bronze",
    text: "Traditional sculptures and statues of the Buddha, bodhisattvas and deities, cast and finished by hand.",
    link: "/products",
  },
];

const WHY = [
  {
    Icon: Shield,
    bg: "bg-blue-100",
    fg: "text-blue-600",
    title: "Clear, Fair Pricing",
    text: "Silver prices follow the published daily rate, and we confirm the final price with you before you pay.",
  },
  {
    Icon: Package,
    bg: "bg-green-100",
    fg: "text-green-600",
    title: "Secure Packaging",
    text: "Every piece is carefully packed so your statue or ornament arrives safely.",
  },
  {
    Icon: MessageCircle,
    bg: "bg-purple-100",
    fg: "text-purple-600",
    title: "Personal Guidance",
    text: "Our team helps you choose the right piece and explains its meaning and tradition.",
  },
];

const heading = { color: "var(--dark-gray)" };
const muted = { color: "var(--stone-gray)" };

const AboutUsPage = () => {
  const chatUrl = whatsappLink("Hello! I'd like to know more about Welcome Craft and your Buddhist handicrafts.");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-3xl" aria-hidden="true">
              🕉
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6" style={heading}>
            About Welcome Craft
          </h1>
          <p className="text-xl leading-relaxed" style={muted}>
            Preserving the sacred art of Buddhist handicrafts through authentic craftsmanship, spiritual devotion, and modern
            transparency in precious metal pricing.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-16">
        {/* Story */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6" style={heading}>
                Our Story
              </h2>
              <div className="space-y-6 text-lg leading-relaxed" style={muted}>
                <p>
                  Welcome Craft was born from a deep reverence for Buddhist traditions and the ancient art of metalworking. Founded
                  by master craftsmen who have dedicated their lives to preserving the sacred techniques passed down through
                  generations.
                </p>
                <p>
                  Our workshop is in Patan, the historic city of artisans, where skilled craftsmen have been creating spiritual
                  artifacts for centuries. Each piece we craft carries the essence of meditation, devotion, and the timeless wisdom
                  of Buddhist philosophy.
                </p>
                <p>
                  Today, we combine traditional craftsmanship with modern transparency, offering live silver pricing and direct
                  communication with our customers. We believe that spiritual art should be accessible, authentic, and fairly
                  priced.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <img src="/images/guru.jpg" alt="Gold finished statue of Guru Rinpoche" className="w-full h-56 object-cover" />
                </div>
                <div className="card overflow-hidden">
                  <img src="/images/bajra.jpg" alt="Hand-finished deity statue" className="w-full h-40 object-cover" />
                </div>
              </div>
              <div className="mt-8">
                <div className="card overflow-hidden">
                  <img src="/images/Buddha1.jpg" alt="Seated Buddha statue" className="w-full h-72 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we make */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4" style={heading}>
              What We Make
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={muted}>
              Buddhist sculptures, statues and ornaments in silver, gold finishes, copper and bronze
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {COLLECTIONS.map((c) => (
              <Link key={c.title} to={c.link} className="card group">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-3 group-hover:underline" style={heading}>
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={muted}>
                    {c.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4" style={heading}>
              Our Values
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={muted}>
              The principles that guide our craft and our commitment to preserving Buddhist heritage
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ Icon, bg, fg, title, text }) => (
              <div key={title} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon size={32} className={fg} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={heading}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={muted}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4" style={heading}>
              Our Craftsmanship Process
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={muted}>
              From raw materials to sacred artifacts — a journey of devotion and skill
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PROCESS.map((step, i) => (
              <div key={step.title} className="card">
                <div className="card-body text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-4" style={heading}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={muted}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why us */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold mb-12 text-center" style={heading}>
            Why Choose Welcome Craft
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {WHY.map(({ Icon, bg, fg, title, text }) => (
              <div key={title} className="card">
                <div className="card-body text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon size={32} className={fg} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3" style={heading}>
                    {title}
                  </h3>
                  <p className="text-sm" style={muted}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visit / contact */}
        <section className="bg-white rounded-lg p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-display font-bold" style={heading}>
                Visit Our Shop
              </h2>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <p style={muted}>
                  {SHOP.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-600 flex-shrink-0" />
                <p style={muted}>{SHOP.hours}</p>
              </div>
              {SHOP.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-green-600 flex-shrink-0" />
                  <a href={SHOP.phoneHref} className="hover:underline" style={muted}>
                    {SHOP.phone}
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Link to="/products" className="btn btn-primary w-full">
                <Package size={20} className="mr-2" />
                Browse Our Collection
              </Link>
              <Link to="/contact" className="btn btn-secondary w-full">
                Contact Us
              </Link>
              {chatUrl && (
                <a
                  href={chatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline w-full text-green-600 border-green-600 hover:bg-green-600"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
