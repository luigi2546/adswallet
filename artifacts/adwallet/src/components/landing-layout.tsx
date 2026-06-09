import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Globe, Share2, Mail } from "lucide-react";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl text-primary tracking-tight">
            AdWallet<span className="text-foreground">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
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
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Integration</h5>
              <ul className="space-y-2">
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">M-Pesa Integration</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">MTN MoMo</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Airtel Money</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">KYC Policy</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Resources</h5>
              <ul className="space-y-2">
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">API Docs</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Success Stories</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AdWallet Africa. Precision Fintech for the Pan-African Market.
            </p>
            <div className="flex gap-4">
              <Globe className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
              <Share2 className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
              <Mail className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}