import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By creating an AdWallet account or using any part of our platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use the platform. We may update these Terms at any time; continued use after the effective date of changes constitutes acceptance.",
  },
  {
    title: "2. Eligibility",
    content: "You must be at least 18 years old and legally capable of entering contracts in your jurisdiction. By registering, you represent that you have the authority to bind any business entity on whose behalf you are acting. AdWallet services are available to businesses and individuals in supported African countries only.",
  },
  {
    title: "3. Account Registration",
    content: "You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.",
  },
  {
    title: "4. Wallet and Deposits",
    content: "AdWallet credits are not legal tender, cryptocurrency, or a bank account. Credits are denominated in your local currency equivalent and can only be used to fund advertising campaigns on supported platforms. Deposits via mobile money are final and non-refundable once confirmed. Minimum and maximum deposit limits apply as published on the deposit page. AdWallet is not responsible for mobile money transfer failures caused by your provider.",
  },
  {
    title: "5. Campaign Creation and Ad Policies",
    content: "Campaigns created through AdWallet are subject to the terms and advertising policies of the respective platforms (Meta, Google, TikTok, YouTube). You are solely responsible for ensuring your campaign content complies with all applicable platform policies, local laws, and regulations. AdWallet does not guarantee campaign approval by any platform. Credits are deducted when campaigns are launched; if a campaign is rejected by a platform after launch, we will refund unused credits within 5 business days.",
  },
  {
    title: "6. Social Media Account Connections",
    content: "When you connect a social media account via OAuth, you grant AdWallet the right to access your account data to the extent permitted by your approved permissions. You may revoke access at any time from the Settings page or directly through the platform. AdWallet does not post content to your accounts without your explicit action.",
  },
  {
    title: "7. KYC and AML Compliance",
    content: "To comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations, we may request identity verification documents at any time. Failure to complete KYC verification may result in restricted access to deposits or campaign creation. We cooperate fully with financial regulators and law enforcement agencies in supported countries.",
  },
  {
    title: "8. Fees",
    content: "AdWallet charges platform fees as published on the Pricing page. Subscription fees are billed monthly and are non-refundable except as required by applicable law. We reserve the right to change our fee structure with 30 days' notice to registered users.",
  },
  {
    title: "9. Prohibited Uses",
    content: "You may not use AdWallet to: (a) promote illegal products, services, or activities; (b) violate the advertising policies of any connected platform; (c) engage in money laundering, fraud, or any financial crime; (d) create fake or misleading advertisements; (e) reverse-engineer or attempt to compromise our systems; (f) use automated tools to access the platform in ways not expressly authorized.",
  },
  {
    title: "10. Limitation of Liability",
    content: "To the maximum extent permitted by law, AdWallet and its officers, directors, and employees are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including lost profits, data loss, campaign underperformance, or platform policy changes by third parties. Our total liability to you for any claim shall not exceed the amount of fees paid to us in the 30 days preceding the claim.",
  },
  {
    title: "11. Governing Law",
    content: "These Terms are governed by the laws of the Republic of Ghana. Any disputes shall first be submitted to good-faith mediation. If mediation fails, disputes shall be resolved by binding arbitration in Accra, Ghana, unless you are a consumer entitled to bring claims in your local courts.",
  },
  {
    title: "12. Contact",
    content: "Questions about these Terms should be directed to legal@adwallet.africa. AdWallet Africa, Kokomlemle, Accra, Ghana.",
  },
];

export default function TermsPage() {
  return (
    <div className="w-full">
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4"
          >
            Terms of Service
          </motion.h1>
          <p className="text-muted-foreground">Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: 1 June 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Please read these Terms of Service carefully before using AdWallet Africa. These terms govern your access to and use of our platform, services, and features.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-10">
            {SECTIONS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <h2 className="text-lg font-bold mb-3 pb-2 border-b border-border">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
