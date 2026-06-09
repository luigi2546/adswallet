import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Target, ArrowRight } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle } from "react-icons/si";

const STORIES = [
  {
    company: "Mensah Digital Agency",
    location: "Accra, Ghana",
    industry: "Marketing Agency",
    platform: "facebook",
    platformIcon: <SiFacebook className="w-4 h-4 text-[#1877F2]" />,
    metric1: { label: "Ad Spend Managed", value: "GHS 180K" },
    metric2: { label: "Client Campaigns", value: "47" },
    metric3: { label: "Avg. ROAS", value: "4.2x" },
    quote: "Before AdWallet, we were turning away clients who couldn't fund campaigns because they lacked international cards. Now we've grown our client base by 60% in 8 months.",
    person: "Kwame Mensah",
    role: "Founder, Mensah Digital Agency",
    story: "Mensah Digital runs social media campaigns for SMBs across Greater Accra. The agency struggled to onboard clients who relied solely on mobile money. After switching to AdWallet, they could accept MTN MoMo deposits on behalf of clients and launch Facebook campaigns the same day. The unified dashboard lets Kwame manage all client accounts without switching between ad managers.",
    currency: "GHS",
  },
  {
    company: "Amara Fashion",
    location: "Lagos, Nigeria",
    industry: "Fashion Retail",
    platform: "instagram",
    platformIcon: <SiInstagram className="w-4 h-4 text-[#E1306C]" />,
    metric1: { label: "Monthly Revenue Increase", value: "₦2.3M" },
    metric2: { label: "Instagram Reach", value: "340K" },
    metric3: { label: "Campaign ROI", value: "3.8x" },
    quote: "We used to spend hours trying to set up Facebook Ads with a card that kept getting declined for international transactions. AdWallet changed everything — we deposit with OPay and the money is in our wallet in minutes.",
    person: "Amara Okafor",
    role: "CEO, Amara Fashion",
    story: "Amara Fashion sells women's clothing online and through two Lagos boutiques. The brand had an engaged Instagram following of 85K but couldn't convert that into consistent paid advertising due to payment barriers. Using AdWallet's Boost Content feature, the team now promotes their top-performing posts weekly, driving 340K monthly reach and directly attributing ₦2.3M in additional monthly revenue to their Instagram ads.",
    currency: "NGN",
  },
  {
    company: "Safari Tech Solutions",
    location: "Nairobi, Kenya",
    industry: "B2B Software",
    platform: "google",
    platformIcon: <SiGoogle className="w-4 h-4 text-[#4285F4]" />,
    metric1: { label: "Monthly Leads", value: "280+" },
    metric2: { label: "Cost per Lead", value: "KSh 420" },
    metric3: { label: "Pipeline Growth", value: "220%" },
    quote: "Google Ads were always out of reach for us because of the billing complexity. AdWallet made it as simple as sending M-Pesa. Our pipeline has grown 220% in 6 months.",
    person: "James Kariuki",
    role: "Head of Growth, Safari Tech Solutions",
    story: "Safari Tech builds SaaS tools for logistics companies across East Africa. They knew Google Search Ads were the right channel to reach procurement managers, but the credit card billing and complex account setup were constant blockers. With AdWallet, the marketing team funds their campaigns via M-Pesa weekly and tracks all spend from the analytics dashboard without logging into Google Ads Manager.",
    currency: "KES",
  },
  {
    company: "GhanaEats",
    location: "Kumasi, Ghana",
    industry: "Food Delivery",
    platform: "tiktok",
    platformIcon: <SiTiktok className="w-4 h-4" />,
    metric1: { label: "App Downloads", value: "14,200" },
    metric2: { label: "TikTok Views", value: "2.1M" },
    metric3: { label: "Cost per Download", value: "GHS 3.20" },
    quote: "TikTok is where our customers are, but we couldn't run proper ads. AdWallet connected our MTN MoMo to TikTok for Business in 10 minutes. We hit 2 million views in our first campaign.",
    person: "Abena Asante",
    role: "Marketing Lead, GhanaEats",
    story: "GhanaEats delivers local dishes across Kumasi and Accra. The brand had built a strong organic TikTok presence with funny food preparation videos, but their first attempt at paid TikTok promotion failed due to billing issues. After connecting their MTN MoMo wallet through AdWallet, they launched their first boosted campaign in under 15 minutes. The app downloads campaign reached 2.1 million views and generated 14,200 installs at GHS 3.20 per download.",
    currency: "GHS",
  },
  {
    company: "Lumière Beauté",
    location: "Abidjan, Ivory Coast",
    industry: "Beauty & Cosmetics",
    platform: "instagram",
    platformIcon: <SiInstagram className="w-4 h-4 text-[#E1306C]" />,
    metric1: { label: "Revenue Growth", value: "185%" },
    metric2: { label: "New Customers", value: "3,800" },
    metric3: { label: "Avg. Order Value", value: "XOF 24K" },
    quote: "Pour nous en Côte d'Ivoire, les cartes bancaires pour la publicité internationale étaient un vrai obstacle. AdWallet avec Orange Money a tout simplifié.",
    person: "Fatoumata Coulibaly",
    role: "Founder, Lumière Beauté",
    story: "Lumière Beauté sells skincare and cosmetics products online to French-speaking West Africa. The founder, Fatoumata, had built a strong Instagram following but was locked out of advertising because international card payments were inaccessible to most Ivorian SMBs. AdWallet's support for Orange Money (XOF) gave her first access to Instagram Ads. Within three months, she acquired 3,800 new customers and grew revenue 185%.",
    currency: "XOF",
  },
];

const STATS = [
  { value: "12,000+", label: "Businesses Served" },
  { value: "GHS 45M+", label: "Ad Credits Managed" },
  { value: "54", label: "African Countries" },
  { value: "4.1x", label: "Average ROAS" },
];

export default function SuccessStoriesPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            Customer Stories
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6"
          >
            Businesses growing with<br />
            <span className="text-primary">AdWallet Africa</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            From Accra to Nairobi to Abidjan — real businesses using mobile money to run real ads.
          </motion.p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map(s => (
              <div key={s.label} className="py-8 text-center px-4">
                <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl space-y-16">
          {STORIES.map((story, i) => (
            <motion.div
              key={story.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              {/* Card */}
              <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-bold text-lg">{story.company}</p>
                    <p className="text-sm text-muted-foreground">{story.location} · {story.industry}</p>
                  </div>
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    {story.platformIcon}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[story.metric1, story.metric2, story.metric3].map(m => (
                    <div key={m.label} className="p-3 bg-primary/5 rounded-xl text-center">
                      <p className="text-base font-extrabold text-primary">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>
                <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3 leading-relaxed mb-4">
                  "{story.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {story.person.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{story.person}</p>
                    <p className="text-xs text-muted-foreground">{story.role}</p>
                  </div>
                </div>
              </div>

              {/* Story text */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{story.company}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{story.story}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">{story.industry}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">{story.location}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">{story.currency} wallet</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-t border-border/40">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Your story starts here</h2>
          <p className="text-muted-foreground mb-8">Join thousands of African businesses running smarter campaigns with mobile money.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
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
