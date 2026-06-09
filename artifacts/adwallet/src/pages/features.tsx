import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Smartphone, Wallet, BarChart3, Zap, Globe2, Shield, CreditCard,
  Layers, Bot, Building2, CheckCircle2, TrendingUp, Repeat2,
  Bell, Lock, Users, Target, Clock, Banknote, Link2, LayoutDashboard,
} from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";

const FEATURES = [
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "Mobile Money Integration",
    description: "Fund your ad wallet using M-Pesa, MTN MoMo, Airtel Money, Vodafone Cash, EcoCash and 20+ other mobile money providers across Africa. No international credit card needed.",
    highlights: ["Zero card requirements", "Instant deposits", "20+ mobile money networks", "Real-time confirmation"],
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <Globe2 className="w-7 h-7" />,
    title: "Multi-Platform Advertising",
    description: "Run and manage campaigns across Facebook, Instagram, TikTok, Google, and YouTube from a single dashboard. Create, monitor, and optimize without switching between platforms.",
    highlights: ["Facebook & Instagram Ads", "TikTok for Business", "Google Display & Search", "YouTube video ads"],
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "Boost Existing Content",
    description: "Connect your social media accounts and promote your best-performing posts as paid ads in minutes. Select a post, set your budget, and launch — no creative work needed.",
    highlights: ["OAuth account linking", "Post performance insights", "One-click boost", "Real-time reach estimates"],
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Real-Time Analytics",
    description: "Track impressions, clicks, conversions, and spend across all your campaigns in a unified dashboard. Get actionable insights to optimize performance and reduce wasted budget.",
    highlights: ["Live campaign metrics", "Cross-platform reporting", "Spend breakdown by platform", "Conversion tracking"],
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: <Banknote className="w-7 h-7" />,
    title: "Local Currency Wallets",
    description: "Wallets are denominated in your local currency — GHS, NGN, KES, ZAR and 30+ more. Deposits, budgets, and billing are all in the currency you use every day.",
    highlights: ["54 African currencies", "Auto currency detection", "Local exchange rates", "Multi-currency support"],
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: <Target className="w-7 h-7" />,
    title: "Smart Campaign Builder",
    description: "Define your objective, audience, budget, and creative in a guided step-by-step flow. AdWallet validates your setup and estimates reach before you spend a single credit.",
    highlights: ["Audience targeting", "Age & gender filters", "Geo targeting", "Reach estimates"],
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Secure & Compliant",
    description: "Bank-grade security with KYC verification, transaction audit trails, and data encryption at rest and in transit. Fully compliant with African financial regulations.",
    highlights: ["KYC verification", "AML compliance", "End-to-end encryption", "Audit trail"],
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  {
    icon: <Link2 className="w-7 h-7" />,
    title: "OAuth Platform Connections",
    description: "Link your Facebook Pages, Instagram Business accounts, TikTok creator accounts, YouTube channels, and Google Business profiles via secure OAuth — no password sharing.",
    highlights: ["Official OAuth 2.0 flows", "Read-only permissions", "Revoke anytime", "Multiple accounts"],
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: <Bell className="w-7 h-7" />,
    title: "Smart Notifications",
    description: "Get alerted when campaigns go live, budgets run low, deposits confirm, or performance spikes. Stay in control without having to constantly check your dashboard.",
    highlights: ["Email alerts", "Low balance warnings", "Campaign milestones", "Deposit confirmations"],
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: <Building2 className="w-7 h-7" />,
    title: "Agency & Team Features",
    description: "Manage multiple client accounts from one AdWallet agency login. Set individual budgets per client, generate reports, and track performance across your entire portfolio.",
    highlights: ["Multi-client management", "Client-level budgets", "Consolidated reporting", "Team access controls"],
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: <Repeat2 className="w-7 h-7" />,
    title: "Automatic Budget Management",
    description: "Set daily and total budgets per campaign. AdWallet automatically pauses campaigns when budgets are exhausted and notifies you to top up — no overspend risk.",
    highlights: ["Daily spend caps", "Total budget limits", "Auto-pause on exhaustion", "Budget refill alerts"],
    color: "text-lime-500",
    bg: "bg-lime-500/10",
  },
  {
    icon: <LayoutDashboard className="w-7 h-7" />,
    title: "Unified Dashboard",
    description: "One home for your wallet balance, active campaigns, spend history, analytics, and connected accounts. Everything you need to run your advertising is in one place.",
    highlights: ["Wallet overview", "Campaign pipeline", "Activity timeline", "Quick actions"],
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
  },
];

const PLATFORMS = [
  { icon: <SiFacebook className="w-8 h-8 text-[#1877F2]" />, name: "Facebook" },
  { icon: <SiInstagram className="w-8 h-8 text-[#E1306C]" />, name: "Instagram" },
  { icon: <SiTiktok className="w-8 h-8" />, name: "TikTok" },
  { icon: <SiGoogle className="w-8 h-8 text-[#4285F4]" />, name: "Google" },
  { icon: <SiYoutube className="w-8 h-8 text-[#FF0000]" />, name: "YouTube" },
];

export default function FeaturesPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            Platform Features
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6"
          >
            Everything you need to<br className="hidden md:block" />{" "}
            <span className="text-primary">advertise across Africa</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            AdWallet brings together mobile money payments, multi-platform ad management, and real-time analytics into one platform built for the African market.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="px-8">Get Started Free</Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="px-8">See How It Works</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Platform logos */}
      <section className="py-10 border-b border-border/40">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Run campaigns across all major platforms
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                {p.icon}
                <span className="text-xs text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{f.description}</p>
                <ul className="space-y-1.5">
                  {f.highlights.map(h => (
                    <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-t border-border/40">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to start advertising?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of African businesses running smarter ad campaigns with AdWallet.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">Create Free Account</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">Talk to Sales</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
