import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ThemeToggle } from '../components/ThemeToggle'
import { ShieldAlert, Building2, HelpingHand } from 'lucide-react'

export default function LandingPage() {
  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Hero carousel images
  const images = [
    '/src/assets/disasterimage1.jpg',
    '/src/assets/disasterimage2.jpg',
    '/src/assets/disasterimage3.jpeg',
    '/src/assets/disasterimage4.jpg'
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  // Features carousel state
  const features = [
    {
      icon: <ShieldAlert size={24} />,
      title: 'Citizens',
      description: 'Request Help & Find Safe Zones with real-time updates and directions.',
      img: '/src/assets/citizen.jpg',
    },
    {
      icon: <Building2 size={24} />,
      title: 'Organizations',
      description: 'Manage Evacuation Centers, capacity, supplies, and announcements.',
      img: '/src/assets/organization.jpg',
    },
    {
      icon: <HelpingHand size={24} />,
      title: 'Volunteers & Donors',
      description: 'Offer Support Where It Matters through curated needs and requests.',
      img: '/src/assets/volunteer.jpg',
    },
  ]
  const [activeFeature, setActiveFeature] = useState(0)
  const prevFeature = (activeFeature - 1 + features.length) % features.length
  const nextFeature = (activeFeature + 1) % features.length

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="text-lg font-semibold">DisasterConnect</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#home" className="hover:underline">Home</a>
            <a href="#contact" className="hover:underline">Contact</a>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
            <ThemeToggle />
          </nav>
          <div className="md:hidden"><ThemeToggle /></div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Connecting Help When It’s Needed Most.
            </h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-base md:text-lg">
              A cloud-powered disaster coordination platform for citizens, organizations, volunteers, and donors in the Philippines.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button>Get Started</Button></Link>
              <a href="#features"><Button variant="outline">Learn More</Button></a>
            </div>
          </div>

          {/* Hero Carousel */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
            <div
              className="flex w-full h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Disaster ${idx + 1}`}
                  className="w-full flex-shrink-0 h-full object-cover"
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
            >
              &#10094;
            </button>
            <button
              onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
            >
              &#10095;
            </button>
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Key Features</h2>
        <div className="relative w-full max-w-4xl mx-auto h-96 perspective-1000">
          {features.map((feat, idx) => {
            let position = "";
            if (idx === activeFeature) position = "active";
            else if (idx === nextFeature) position = "next";
            else if (idx === prevFeature) position = "prev";

            // Gradient backgrounds per card
            let bgGradient = "";
            let textColor = "text-white";
            if (idx === 0) {
              bgGradient = "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-900";
              textColor = "text-neutral-900";
            } else if (idx === 1) {
              bgGradient = "bg-gradient-to-r from-red-500 via-red-600 to-red-900";
              textColor = "text-white";
            } else if (idx === 2) {
              bgGradient = "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-900";
              textColor = "text-white";
            }

            return (
              <div
                key={idx}
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-full rounded-xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out
                  ${bgGradient} 
                  ${position === "active" ? "scale-100 opacity-100 blur-0 z-20 pointer-events-auto" : "pointer-events-none"}
                  ${position === "next" ? "translate-x-[20%] scale-90 opacity-70 blur-[3.5px] z-10" : ""}
                  ${position === "prev" ? "-translate-x-[100%] scale-90 opacity-70 blur-[3.5px] z-10" : ""}
                  ${position === "" ? "opacity-0 scale-75 blur-[4px] z-0" : ""}`}
              >
                <div className="flex h-full">
                  {/* Left side: Text */}
                  <div className="flex flex-col justify-center text-left w-1/2 px-6">
                    <div className={`flex justify-start mb-4 text-4xl ${textColor}`}>{feat.icon}</div>
                    <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>{feat.title}</h3>
                    <p className={`${textColor}`}>{feat.description}</p>
                  </div>

                  {/* Right side: Image */}
                  <div className="w-1/2 h-full">
                    <img
                      src={feat.img}
                      alt={feat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Controls */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 pointer-events-none">
            <button
              onClick={() => setActiveFeature(prevFeature)}
              className="pointer-events-auto bg-black/30 text-white p-3 rounded-xl hover:bg-black/50"
            >
              &#10094;
            </button>
            <button
              onClick={() => setActiveFeature(nextFeature)}
              className="pointer-events-auto bg-black/30 text-white p-3 rounded-xl hover:bg-black/50"
            >
              &#10095;
            </button>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section id="news" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Latest News</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 w-full">
              <img
                src="/src/assets/news.jpg"
                alt="Cebu Earthquake"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Magnitude 7.9 Hits Cebu</h3>
              <p className="text-sm text-neutral-600">Residents report damages, relief operations underway.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 w-full">
              <img
                src="/src/assets/news.jpg"
                alt="Flood Alert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Heavy Floods in Cagayan</h3>
              <p className="text-sm text-neutral-600">Local authorities advise evacuation as water levels rise.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 w-full">
              <img
                src="/src/assets/news.jpg"
                alt="Volunteers Help"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Volunteers Distribute Aid</h3>
              <p className="text-sm text-neutral-600">Communities receive supplies and medical assistance.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 w-full">
              <img
                src="/src/assets/news.jpg"
                alt="Donation Drive"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-semibold text-lg mb-2 text-black">Donation Drive in Manila</h3>
              <p className="text-sm text-neutral-600">Thousands contribute to disaster relief efforts.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Contact */}
      <section id="contact" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">Get in Touch</h2>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-slate-600 dark:text-slate-300">disasterconnectph@gmail.com</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          © DisasterConnect 2025
        </div>
      </footer>
    </div>
  )
}
