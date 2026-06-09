import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    subtitle: "For individuals and small businesses getting started.",
    features: [
      { text: "1 active campaign", included: true },
      { text: "Facebook & Instagram", included: true },
      { text: "Mobile money deposits", included: true },
      { text: "Basic analytics", included: true },
      { text: "1 connected social account", included: true },
      { text: "Email support", included: true },
      { text: "TikTok & Google Ads", included: false },
      { text: "Bulk campaign creation", included: false },
      { text: "Agency client management", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    href: "/register",
    popular: false,
    variant: "outline" as const,
  },
  {
    name: "Growth",
    price: "GHS 99",
    period: "/month",
    subtitle: "For growing businesses running multiple campaigns.",
    features: [
      { text: "10 active campaigns", included: true },
      { text: "All 5 platforms", included: true },
      { text: "Mobile money deposits", included: true },
      { text: "Advanced analytics & reports", included: true },
      { text: "5 connected social accounts", included: true },
      { text: "Boost content feature", included: true },
      { text: "TikTok & Google Ads", included: true },
      { text: "Bulk campaign creation", included: false },
      { text: "Agency client management", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Growth",
    href: "/register",
    popular: true,
    variant: "default" as const,
  },
  {
    name: "Agency",
    price: "GHS 349",
    period: "/month",
    subtitle: "For agencies managing campaigns for multiple clients.",
    features: [
      { text: "Unlimited active campaigns", included: true },
      { text: "All 5 platforms", included: true },
      { text: "Mobile money deposits", included: true },
      { text: "White-label reporting", included: true },
      { text: "Unlimited social accounts", included: true },
      { text: "Boost content feature", included: true },
      { text: "TikTok & Google Ads", included: true },
      { text: "Bulk campaign creation", included: true },
      { text: "Agency client management", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
    variant: "outline" as const,
  },
];

const FAQ = [
  { q: "What currencies do you support?", a: "AdWallet supports 30+ African currencies including GHS, NGN, KES, ZAR, UGX, TZS, RWF, ETB, XOF, XAF and many more. Your wallet is denominated in your country's local currency." },
  { q: "Which mobile money providers do you accept?", a: "We support M-Pesa, MTN MoMo, Airtel Money, Vodafone Cash, EcoCash, OPay, Wave, Orange Money and many more. Coverage varies by country." },
  { q: "Are there transaction fees on deposits?", a: "AdWallet does not charge deposit fees. Some mobile money providers may apply their own transfer fees. Check your provider's fee schedule." },
  { q: "Can I change plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at the start of the next billing cycle." },
  { q: "What payment methods are accepted for subscriptions?", a: "Subscription plans are billed via mobile money or ad credits from your wallet balance. We do not require a credit card." },
  { q: "Is there a free trial for paid plans?", a: "Yes, Growth and Agency plans come with a 14-day free trial. No payment required to start." },
];

export default function PricingPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            Transparent Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6"
          >
            Simple plans for every<br />
            <span className="text-primary">stage of growth</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Start for free. Scale when you're ready. All plans include mobile money deposits and multi-platform ad management.
          </motion.p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 flex flex-col
                  ${tier.popular
                    ? "bg-primary/5 border-2 border-primary shadow-xl scale-105"
                    : "bg-card border border-border"}`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${tier.popular ? "text-primary" : "text-muted-foreground"}`}>
                    {tier.name}
                  </p>
                  <h3 className="text-4xl font-extrabold">
                    {tier.price}
                    {tier.period && <span className="text-base font-normal text-muted-foreground">{tier.period}</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">{tier.subtitle}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included
                        ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        : <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href}>
                  <Button variant={tier.variant} className="w-full">{tier.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Prices shown in GHS. Equivalent amounts apply in other currencies at current exchange rates.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Not sure which plan is right?</h2>
          <p className="text-muted-foreground mb-8">Book a free demo and our team will help you find the best fit for your business size and goals.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">Start Free</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">Book a Demo</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
