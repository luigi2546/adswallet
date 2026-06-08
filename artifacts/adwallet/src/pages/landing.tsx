import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { SiFacebook, SiTiktok, SiGoogle, SiYoutube, SiInstagram } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Wallet, BarChart, Zap, Globe2, Shield } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center z-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Run Facebook & TikTok Ads With <span className="text-primary">Mobile Money</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Fund advertising campaigns without international credit cards. The premium ad platform built for African businesses, creators, and entrepreneurs.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto" onClick={() => setLocation("/register")}>
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 h-auto" onClick={() => setLocation("/contact")}>
              Book Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need to grow</h2>
            <p className="text-muted-foreground mt-4">Powerful features wrapped in an elegant interface.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-primary" />}
              title="Mobile Money Funding"
              description="Deposit instantly using MTN, Vodafone, or AirtelTigo. No cards needed."
            />
            <FeatureCard 
              icon={<Wallet className="w-8 h-8 text-primary" />}
              title="Ad Credits Wallet"
              description="Manage your ad spend across multiple platforms from one unified balance."
            />
            <FeatureCard 
              icon={<Globe2 className="w-8 h-8 text-primary" />}
              title="Multi-Platform Ads"
              description="Launch campaigns on Facebook, Instagram, TikTok, and Google."
            />
            <FeatureCard 
              icon={<BarChart className="w-8 h-8 text-primary" />}
              title="Campaign Analytics"
              description="Real-time performance tracking with beautiful, actionable insights."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="AI Ad Generator"
              description="Generate high-converting ad copy and headlines instantly."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Agency Dashboard"
              description="Manage multiple clients and campaigns with role-based access."
            />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12">Supported Platforms</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            <SiFacebook className="w-12 h-12 text-[#1877F2]" />
            <SiInstagram className="w-12 h-12 text-[#E4405F]" />
            <SiTiktok className="w-12 h-12 text-foreground" />
            <SiGoogle className="w-12 h-12 text-[#4285F4]" />
            <SiYoutube className="w-12 h-12 text-[#FF0000]" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background border-border/50 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}