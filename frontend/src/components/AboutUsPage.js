import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  Heart,
  Sparkles,
  Star,
  Quote,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Package,
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AboutUsPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Sample testimonials - these would come from your testimonials API
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Sharma",
      location: "Kathmandu",
      rating: 5,
      comment:
        "Excellent quality Buddhist statues. The craftsmanship is remarkable and the silver work is authentic. Very satisfied with my purchase!",
      product: "Silver Buddha Statue",
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Priya Patel",
      location: "Mumbai",
      rating: 5,
      comment:
        "Beautiful thangka paintings and very professional service. The team was helpful in explaining the spiritual significance of each piece.",
      product: "Thangka Painting",
      date: "1 month ago",
    },
    {
      id: 3,
      name: "David Chen",
      location: "Singapore",
      rating: 5,
      comment:
        "Outstanding products and great customer service. The live silver pricing is very transparent and fair. Highly recommended!",
      product: "Silver Prayer Wheel",
      date: "3 weeks ago",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000); // Auto-rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Hero Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-3xl">🕉</span>
            </div>
            <h1
              className="text-4xl lg:text-5xl font-display font-bold mb-6"
              style={{ color: "var(--dark-gray)" }}
            >
              About Welcome Craft
            </h1>
            <p
              className="text-xl leading-relaxed"
              style={{ color: "var(--stone-gray)" }}
            >
              Preserving the sacred art of Buddhist handicrafts through
              authentic craftsmanship, spiritual devotion, and modern
              transparency in precious metal pricing.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Our Story Section */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-3xl font-display font-bold mb-6"
                style={{ color: "var(--dark-gray)" }}
              >
                Our Story
              </h2>
              <div
                className="space-y-6 text-lg leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                <p>
                  Welcome Craft was born from a deep reverence for Buddhist
                  traditions and the ancient art of metalworking. Founded by
                  master craftsmen who have dedicated their lives to preserving
                  the sacred techniques passed down through generations.
                </p>
                <p>
                  Our journey began in the heart of Nepal, where skilled
                  artisans have been creating spiritual artifacts for centuries.
                  Each piece we craft carries the essence of meditation,
                  devotion, and the timeless wisdom of Buddhist philosophy.
                </p>
                <p>
                  Today, we combine traditional craftsmanship with modern
                  transparency, offering live precious metal pricing and direct
                  communication with our customers. We believe that spiritual
                  art should be accessible, authentic, and fairly priced.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544967082-d9759f1e2007?ixlib=rb-4.0.3"
                    alt="Traditional Buddhist Craftsmanship"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="card overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3"
                    alt="Artisan at Work"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              <div className="mt-8">
                <div className="card overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3"
                    alt="Buddhist Temple"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Our Values
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--stone-gray)" }}
            >
              The principles that guide our craft and our commitment to
              preserving Buddhist heritage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart size={32} className="text-blue-600" />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Spiritual Devotion
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                Every piece is crafted with meditation and reverence, infusing
                spiritual energy into each creation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Award size={32} className="text-green-600" />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Authentic Craftsmanship
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                Traditional techniques preserved through generations of master
                artisans and their disciples.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles size={32} className="text-purple-600" />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Modern Transparency
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                Live precious metal pricing and open communication ensure fair
                and honest transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <Users size={32} className="text-yellow-600" />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Personal Service
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                Direct communication and personalized attention for every
                customer's spiritual journey.
              </p>
            </div>
          </div>
        </section>

        {/* Craftsmanship Process */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Our Craftsmanship Process
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--stone-gray)" }}
            >
              From raw materials to sacred artifacts - a journey of devotion and
              skill
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                  1
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Material Selection
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--stone-gray)" }}
                >
                  We source only the finest silver and gold, ensuring purity and
                  quality. Each metal is blessed before the crafting process
                  begins.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                  2
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Sacred Crafting
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Master artisans work in meditation, using traditional tools
                  and techniques passed down through generations. Each piece is
                  shaped with intention and devotion.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl">
                  3
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Blessing & Completion
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Finished pieces are blessed by monks and undergo final quality
                  checks before being carefully packaged for their journey to
                  you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              What Our Customers Say
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--stone-gray)" }}
            >
              Stories from our spiritual community around the world
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="card-body p-8">
                <div className="flex items-center justify-between mb-6">
                  <Quote
                    size={48}
                    style={{ color: "var(--saffron)" }}
                    className="opacity-50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={prevTestimonial}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className="text-yellow-400 fill-current"
                        />
                      )
                    )}
                  </div>

                  <blockquote
                    className="text-lg italic mb-6 leading-relaxed"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    "{testimonials[currentTestimonial].comment}"
                  </blockquote>

                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      {testimonials[currentTestimonial].location} •{" "}
                      {testimonials[currentTestimonial].product}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      {testimonials[currentTestimonial].date}
                    </p>
                  </div>
                </div>

                {/* Testimonial Dots */}
                <div className="flex justify-center mt-8 gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentTestimonial
                          ? "bg-saffron"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      style={{
                        backgroundColor:
                          index === currentTestimonial
                            ? "var(--saffron)"
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Why Choose Welcome Craft
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield size={32} className="text-blue-600" />
                </div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Authenticity Guaranteed
                </h3>
                <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                  Every piece comes with authenticity certification and
                  spiritual blessing documentation.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Package size={32} className="text-green-600" />
                </div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Secure Packaging
                </h3>
                <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                  Sacred packaging methods ensure your spiritual artifacts
                  arrive safely and blessed.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle size={32} className="text-purple-600" />
                </div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Personal Guidance
                </h3>
                <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                  Our team provides spiritual guidance and cultural context for
                  each piece you purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Get In Touch
            </h2>
            <p className="text-lg" style={{ color: "var(--stone-gray)" }}>
              Have questions about our products or Buddhist traditions? We're
              here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Visit Our Workshop
                  </h3>
                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                    Thamel, Kathmandu, Nepal
                    <br />
                    Traditional Buddhist Craft District
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Call or WhatsApp
                  </h3>
                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                    {process.env.WHATSAPP_NUMBER}
                    <br />
                    <br />
                    Available 24/7 for spiritual guidance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Email Us
                  </h3>
                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                    info@welcomecraft.com
                    <br />
                    We respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Workshop Hours
                  </h3>
                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                    Sunday - Friday: 8:00 AM - 6:00 PM
                    <br />
                    Saturday: 9:00 AM - 4:00 PM (NST)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Start Your Spiritual Journey
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Explore our collection of authentic Buddhist handicrafts
                </p>
                <div className="space-y-3">
                  <Link to="/products" className="btn btn-primary w-full">
                    <Package size={20} className="mr-2" />
                    Browse Our Collection
                  </Link>
                  <button
                    onClick={() => {
                      const message =
                        "Hello! I'd like to know more about Welcome Craft and your Buddhist handicrafts.";
                      const whatsappUrl = `https://wa.me/${
                        process.env.WHATSAPP_NUMBER
                      }?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="btn btn-outline w-full text-green-600 border-green-600 hover:bg-green-600"
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
