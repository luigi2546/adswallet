import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";

const OFFICES = [
  { city: "Accra", country: "Ghana", address: "Kokomlemle, Accra, GH-AA", phone: "+233 30 393 xxxx" },
  { city: "Lagos", country: "Nigeria", address: "Victoria Island, Lagos, NG", phone: "+234 1 453 xxxx" },
  { city: "Nairobi", country: "Kenya", address: "Westlands, Nairobi, KE", phone: "+254 20 392 xxxx" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", type: "demo", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    toast({ title: "Message sent", description: "We'll get back to you within 1 business day." });
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-primary/5 to-background border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4"
          >
            Talk to our team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Book a free demo, ask a question, or discuss a custom plan for your agency.
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>We respond within 1 business day.</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-10">
                      <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">Message received</h3>
                      <p className="text-sm text-muted-foreground">A member of our team will be in touch within 1 business day.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input id="name" className="mt-1.5" placeholder="Kofi Mensah" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" type="email" className="mt-1.5" placeholder="kofi@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company / Business</Label>
                          <Input id="company" className="mt-1.5" placeholder="Acme Digital" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" className="mt-1.5" placeholder="+233 24 xxx xxxx" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <Label>Enquiry Type</Label>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {[
                            { id: "demo", label: "Book a Demo" },
                            { id: "sales", label: "Sales Question" },
                            { id: "support", label: "Technical Support" },
                            { id: "partnership", label: "Partnership" },
                          ].map(t => (
                            <button type="button" key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                              className={`px-3 py-1.5 rounded-md border text-sm transition-all
                                ${form.type === t.id ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea id="message" className="mt-1.5 min-h-[120px]" placeholder="Tell us about your business and what you're looking for..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                      </div>
                      <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">hello@adwallet.africa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">Within 1 business day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Our Offices</h3>
                <div className="space-y-3">
                  {OFFICES.map(o => (
                    <Card key={o.city}>
                      <CardContent className="pt-4 pb-4">
                        <p className="font-semibold text-sm">{o.city}, {o.country}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5" />{o.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 shrink-0" />{o.phone}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
