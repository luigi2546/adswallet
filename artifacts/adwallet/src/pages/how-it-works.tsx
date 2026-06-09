import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Wallet, Megaphone, BarChart3, ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";

const STEPS = [
  {
    number: "01",
    icon: <UserPlus className="w-8 h-8" />,
    title: "Create Your Account",
    description: "Sign up in under 2 minutes. Select your country and your wallet is automatically configured in your local currency — GHS, NGN, KES, ZAR and 30+ more.",
    details: [
      "Choose your country from 54 African nations",
      "Wallet currency auto-set to your local currency",
      "Optional business name for agency accounts",
      "Email verification to secure your account",
    ],
    note: "No credit card required. Free to start.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    number: "02",
    icon: <Wallet className="w-8 h-8" />,
    title: "Fund Your Wallet",
    description: "Top up your AdWallet using the mobile money service available in your country. M-Pesa, MTN MoMo, Airtel Money, EcoCash and many more. Deposits reflect instantly.",
    details: [
      "M-Pesa (Kenya, Tanzania, Mozambique)",
      "MTN MoMo (Ghana, Uganda, Rwanda, Cameroon)",
      "Airtel Money (10+ countries)",
      "EcoCash (Zimbabwe) & OPay (Nigeria)",
    ],
    note: "Minimum deposit: local equivalent of $1 USD.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    number: "03",
    icon: <Megaphone className="w-8 h-8" />,
    title: "Launch Your Campaign",
    description: "Create a new campaign from scratch using our guided builder, or boost an existing social media post in a few clicks. Set your audience, budget, and objective — we handle the rest.",
    details: [
      "Guided campaign builder with platform selection",
      "Boost existing posts from connected accounts",
      "Target by location, age, gender & interest",
      "Set daily and total budget limits",
    ],
    note: "Campaigns launch within minutes of approval.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    number: "04",
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Monitor & Optimize",
    description: "Track real-time performance across all your campaigns in one unified dashboard. See impressions, clicks, spend, and conversions by platform and make data-driven decisions.",
    details: [
      "Real-time impressions and click tracking",
      "Spend analysis by platform and campaign",
      "Performance trend charts",
      "Pause, resume or adjust campaigns anytime",
    ],
    note: "Data refreshes every 15 minutes from platform APIs.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const MOBILE_MONEY = [
  { name: "M-Pesa", countries: "Kenya · Tanzania · Mozambique · DRC", color: "#00A650" },
  { name: "MTN MoMo", countries: "Ghana · Uganda · Rwanda · Cameroon · Ivory Coast", color: "#FFC60B" },
  { name: "Airtel Money", countries: "Nigeria · Uganda · Tanzania · Zambia · Madagascar", color: "#E40613" },
  { name: "EcoCash", countries: "Zimbabwe", color: "#E87722" },
  { name: "OPay", countries: "Nigeria · Egypt", color: "#00AC4F" },
  { name: "Wave", countries: "Senegal · Ivory Coast · Mali · Burkina Faso", color: "#0891B2" },
  { name: "Orange Money", countries: "Senegal · Ivory Coast · Mali · Cameroon", color: "#FF6600" },
  { name: "Vodacom M-Pesa", countries: "South Africa · Tanzania", color: "#E60000" },
];

export default function HowItWorksPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            How It Works
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6"
          >
            From mobile money to<br />
            <span className="text-primary">live ads in minutes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            AdWallet removes every barrier between your mobile money and global advertising platforms. Here's exactly how it works.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-24">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-black text-primary/20 leading-none">{step.number}</span>
                    <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{step.description}</p>
                  <ul className="space-y-2 mb-4">
                    {step.details.map(d => (
                      <li key={d} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">{step.note}</p>
                </div>

                {/* Visual card */}
                <div className={`${i % 2 === 1 ? "lg:col-start-1" : ""} flex justify-center`}>
                  <div className="w-full max-w-sm p-6 bg-card border border-border rounded-2xl shadow-lg">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center ${step.color} mb-6 mx-auto`}>
                      {step.icon}
                    </div>
                    <div className="space-y-3">
                      {step.details.map(d => (
                        <div key={d} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <span className="text-sm">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Money Coverage */}
      <section className="py-20 bg-muted/30 border-t border-b border-border/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <Smartphone className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Mobile Money Coverage</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We support the most widely-used mobile money providers across sub-Saharan Africa. More networks are added regularly.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOBILE_MONEY.map(mm => (
              <div key={mm.name} className="p-4 bg-card border border-border rounded-xl">
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: mm.color }} />
                <p className="font-semibold text-sm mb-1">{mm.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{mm.countries}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-3">Supported Ad Platforms</h2>
          <p className="text-muted-foreground mb-10">Your mobile money funds campaigns on the world's biggest advertising networks.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: <SiFacebook className="w-10 h-10 text-[#1877F2]" />, name: "Facebook Ads", desc: "Pages, Reels & Feed" },
              { icon: <SiInstagram className="w-10 h-10 text-[#E1306C]" />, name: "Instagram Ads", desc: "Stories, Reels & Feed" },
              { icon: <SiTiktok className="w-10 h-10" />, name: "TikTok Ads", desc: "For You Page & TopView" },
              { icon: <SiGoogle className="w-10 h-10 text-[#4285F4]" />, name: "Google Ads", desc: "Search & Display" },
              { icon: <SiYoutube className="w-10 h-10 text-[#FF0000]" />, name: "YouTube Ads", desc: "Pre-roll & Discovery" },
            ].map(p => (
              <div key={p.name} className="flex flex-col items-center gap-2 p-5 w-32 bg-card border border-border rounded-2xl">
                {p.icon}
                <span className="text-xs font-semibold">{p.name}</span>
                <span className="text-[10px] text-muted-foreground text-center">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-t border-border/40">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Start your first campaign today</h2>
          <p className="text-muted-foreground mb-8">Sign up free, fund your wallet with mobile money, and launch in under 10 minutes.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-8">View All Features</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
