import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { SiFacebook, SiTiktok, SiGoogle, SiYoutube, SiInstagram } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Wallet, BarChart, Zap, Globe2, Shield, CreditCard, Coins, Layers, Bot, Building2, CheckCircle2, TrendingUp, WalletCards, Quote, Globe, Share2, Mail } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest"
            >
              Fintech for Advertisers
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1]"
            >
              Run Facebook &<br className="hidden md:block" /> TikTok Ads With<br className="hidden md:block" />{" "}
              <span className="text-primary">Mobile Money</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-lg"
            >
              Fund advertising campaigns across all major platforms without international credit cards. Seamless M-Pesa, MTN MoMo, and Airtel Money integration.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="text-lg px-8 py-6 h-auto shadow-lg" onClick={() => setLocation("/register")}>
                Start Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto" onClick={() => setLocation("/contact")}>
                Book Demo
              </Button>
            </motion.div>
          </div>

          {/* Right: Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex justify-center items-center h-[420px] lg:h-[500px]"
          >
            {/* Main Wallet Card (Glassmorphic) */}
            <div className="bg-card/70 backdrop-blur-xl border border-border/30 p-8 rounded-2xl shadow-2xl w-full max-w-sm absolute z-30">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Current Balance</p>
                  <h2 className="text-3xl font-bold text-primary">$4,850.00</h2>
                </div>
                <WalletCards className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Daily Budget Spent</span>
                  <span className="text-sm font-bold">64%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[64%] rounded-full" />
                </div>
              </div>
            </div>

            {/* ROAS Floating Card */}
            <div className="bg-card/70 backdrop-blur-xl border border-border/30 p-4 rounded-xl shadow-xl w-48 absolute -top-4 -right-4 z-40 transform rotate-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">ROAS</p>
              <h3 className="text-xl font-bold text-secondary-foreground">4.2x</h3>
              <p className="text-sm flex items-center gap-1 text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" /> +12%
              </p>
            </div>

            {/* Platform Floating Card */}
            <div className="bg-card/70 backdrop-blur-xl border border-border/30 p-4 rounded-xl shadow-xl w-48 absolute bottom-8 -left-8 z-20 transform -rotate-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Platform</p>
              <div className="flex gap-2 mt-2">
                <SiTiktok className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">TikTok Ads</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-secondary/10 blur-[100px] -z-10" />
      </section>

      {/* Section 2: Trust / Supported Platforms */}
      <section className="py-6 bg-muted/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
            Officially Supported Platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <SiFacebook className="w-10 h-10 text-[#1877F2]" />
            <SiInstagram className="w-10 h-10 text-[#E4405F]" />
            <SiTiktok className="w-10 h-10 text-foreground" />
            <SiGoogle className="w-10 h-10 text-[#4285F4]" />
            <SiYoutube className="w-10 h-10 text-[#FF0000]" />
          </div>
        </div>
      </section>

      {/* Section 3: Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to scale ads across Africa
            </h2>
            <p className="text-muted-foreground text-lg">
              Native fintech solutions designed for the Pan-African digital economy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CreditCard className="w-6 h-6" />}
              title="Mobile Money Funding"
              description="Instantly fund your wallet via M-Pesa, MTN MoMo, Airtel Money, and Orange Money with zero delays."
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6" />}
              title="Ad Credits Wallet"
              description="Convert local currency into universal ad credits. No more 'card declined' errors on Meta or TikTok."
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Multi Platform Ads"
              description="Manage campaigns for Facebook, Instagram, Google, TikTok, and YouTube from a single dashboard."
            />
            <FeatureCard
              icon={<BarChart className="w-6 h-6" />}
              title="Campaign Analytics"
              description="Deep insights into conversion rates, CPC, and ROAS with automated reporting tools."
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              title="AI Ad Generator"
              description="Create high-converting ad copy and creatives in seconds using our integrated AI tools."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6" />}
              title="Agency Dashboard"
              description="Manage multiple client accounts and distribute ad credits with granular permission controls."
            />
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Go live in minutes</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden lg:block" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <HowItWorksStep
                number={1}
                title="Deposit"
                description="Transfer funds from your mobile money wallet to AdWallet."
              />
              <HowItWorksStep
                number={2}
                title="Credits"
                description="Your balance is instantly converted into advertising credits."
              />
              <HowItWorksStep
                number={3}
                title="Create"
                description="Link your ad accounts and set up your campaign settings."
              />
              <HowItWorksStep
                number={4}
                title="Launch"
                description="Hit publish and start reaching millions of customers."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-4">Choose the plan that fits your growth ambitions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <PricingCard
              tier="STARTER"
              price="$0"
              period="/mo"
              subtitle="Perfect for trying us out."
              features={[
                "Up to $500 monthly ad spend",
                "Mobile Money deposits",
                "2 Ad Accounts",
              ]}
              buttonText="Choose Starter"
              variant="outline"
            />
            {/* Business - Most Popular */}
            <PricingCard
              tier="BUSINESS"
              price="$49"
              period="/mo"
              subtitle="For growing small businesses."
              features={[
                "Up to $5,000 ad spend",
                "10 Ad Accounts",
                "Priority Support",
                "AI Ad Assistant",
              ]}
              buttonText="Start Free Trial"
              variant="primary"
              popular
            />
            {/* Agency */}
            <PricingCard
              tier="AGENCY"
              price="$199"
              period="/mo"
              subtitle="Manage multiple clients."
              features={[
                "Unlimited ad spend",
                "50 Ad Accounts",
                "Team Collaboration",
                "API Access",
              ]}
              buttonText="Choose Agency"
              variant="outline"
            />
            {/* Enterprise */}
            <PricingCard
              tier="ENTERPRISE"
              price="Custom"
              period=""
              subtitle="Global brands & massive scale."
              features={[
                "Dedicated Manager",
                "Advanced Fraud Detection",
                "Custom Integrations",
                "SLA Guarantees",
              ]}
              buttonText="Contact Sales"
              variant="outline"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="AdWallet Africa changed the game for our agency. We no longer have to worry about credit card limits when scaling TikTok campaigns for our clients in Kenya."
              name="Sarah J."
              role="Digital Director, Pulse Media"
            />
            <TestimonialCard
              quote="The M-Pesa integration is flawless. I can top up my ad budget while commuting and see the credits reflected in my account by the time I'm at my desk."
              name="David O."
              role="Founder, ShopKwara"
            />
            <TestimonialCard
              quote="Finally, a solution that understands the African payment landscape. Our Facebook ROAS has increased by 30% simply because our ads never pause due to payment issues."
              name="Amara K."
              role="CMO, TechStar Africa"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to grow your business?</h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-10">
                Join over 10,000+ African businesses already using AdWallet to reach their customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => setLocation("/register")}
                >
                  Create Free Account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
            {/* Background blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 bg-card rounded-2xl border border-border hover:shadow-xl transition-all group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function HowItWorksStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-6 ring-8 ring-background">
        {number}
      </div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  subtitle,
  features,
  buttonText,
  variant,
  popular = false,
}: {
  tier: string;
  price: string;
  period: string;
  subtitle: string;
  features: string[];
  buttonText: string;
  variant: "outline" | "primary";
  popular?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-2xl flex flex-col relative ${
        popular
          ? "bg-primary/10 border-2 border-primary scale-105"
          : "bg-card border border-border"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
          Most Popular
        </span>
      )}
      <div className="mb-6">
        <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${popular ? "text-primary" : "text-muted-foreground"}`}>
          {tier}
        </p>
        <h3 className="text-3xl font-bold">
          {price}
          {period && <span className="text-base font-normal text-muted-foreground">{period}</span>}
        </h3>
        <p className="text-sm mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      <ul className="space-y-2 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={variant === "primary" ? "default" : "outline"}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="p-8 bg-card rounded-2xl shadow-sm border border-border/50 relative">
      <Quote className="w-10 h-10 text-primary/20 absolute top-4 right-4" />
      <p className="text-foreground italic mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}
