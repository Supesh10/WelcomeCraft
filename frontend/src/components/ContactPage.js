import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, Navigation } from "lucide-react";
import { SHOP, whatsappLink } from "../lib/shopInfo";

const TOPICS = [
  "General question",
  "Custom order",
  "An order I've placed",
  "Visiting the shop",
  "Wholesale or bulk order",
];

// Answers based on how the shop works (see the product, cart and checkout pages)
const FAQS = [
  {
    q: "How are silver prices worked out?",
    a: "Silver pieces are priced on the day's silver rate per tola, multiplied by the weight, plus a making charge. The rate is shown on every silver product, and the final price is confirmed with you before you pay.",
  },
  {
    q: "Can I order a custom piece?",
    a: "Yes. Custom silver pieces let you choose the weight, size and design on the product page. The production time is shown there too. You can change the details from your cart until you place the order.",
  },
  {
    q: "How do I pay?",
    a: "There is no online payment. After you place an order, our team contacts you to confirm availability, the final price, payment and delivery.",
  },
  {
    q: "Which gold finishes do you offer?",
    a: "Oxidized, color, half gold and full gold. Full gold pieces are either electroplated or fire gold plated. Each product shows its finish; ask us if you'd like a piece in a different finish.",
  },
];

const EMPTY = { name: "", contact: "", topic: TOPICS[0], message: "" };

function InfoCard({ Icon, bg, fg, title, children }) {
  return (
    <div className="card">
      <div className="card-body flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={fg} />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold mb-1" style={{ color: "var(--dark-gray)", fontSize: "1rem" }}>
            {title}
          </h2>
          <div className="text-sm space-y-1" style={{ color: "var(--stone-gray)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const canSend = Boolean(SHOP.whatsapp || SHOP.email);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
    setSent(false);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please tell us your name";
    if (!form.contact.trim()) e.contact = "Please add a phone number or email so we can reply";
    if (form.message.trim().length < 5) e.message = "Please write your message";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const composed = () =>
    `Hello Welcome Craft,\n\nTopic: ${form.topic}\n\n${form.message.trim()}\n\n— ${form.name.trim()} (${form.contact.trim()})`;

  // Messages go out through WhatsApp (preferred) or the visitor's email app
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const url = SHOP.whatsapp
      ? whatsappLink(composed())
      : `mailto:${SHOP.email}?subject=${encodeURIComponent(`${form.topic} — ${form.name.trim()}`)}&body=${encodeURIComponent(composed())}`;
    window.open(url, SHOP.whatsapp ? "_blank" : "_self");
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4" style={{ color: "var(--dark-gray)" }}>
            Contact Us
          </h1>
          <p className="text-lg" style={{ color: "var(--stone-gray)" }}>
            Questions about a statue, a custom order or visiting the shop? We're happy to help.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard Icon={MapPin} bg="bg-blue-100" fg="text-blue-600" title="Visit our shop">
              {SHOP.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <a
                href={SHOP.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 pt-1 font-medium hover:underline"
                style={{ color: "var(--saffron)" }}
              >
                <Navigation size={14} /> Get directions
              </a>
            </InfoCard>

            <InfoCard Icon={Clock} bg="bg-yellow-100" fg="text-yellow-600" title="Opening hours">
              <p>{SHOP.hours}</p>
            </InfoCard>

            {SHOP.phone && (
              <InfoCard Icon={Phone} bg="bg-green-100" fg="text-green-600" title="Call us">
                <a href={SHOP.phoneHref} className="hover:underline">
                  {SHOP.phone}
                </a>
              </InfoCard>
            )}

            {SHOP.whatsapp && (
              <InfoCard Icon={MessageCircle} bg="bg-emerald-100" fg="text-emerald-600" title="WhatsApp">
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:underline">
                  +{SHOP.whatsapp}
                </a>
                <p>Send us photos or questions.</p>
              </InfoCard>
            )}

            {SHOP.email && (
              <InfoCard Icon={Mail} bg="bg-purple-100" fg="text-purple-600" title="Email">
                <a href={`mailto:${SHOP.email}`} className="hover:underline break-all">
                  {SHOP.email}
                </a>
              </InfoCard>
            )}
          </div>

          {/* Message form */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="card-body">
                <h2 className="text-2xl font-display font-bold mb-1" style={{ color: "var(--dark-gray)" }}>
                  Send us a message
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--stone-gray)" }}>
                  {SHOP.whatsapp
                    ? "Your message opens in WhatsApp, ready to send."
                    : SHOP.email
                    ? "Your message opens in your email app, ready to send."
                    : "Please call or visit us — online messages aren't set up yet."}
                </p>

                {sent && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>
                      Your message is ready in {SHOP.whatsapp ? "WhatsApp" : "your email app"} — press send there. If nothing
                      opened, check that pop-ups are allowed{SHOP.phone ? ` or call us on ${SHOP.phone}` : ""}.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium mb-1" style={{ color: "var(--dark-gray)" }}>
                        Your name *
                      </label>
                      <input
                        id="contact-name"
                        autoComplete="name"
                        value={form.name}
                        onChange={set("name")}
                        className={`input-field w-full ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-reply" className="block text-sm font-medium mb-1" style={{ color: "var(--dark-gray)" }}>
                        Phone or email *
                      </label>
                      <input
                        id="contact-reply"
                        value={form.contact}
                        onChange={set("contact")}
                        placeholder="So we can reply"
                        className={`input-field w-full ${errors.contact ? "border-red-500" : ""}`}
                      />
                      {errors.contact && <p className="text-red-600 text-xs mt-1">{errors.contact}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-topic" className="block text-sm font-medium mb-1" style={{ color: "var(--dark-gray)" }}>
                      Topic
                    </label>
                    <select id="contact-topic" value={form.topic} onChange={set("topic")} className="input-field w-full">
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium mb-1" style={{ color: "var(--dark-gray)" }}>
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={set("message")}
                      placeholder={
                        form.topic === "Custom order"
                          ? "Which deity or design, roughly what size or weight, and when you need it"
                          : "How can we help?"
                      }
                      className={`input-field w-full resize-none ${errors.message ? "border-red-500" : ""}`}
                    />
                    {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={!canSend} className="btn btn-primary w-full disabled:opacity-50">
                    <Send size={18} className="mr-2" />
                    {SHOP.whatsapp ? "Send on WhatsApp" : "Send by email"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-6 text-center" style={{ color: "var(--dark-gray)" }}>
            Common questions
          </h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="card group">
                <summary className="card-body cursor-pointer font-semibold list-none flex justify-between gap-4" style={{ color: "var(--dark-gray)" }}>
                  {q}
                  <span className="transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 -mt-2 text-sm leading-relaxed" style={{ color: "var(--stone-gray)" }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
          <p className="text-center text-sm mt-8" style={{ color: "var(--stone-gray)" }}>
            Want to know more about us? Read <Link to="/about" className="underline">our story</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
