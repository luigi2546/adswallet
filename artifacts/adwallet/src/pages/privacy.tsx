import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: [
      "**Account Information:** When you register, we collect your name, email address, business name, and country of residence.",
      "**Financial Information:** We collect transaction records including deposit amounts, dates, and mobile money references. We do not store your mobile money PIN or full phone number beyond what is necessary for transaction confirmation.",
      "**Campaign Data:** We store campaign settings, budgets, targeting parameters, performance metrics, and creative content you provide.",
      "**OAuth Tokens:** When you connect social media accounts, we store OAuth access tokens provided by the platforms. We request the minimum permissions needed to read your posts and create ads.",
      "**Usage Data:** We collect logs of actions taken within the platform (campaign creation, logins, deposits) to power analytics, detect fraud, and improve the service.",
      "**Device Information:** Browser type, IP address, and device identifiers for security and fraud prevention purposes.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "**Service Delivery:** To operate your AdWallet account, process deposits, create campaigns on ad platforms, and display analytics.",
      "**KYC Compliance:** To verify your identity as required by applicable financial regulations in your country of operation.",
      "**Communications:** To send transaction confirmations, campaign status updates, and service announcements. Marketing emails require opt-in consent.",
      "**Fraud Prevention:** To detect and prevent unauthorized access, suspicious transactions, and platform abuse.",
      "**Product Improvement:** Aggregated and anonymized usage data is used to improve features, fix bugs, and optimize the platform.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "**Ad Platforms:** Campaign data is shared with Meta (Facebook/Instagram), TikTok, Google, and YouTube as required to create and run your campaigns.",
      "**Mobile Money Providers:** Transaction identifiers are shared with your mobile money provider to process deposits.",
      "**Service Providers:** We use trusted third-party services for hosting, email delivery, and analytics. All processors are bound by data processing agreements.",
      "**Legal Obligations:** We may disclose information when required by law, court order, or to protect the rights and safety of AdWallet and its users.",
      "**We do not sell your personal data** to advertisers, data brokers, or any third parties for their own commercial purposes.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "Account data is retained for the duration of your account plus 7 years thereafter to comply with financial record-keeping obligations.",
      "Campaign and analytics data is retained for 3 years to support trend analysis and dispute resolution.",
      "OAuth tokens are deleted immediately when you disconnect a social media account.",
      "You may request deletion of your account and personal data at any time, subject to our legal retention obligations.",
    ],
  },
  {
    title: "Security",
    content: [
      "All data is encrypted in transit using TLS 1.2 or higher and encrypted at rest using AES-256.",
      "Access to production systems is restricted to authorized personnel and protected by multi-factor authentication.",
      "We conduct regular security audits and penetration testing.",
      "In the event of a data breach affecting your personal information, we will notify you within 72 hours as required by applicable data protection laws.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "**Access:** Request a copy of all personal data we hold about you.",
      "**Correction:** Request correction of inaccurate or incomplete data.",
      "**Deletion:** Request deletion of your data, subject to our legal retention requirements.",
      "**Portability:** Request your data in a machine-readable format.",
      "**Objection:** Object to certain types of processing, including marketing communications.",
      "To exercise any of these rights, contact us at privacy@adwallet.africa.",
    ],
  },
  {
    title: "Cookies",
    content: [
      "We use essential cookies for authentication and session management. These cannot be disabled without breaking core functionality.",
      "We use analytics cookies (opt-in) to understand how users navigate the platform.",
      "We do not use third-party advertising cookies or tracking pixels on our own site.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We will notify registered users by email at least 30 days before any material changes to this Privacy Policy take effect.",
      "Continued use of AdWallet after the effective date constitutes acceptance of the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full">
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-muted-foreground">Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: 1 June 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            AdWallet Africa ("AdWallet", "we", "us", "our") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">{section.title}</h2>
                <ul className="space-y-3">
                  {section.content.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground leading-relaxed">
                      {item.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={k} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-border">
            <p className="text-sm font-semibold mb-1">Contact our Privacy Team</p>
            <p className="text-sm text-muted-foreground">privacy@adwallet.africa &nbsp;·&nbsp; AdWallet Africa, Accra, Ghana</p>
          </div>
        </div>
      </section>
    </div>
  );
}
