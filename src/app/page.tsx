export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-cars');
  const inspectionImage = PlaceHolderImages.find(img => img.id === 'inspection-sticker');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight text-primary">CarCheck Flow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors mt-2" href="#features">
            Features
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Merchant Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto text-center lg:text-left">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary animate-pulse">
                  Now with Gemini 1.5 Flash AI
                </div>
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none text-slate-900">
                  Automate Vehicle Inspections via LINE
                </h1>
                <p className="max-w-[600px] text-slate-600 md:text-xl font-medium mx-auto lg:mx-0">
                  Allow customers to register their vehicle inspection (車検) by simply sending a photo. Our AI handles the rest.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="h-12 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                    <Link href="/dashboard">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg font-bold rounded-xl">
                    <Link href="/login">Merchant Portal</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    LINE Official Integration
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/hero/800/600"}
                  alt="Modern Garage"
                  width={800}
                  height={600}
                  className="relative rounded-2xl shadow-2xl border border-white/20 transform transition-transform duration-500 group-hover:scale-[1.02]"
                  data-ai-hint="auto garage"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                The Smartest Way to Manage Inspections
              </h2>
              <p className="max-w-[800px] text-slate-500 md:text-xl mx-auto">
                Modern tools for car shops to increase customer retention and reduce manual paperwork.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <MessageSquare className="h-8 w-8 text-primary" />,
                  title: "LINE Webhook Integration",
                  desc: "Connect directly with customers where they already are. No new apps to download."
                },
                {
                  icon: <Zap className="h-8 w-8 text-primary" />,
                  title: "AI Document OCR",
                  desc: "Powered by Gemini AI to extract inspection expiration dates automatically from photos."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8 text-primary" />,
                  title: "Automated Reminders",
                  desc: "Schedule personalized LINE notifications months before the inspection expires."
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col p-8 rounded-2xl border bg-slate-50 hover:bg-slate-100 transition-colors group">
                  <div className="mb-4 p-3 bg-white rounded-xl shadow-sm w-fit group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Showcase */}
        <section className="w-full py-20 bg-slate-900 text-white overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl">
                  AI-Powered Extraction
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Our advanced AI model identifies "車検証" (Certificates) and "車検ステッカー" (Stickers) with high precision, ensuring your records are always accurate.
                </p>
                <ul className="space-y-4">
                  {[
                    "Extracts expiration dates in YYYY-MM-DD format",
                    "Identifies plate numbers and vehicle models",
                    "Supports handheld photos and low-light images"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-slate-300 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="font-bold">
                  Learn about our AI <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-primary/30 rounded-full blur-[100px] opacity-20"></div>
                <Image
                  src={inspectionImage?.imageUrl || "https://picsum.photos/seed/doc/600/400"}
                  alt="AI Extraction"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-3xl grayscale hover:grayscale-0 transition-all duration-700"
                  data-ai-hint="document inspection"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <Link className="flex items-center gap-2" href="/">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Car className="h-4 w-4" />
              </div>
              <span className="font-headline font-bold text-slate-900 tracking-tight">CarCheck Flow</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-[300px]">
              Modernizing the automotive service industry, one inspection at a time.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-sm text-slate-600 hover:text-primary transition-colors">Merchant Portal</Link></li>
                <li><Link href="/dashboard/analytics" className="text-sm text-slate-600 hover:text-primary transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-slate-600 hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container px-4 md:px-6 mx-auto mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 CarCheck Flow Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary underline-offset-4 hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary underline-offset-4 hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
