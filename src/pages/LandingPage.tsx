import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";
import { ShieldAlert, Building2, HelpingHand, Clock, MapPin } from "lucide-react";

/**
 * Clean, modern, dark/light-tech landing page
 * - Hero: half-photo / half-gradient hybrid
 * - Features: 3 simple cards (no carousel)
 * - How It Helps: 3 columns (for Civic / Org / Volunteers)
 * - Latest updates: reduced to 3 cards, concise
 * - Footer: minimal
 *
 * Replace any placeholder images with your real assets.
 */

export default function LandingPage() {
  // Optional: prefer dark mode initially (keeps your original UX)
  useEffect(() => {
    // If you want to force dark by default, uncomment next line.
    // document.documentElement.classList.add("dark");
  }, []);

  // Minimal sample news data (replace with real data later)
  const news = [
    {
      title: "Magnitude 7.9 Hits Cebu",
      desc: "Relief operations underway. Evacuation centers activated.",
      img: "/assets/news.jpg",
    },
    {
      title: "Heavy Floods in Cagayan",
      desc: "Rising water levels prompt local advisories.",
      img: "/assets/news.jpg",
    },
    {
      title: "Volunteers Mobilize Nationwide",
      desc: "Communities organize donation drives and triage support.",
      img: "/assets/news.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 antialiased">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-extrabold tracking-tight">DisasterConnect</div>
            <span className="hidden sm:inline-block text-sm text-neutral-500 dark:text-neutral-400">
              Tech-powered community response
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#home" className="hover:underline">
              Home
            </a>
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#updates" className="hover:underline">
              Updates
            </a>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-sm px-3 py-2 rounded-md bg-blue-900 text-white hover:bg-blue-950">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="container mx-auto px-4 py-16 md:py-28">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text + CTA */}
          <div className="space-y-6 md:pr-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Technology that moves communities — when minutes matter.
            </h1>

            <p className="text-neutral-600 dark:text-neutral-300 max-w-prose text-base md:text-lg">
              Real-time alerts, coordinated volunteer response, and transparent resource management — built for resilience in the Philippines.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/register">
                <Button className="shadow-lg">Get Started</Button>
              </Link>
              <a href="#features">
                <Button variant="outline">How it works</Button>
              </a>
            </div>

            {/* Trust / quick stats strip */}
            <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/50 px-3 py-2 rounded-lg">
                <Clock size={16} />
                <div>
                  <div className="text-xs text-neutral-500">Avg response</div>
                  <div className="text-sm font-semibold">12 mins</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/50 px-3 py-2 rounded-lg">
                <MapPin size={16} />
                <div>
                  <div className="text-xs text-neutral-500">Covered areas</div>
                  <div className="text-sm font-semibold">12 provinces</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Half-photo / half-gradient hybrid card */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-2 h-64 md:h-80">
                {/* Left: Image */}
                <div className="relative">
                  <img
                    src="/assets/disasterimage1.jpg"
                    alt="Disaster response"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 dark:bg-black/40" />
                </div>

                {/* Right: Gradient panel with highlight */}
                <div className="flex items-center justify-center p-6 bg-gradient-to-tr from-[#0EA5E9]/70 to-[#7C3AED]/60 dark:from-[#0369A1]/60 dark:to-[#4C1D95]/60">
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-wide text-white/90 mb-2">DisasterConnect</div>
                    <h3 className="text-white font-bold text-xl md:text-2xl">Connect • Respond • Recover</h3>
                    <p className="text-white/90 mt-2 text-sm max-w-[16rem] mx-auto">
                      A modern command center in your pocket — shared situational awareness for faster help.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Link to="/register">
                        <button className="py-2 px-4 rounded-md bg-white/95 text-blue-900 font-semibold shadow hover:scale-[1.02] transition-transform">
                          Join Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative subtle ring */}
            <div className="absolute -bottom-6 right-6 w-20 h-20 rounded-full border-2 border-blue-400 opacity-30 blur-sm pointer-events-none" />
          </div>
        </div>
      </section>

      {/* FEATURES (3 simple cards) */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">What we do</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <article className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-tr from-yellow-300 to-yellow-500 text-neutral-900">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Citizens</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Request help, view safe zones, and get timely guidance when disaster strikes.
                </p>
              </div>
            </div>
          </article>

          <article className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-tr from-red-500 to-red-700 text-white">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Organizations</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Manage evacuation centers, coordinate logistics, and publish official updates.
                </p>
              </div>
            </div>
          </article>

          <article className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-700 text-white">
                <HelpingHand size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Volunteers & Donors</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Discover curated opportunities and connect with needs in real time.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* HOW IT HELPS — short 3-step strip */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-6 md:flex md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-900 text-white rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-300">Step 1</div>
              <div className="font-semibold">Alert & Locate</div>
              <div className="text-sm text-neutral-500 mt-1">Get verified alerts and precise location sharing.</div>
            </div>
          </div>

          <div className="flex items-start gap-4 mt-4 md:mt-0">
            <div className="p-3 bg-indigo-600 text-white rounded-lg">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-300">Step 2</div>
              <div className="font-semibold">Coordinate</div>
              <div className="text-sm text-neutral-500 mt-1">Volunteers and organizations coordinate resources quickly.</div>
            </div>
          </div>

          <div className="flex items-start gap-4 mt-4 md:mt-0">
            <div className="p-3 bg-green-500 text-white rounded-lg">
              <HelpingHand size={18} />
            </div>
            <div>
              <div className="text-sm text-neutral-500 dark:text-neutral-300">Step 3</div>
              <div className="font-semibold">Recover</div>
              <div className="text-sm text-neutral-500 mt-1">Track progress and ensure fair distribution of aid.</div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST UPDATES (reduced and concise) */}
      <section id="updates" className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Latest Updates</h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((n, i) => (
            <article
              key={i}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white dark:bg-neutral-800"
            >
              <div className="h-40 w-full">
                <img src={n.img} alt={n.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{n.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{n.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">Get in touch</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">disasterconnectph@gmail.com</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">© DisasterConnect 2025</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Empowering communities through technology</div>
        </div>
      </footer>
    </div>
  );
}
