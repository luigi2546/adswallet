import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl text-primary tracking-tight">
            AdWallet<span className="text-foreground">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className={`text-sm font-medium transition-colors ${location === "/features" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Features
            </Link>
            <Link href="/how-it-works" className={`text-sm font-medium transition-colors ${location === "/how-it-works" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              How it Works
            </Link>
            <Link href="/pricing" className={`text-sm font-medium transition-colors ${location === "/pricing" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Pricing
            </Link>
            <Link href="/success-stories" className={`text-sm font-medium transition-colors ${location === "/success-stories" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Stories
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/login")}>Sign In</Button>
            <Button onClick={() => setLocation("/register")}>Start Free</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold text-primary mb-4 block">AdWallet Africa</span>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Precision Fintech for the Pan-African Market. Empowering businesses to reach global audiences through local payments.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Platform</h5>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/success-stories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><Link href="/kyc" className="text-sm text-muted-foreground hover:text-primary transition-colors">KYC Policy</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Support</h5>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book a Demo</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AdWallet Africa. Precision Fintech for the Pan-African Market.
            </p>
            <p className="text-xs text-muted-foreground">hello@adwallet.africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
