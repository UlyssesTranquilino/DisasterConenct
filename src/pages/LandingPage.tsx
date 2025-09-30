import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ThemeToggle } from '../components/ThemeToggle'
import { ShieldAlert, Building2, HelpingHand } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Connecting Help When It’s Needed Most.</h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-base md:text-lg">
              A cloud-powered disaster coordination platform for citizens, organizations, volunteers, and donors in the Philippines.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button className="">Get Started</Button></Link>
              <a href="#features"><Button variant="outline">Learn More</Button></a>
            </div>
          </div>
          <div className="aspect-video w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center text-neutral-500 dark:text-neutral-400 shadow-md">
            Visual Placeholder
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Key Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert size={18} /> Citizens</CardTitle>
            </CardHeader>
            <CardContent>
              Request Help & Find Safe Zones with real-time updates and directions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 size={18} /> Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              Manage Evacuation Centers, capacity, supplies, and announcements.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpingHand size={18} /> Volunteers & Donors</CardTitle>
            </CardHeader>
            <CardContent>
              Offer Support Where It Matters through curated needs and requests.
            </CardContent>
          </Card>
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


