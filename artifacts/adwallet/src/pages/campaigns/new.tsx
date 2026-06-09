import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateCampaign, getGetCampaignsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Megaphone } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/currency-context";

const PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: <SiFacebook className="w-7 h-7 text-[#1877F2]" />, color: "#1877F2" },
  { id: "instagram", label: "Instagram", icon: <SiInstagram className="w-7 h-7 text-[#E1306C]" />, color: "#E1306C" },
  { id: "tiktok", label: "TikTok", icon: <SiTiktok className="w-7 h-7" />, color: "#000" },
  { id: "google", label: "Google", icon: <SiGoogle className="w-7 h-7 text-[#4285F4]" />, color: "#4285F4" },
  { id: "youtube", label: "YouTube", icon: <SiYoutube className="w-7 h-7 text-[#FF0000]" />, color: "#FF0000" },
];

const OBJECTIVES = [
  { id: "awareness", label: "Awareness", description: "Reach people who may be interested in your business" },
  { id: "engagement", label: "Engagement", description: "Get more people to see and engage with your post" },
  { id: "traffic", label: "Traffic", description: "Send people to your website or app" },
  { id: "leads", label: "Leads", description: "Collect leads for your business" },
  { id: "sales", label: "Sales", description: "Find people likely to buy your product" },
];

const STEPS = ["Platform", "Objective", "Audience", "Budget", "Creative", "Review"];

interface FormData {
  platform: string;
  objective: string;
  targetLocation: string;
  targetAge: string;
  targetGender: string;
  dailyBudget: string;
  totalBudget: string;
  name: string;
  headline: string;
  description: string;
}

export default function NewCampaignPage() {
  const [step, setStep] = useState(0);
  const { currency, currencySymbol, formatCurrency } = useCurrency();
  const [form, setForm] = useState<FormData>({
    platform: "",
    objective: "",
    targetLocation: "",
    targetAge: "18-45",
    targetGender: "all",
    dailyBudget: "",
    totalBudget: "",
    name: "",
    headline: "",
    description: "",
  });

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createMutation = useCreateCampaign();

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 0) return !!form.platform;
    if (step === 1) return !!form.objective;
    if (step === 2) return !!form.targetLocation;
    if (step === 3) return !!form.dailyBudget && !!form.totalBudget;
    if (step === 4) return !!form.name && !!form.headline;
    return true;
  };

  const handleSubmit = () => {
    createMutation.mutate({
      data: {
        name: form.name,
        platform: form.platform as any,
        objective: form.objective as any,
        dailyBudget: Number(form.dailyBudget),
        totalBudget: Number(form.totalBudget),
        headline: form.headline || null,
        description: form.description || null,
        targetLocation: form.targetLocation || null,
        targetAge: form.targetAge || null,
        targetGender: form.targetGender || null,
      }
    }, {
      onSuccess: (campaign) => {
        toast({ title: "Campaign created", description: `"${campaign.name}" saved as draft.` });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
        setLocation("/campaigns");
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const selectedPlatform = PLATFORMS.find(p => p.id === form.platform);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2" onClick={() => setLocation("/campaigns")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">Set up your ad campaign in a few steps.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors
              ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-1.5 text-xs hidden sm:inline ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`w-6 sm:w-10 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "Choose the platform where you want to run your ads."}
            {step === 1 && "What do you want to achieve with this campaign?"}
            {step === 2 && "Define who should see your ads."}
            {step === 3 && "Set your spending limits."}
            {step === 4 && "Create your ad creative."}
            {step === 5 && "Review your campaign before saving."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Platform */}
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  data-testid={`button-platform-${platform.id}`}
                  onClick={() => update("platform", platform.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${form.platform === platform.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  {platform.icon}
                  <span className="text-sm font-medium">{platform.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="space-y-2">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  data-testid={`button-objective-${obj.id}`}
                  onClick={() => update("objective", obj.id)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                    ${form.objective === obj.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${form.objective === obj.id ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {form.objective === obj.id && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{obj.label}</p>
                    <p className="text-sm text-muted-foreground">{obj.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Ghana, Nigeria, Kenya" value={form.targetLocation} onChange={e => update("targetLocation", e.target.value)} data-testid="input-location" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="age">Age Range</Label>
                <Input id="age" placeholder="e.g. 18-35" value={form.targetAge} onChange={e => update("targetAge", e.target.value)} data-testid="input-age" className="mt-1.5" />
              </div>
              <div>
                <Label>Gender</Label>
                <div className="flex gap-2 mt-1.5">
                  {["all", "male", "female"].map(g => (
                    <button key={g} data-testid={`button-gender-${g}`} onClick={() => update("targetGender", g)}
                      className={`flex-1 py-2 rounded-md border-2 text-sm font-medium capitalize transition-all
                        ${form.targetGender === g ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                Credits are deducted from your wallet when the campaign launches. 1 {currency} = 1 Ad Credit.
              </div>
              <div>
                <Label htmlFor="daily-budget">Daily Budget ({currency})</Label>
                <Input id="daily-budget" type="number" min="1" placeholder="25" value={form.dailyBudget} onChange={e => update("dailyBudget", e.target.value)} data-testid="input-daily-budget" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="total-budget">Total Budget ({currency})</Label>
                <Input id="total-budget" type="number" min="1" placeholder="175" value={form.totalBudget} onChange={e => update("totalBudget", e.target.value)} data-testid="input-total-budget" className="mt-1.5" />
              </div>
              {form.dailyBudget && form.totalBudget && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  <span className="text-foreground font-medium">Estimated duration: </span>
                  <span className="text-muted-foreground">
                    ~{Math.ceil(Number(form.totalBudget) / Number(form.dailyBudget))} days at {currency} {form.dailyBudget}/day
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Creative */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input id="campaign-name" placeholder="e.g. Summer Sale 2025" value={form.name} onChange={e => update("name", e.target.value)} data-testid="input-campaign-name" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="headline">Ad Headline</Label>
                <Input id="headline" placeholder="e.g. Shop the latest African designs" value={form.headline} onChange={e => update("headline", e.target.value)} data-testid="input-headline" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{form.headline.length}/90 characters</p>
              </div>
              <div>
                <Label htmlFor="ad-description">Ad Description</Label>
                <Textarea id="ad-description" placeholder="Describe your ad..." value={form.description} onChange={e => update("description", e.target.value)} data-testid="input-description" className="mt-1.5" rows={4} />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-3">
              {[
                { label: "Platform", value: selectedPlatform?.label },
                { label: "Objective", value: form.objective },
                { label: "Location", value: form.targetLocation },
                { label: "Age Range", value: form.targetAge },
                { label: "Gender", value: form.targetGender },
                { label: "Daily Budget", value: `${currency} ${form.dailyBudget}` },
                { label: "Total Budget", value: `${currency} ${form.totalBudget}` },
                { label: "Campaign Name", value: form.name },
                { label: "Headline", value: form.headline },
                { label: "Description", value: form.description || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground capitalize">{value}</span>
                </div>
              ))}
              <div className="pt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                Campaign will be saved as a draft. Launch it from the campaigns list when ready.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-2" data-testid="button-next-step">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="gap-2" data-testid="button-submit-campaign">
            {createMutation.isPending ? "Creating..." : (
              <>
                <Megaphone className="w-4 h-4" />
                Save Campaign
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
