import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, Mail, MessageCircle, FileText } from "lucide-react";

const FAQ_SECTIONS = [
  {
    category: "Getting Started",
    items: [
      { q: "How do I create an AdWallet account?", a: "Click 'Start Free' on the homepage or navigate to /register. Enter your name, email, country, and password. Your wallet is automatically created in your local currency based on the country you select." },
      { q: "Which countries are supported?", a: "AdWallet supports all 54 African countries. Your wallet currency is automatically set to your country's local currency (GHS for Ghana, NGN for Nigeria, KES for Kenya, etc.)." },
      { q: "Is AdWallet free to use?", a: "Yes, the Starter plan is free with 1 active campaign and basic features. Growth and Agency plans offer expanded limits and advanced features for a monthly subscription." },
      { q: "Do I need a credit card?", a: "No. You fund your AdWallet using mobile money — M-Pesa, MTN MoMo, Airtel Money and many others. No international credit card is required." },
    ],
  },
  {
    category: "Funding Your Wallet",
    items: [
      { q: "How do I deposit funds?", a: "Go to Wallet → Deposit, enter the amount in your local currency, select your mobile money provider, and follow the prompts on your phone. Deposits typically confirm within 1–3 minutes." },
      { q: "What mobile money providers are supported?", a: "We support M-Pesa (Kenya, Tanzania, Mozambique), MTN MoMo (Ghana, Uganda, Rwanda, Cameroon), Airtel Money, EcoCash (Zimbabwe), OPay (Nigeria), Wave (Senegal, Ivory Coast), Orange Money and many more. Coverage depends on your country." },
      { q: "Is there a minimum deposit?", a: "Minimum deposits vary by country, roughly equivalent to $1 USD. Maximum single deposits are limited based on your KYC verification tier." },
      { q: "Can I withdraw funds?", a: "Unused credits can be returned to your mobile money account after a review period. Contact support to initiate a withdrawal. Processing takes 2–5 business days." },
      { q: "Why is my deposit pending?", a: "Deposits can be delayed by mobile money network congestion or if the confirmation on your phone is not yet approved. If a deposit remains pending for more than 10 minutes, contact your mobile money provider and then our support team." },
    ],
  },
  {
    category: "Campaigns",
    items: [
      { q: "How do I create a campaign?", a: "Go to Campaigns → New Campaign. Select your platform, objective, target audience, budget, and creative content. Review the summary and click Launch. Campaigns are submitted to the platform for review before going live." },
      { q: "How long does campaign approval take?", a: "Platform review times vary: Facebook/Instagram typically 5–30 minutes, Google 1–3 business days, TikTok 1–24 hours. You'll be notified when your campaign is live." },
      { q: "Can I pause or stop a campaign?", a: "Yes. Go to Campaigns, find your campaign, and click Pause or Stop. Pausing a campaign suspends spend without deleting it. Stopping a campaign is permanent — unused budget remains in your wallet." },
      { q: "What happens if my campaign is rejected?", a: "The platform will provide a rejection reason. Edit your campaign content to comply with the platform's advertising policies and resubmit. Any credits already deducted for rejected campaigns are refunded within 5 business days." },
      { q: "What is the Boost Content feature?", a: "Boost Content lets you promote your existing social media posts as paid ads. Connect your account in Settings, go to Boost Content, pick a post, set a budget, and launch. It's faster than creating a campaign from scratch." },
    ],
  },
  {
    category: "Connected Accounts",
    items: [
      { q: "How do I connect my Facebook Page?", a: "Go to Settings → Connected Accounts and click Facebook. You'll be redirected to Facebook's official login where you approve the requested permissions. AdWallet only requests read and ads permissions — we cannot post on your behalf without your action." },
      { q: "Can I connect multiple Instagram accounts?", a: "Currently one account per platform is supported. Multiple account support is on the roadmap for the Agency plan." },
      { q: "How do I disconnect an account?", a: "Go to Settings → Connected Accounts and click the trash icon next to the account you want to remove. You can also revoke access from the platform's own privacy settings." },
      { q: "Is it safe to connect my accounts?", a: "Yes. We use official OAuth 2.0 flows — you authenticate directly with the platform, not with us. We store only the access token, not your password. Tokens can be revoked at any time." },
    ],
  },
  {
    category: "Billing & Subscription",
    items: [
      { q: "How is the subscription fee charged?", a: "Subscription fees are automatically deducted from your wallet balance on your billing anniversary date. If your balance is insufficient, your account is downgraded to the Starter plan." },
      { q: "Can I change my plan?", a: "Yes. Upgrades take effect immediately. Downgrades take effect at the start of the next billing cycle. You will not be refunded for unused portions of a downgraded plan." },
      { q: "Are subscription fees refundable?", a: "Subscription fees are non-refundable except where required by law. If you experience a service outage attributable to AdWallet, we may offer pro-rated credits at our discretion." },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const filtered = search.trim().length > 1
    ? FAQ_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : FAQ_SECTIONS;

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4"
          >
            Help Center
          </motion.h1>
          <p className="text-muted-foreground mb-8">Find answers to common questions about AdWallet.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results for "{search}". Try different keywords or contact support.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map(section => (
                <div key={section.category}>
                  <h2 className="text-lg font-bold mb-4 text-primary">{section.category}</h2>
                  <div className="space-y-2">
                    {section.items.map(item => {
                      const key = `${section.category}:${item.q}`;
                      const open = openItems.has(key);
                      return (
                        <div key={key} className="border border-border rounded-xl overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                            onClick={() => toggle(key)}
                          >
                            <span className="text-sm font-medium">{item.q}</span>
                            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                          </button>
                          {open && (
                            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3 bg-muted/20">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact strip */}
      <section className="py-12 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-center text-sm text-muted-foreground mb-8">Still need help? Reach out to our team.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Mail className="w-5 h-5 text-primary" />, title: "Email Support", desc: "hello@adwallet.africa", sub: "1 business day response" },
              { icon: <MessageCircle className="w-5 h-5 text-primary" />, title: "Live Chat", desc: "Available in the app", sub: "Mon–Fri, 8am–6pm WAT" },
              { icon: <FileText className="w-5 h-5 text-primary" />, title: "Book a Demo", desc: "Talk to our sales team", sub: "30-minute onboarding call" },
            ].map(c => (
              <div key={c.title} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">{c.icon}</div>
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-sm text-primary">{c.desc}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
