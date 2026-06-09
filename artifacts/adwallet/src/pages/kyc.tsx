import { motion } from "framer-motion";
import { Shield, FileText, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const TIERS = [
  {
    level: "Tier 1 — Basic",
    limit: "Up to $500 USD equivalent per month",
    requirements: ["Full name", "Email address", "Country of residence", "Mobile number"],
    note: "Completed automatically during registration.",
  },
  {
    level: "Tier 2 — Standard",
    limit: "Up to $5,000 USD equivalent per month",
    requirements: ["National ID, Passport, or Driver's License (photo)", "Selfie with ID document", "Business registration number (if applicable)"],
    note: "Verification typically completed within 24 hours.",
  },
  {
    level: "Tier 3 — Enhanced",
    limit: "Above $5,000 USD equivalent per month",
    requirements: ["Proof of address (utility bill or bank statement, dated within 3 months)", "Business registration certificate", "Beneficial owner declaration", "Source of funds declaration"],
    note: "Verification takes 2–5 business days. Assigned a dedicated account manager.",
  },
];

export default function KYCPage() {
  return (
    <div className="w-full">
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tighter"
            >
              KYC Policy
            </motion.h1>
          </div>
          <p className="text-muted-foreground">Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: 1 June 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            AdWallet Africa operates as a financial services platform and is required to comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations in each country where we operate. This policy explains what we require, why, and how verification works.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          {/* Why KYC */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Why We Require KYC
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>AdWallet facilitates the movement of funds via mobile money networks and international advertising platforms. As a regulated financial services intermediary, we are legally required to verify the identity of our users to prevent:</p>
              <ul className="space-y-2 ml-4">
                {["Money laundering and terrorist financing", "Fraud and identity theft", "Unauthorized use of mobile money accounts", "Violation of international sanctions"].map(i => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {i}
                  </li>
                ))}
              </ul>
              <p>Our KYC procedures comply with the Financial Intelligence Centre Act (Ghana), the Central Bank of Nigeria's AML directives, the Central Bank of Kenya's AML regulations, and equivalent frameworks in all countries we operate in.</p>
            </div>
          </motion.div>

          {/* Verification tiers */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Verification Tiers
            </h2>
            <div className="space-y-4">
              {TIERS.map((tier, i) => (
                <div key={i} className="p-6 border border-border rounded-xl bg-card">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold">{tier.level}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full shrink-0">{tier.limit}</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Required Documents</p>
                  <ul className="space-y-1.5 mb-3">
                    {tier.requirements.map(r => (
                      <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">{tier.note}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data handling */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">How We Handle KYC Data</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>All KYC documents are encrypted in transit and at rest. Documents are reviewed by our compliance team and deleted from our active systems within 30 days of verification completion. A cryptographic hash is retained for compliance audit purposes as required by law.</p>
              <p>We use a licensed third-party KYC verification provider that is certified under ISO 27001 and compliant with applicable data protection regulations. Your documents are not used for any purpose other than identity verification.</p>
              <p>KYC records are retained for 7 years from the date of your last transaction, as required by AML regulations in our operating countries.</p>
            </div>
          </motion.div>

          {/* Refusals */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Account Restrictions
            </h2>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm text-muted-foreground leading-relaxed">
              <p>AdWallet reserves the right to restrict, suspend, or terminate accounts that fail to complete required KYC verification, provide false or misleading documents, or trigger transaction patterns inconsistent with stated business purposes. In such cases, unused wallet credits will be returned to the original mobile money account minus applicable fees, subject to AML hold periods.</p>
            </div>
          </motion.div>

          <div className="p-6 bg-muted/30 rounded-xl border border-border">
            <p className="text-sm font-semibold mb-1">Compliance Questions</p>
            <p className="text-sm text-muted-foreground">compliance@adwallet.africa &nbsp;·&nbsp; AdWallet Africa, Accra, Ghana</p>
          </div>
        </div>
      </section>
    </div>
  );
}
