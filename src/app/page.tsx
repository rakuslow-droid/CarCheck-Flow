import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, ShieldCheck, Bell, MessageSquare, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Car className="w-6 h-6" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight text-primary">CarCheck Flow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-headline font-medium">Merchant Login</Button>
          </Link>
          <Link href="/register">
            <Button className="font-headline font-bold bg-primary hover:bg-primary/90">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <Badge variant="secondary" className="px-4 py-1 text-sm font-headline bg-accent/10 text-primary border-accent/20">
                Next-Gen Automotive Management
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-tight tracking-tight text-foreground">
                Automated Inspection <br />
                <span className="text-primary italic">Reminders</span> via LINE
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect your shop directly to customers through Japan's favorite messaging app. 
                Use AI to extract vehicle data and never miss an inspection renewal again.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg font-headline font-bold bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Register Your Shop
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-headline font-medium border-2">
                    How it Works
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
              <div className="absolute -inset-1 bg-gradient-to-tr from-accent to-primary rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border">
                <Image 
                  src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&h=800&auto=format&fit=crop"
                  alt="Automotive Shop"
                  width={1200}
                  height={800}
                  className="rounded-xl object-cover"
                  data-ai-hint="auto garage"
                />
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border animate-bounce-subtle">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Extraction Successful</p>
                    <p className="text-xs text-muted-foreground">Exp: 2026-05-12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 border-y">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold">Built for Reliability & Trust</h2>
              <p className="text-lg text-muted-foreground">Our platform combines enterprise-grade automation with the simplicity of a chat message.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <MessageSquare className="w-6 h-6" />,
                  title: "LINE Integration",
                  desc: "Send personalized reminders and receive inspection docs directly from customers via LINE."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "AI Extraction",
                  desc: "Powered by Gemini AI to accurately read vehicle inspection certificates and update dates automatically."
                },
                {
                  icon: <Bell className="w-6 h-6" />,
                  title: "Smart Reminders",
                  desc: "Multi-stage reminder schedules ensure your customers are always informed before their inspection expires."
                }
              ].map((feature, idx) => (
                <Card key={idx} className="border-none shadow-none hover:bg-background/50 transition-colors p-4">
                  <CardContent className="pt-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-headline font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-headline font-bold text-primary">CarCheck Flow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 CarCheck Flow Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
