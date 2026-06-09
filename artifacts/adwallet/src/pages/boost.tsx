import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetSocialAccounts,
  useGetSocialPosts,
  useCreateCampaign,
  getGetCampaignsQueryKey,
  getGetSocialPostsQueryKey,
  SocialAccount,
  SocialPost,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, MessageCircle, Share2, Eye, Zap, Link2 } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/currency-context";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="w-5 h-5 text-[#1877F2]" />,
  instagram: <SiInstagram className="w-5 h-5 text-[#E1306C]" />,
  tiktok: <SiTiktok className="w-5 h-5" />,
  google: <SiGoogle className="w-5 h-5 text-[#4285F4]" />,
  youtube: <SiYoutube className="w-5 h-5 text-[#FF0000]" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#000",
  google: "#4285F4",
  youtube: "#FF0000",
};

const STEPS = ["Account", "Select Post", "Budget", "Review"];

export default function BoostPage() {
  const [step, setStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [dailyBudget, setDailyBudget] = useState("20");
  const [totalBudget, setTotalBudget] = useState("100");
  const [objective, setObjective] = useState<"awareness" | "traffic" | "engagement">("awareness");

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currency, formatCurrency } = useCurrency();

  const { data: accounts, isLoading: isLoadingAccounts } = useGetSocialAccounts();
  const { data: posts, isLoading: isLoadingPosts } = useGetSocialPosts(
    selectedAccount?.id ?? 0,
    { query: { enabled: !!selectedAccount, queryKey: getGetSocialPostsQueryKey(selectedAccount?.id ?? 0) } }
  );
  const createMutation = useCreateCampaign();

  const canProceed = () => {
    if (step === 0) return !!selectedAccount;
    if (step === 1) return !!selectedPost;
    if (step === 2) return !!dailyBudget && !!totalBudget;
    return true;
  };

  const handleCreate = () => {
    if (!selectedPost || !selectedAccount) return;
    createMutation.mutate({
      data: {
        name: `Boost: ${selectedPost.content?.slice(0, 40) ?? "Post"}...`,
        platform: selectedAccount.platform as any,
        objective: objective as any,
        dailyBudget: Number(dailyBudget),
        totalBudget: Number(totalBudget),
        headline: selectedPost.content?.slice(0, 90) ?? null,
        description: selectedPost.content ?? null,
        targetLocation: null,
        targetAge: "18-45",
        targetGender: "all",
      }
    }, {
      onSuccess: (campaign) => {
        toast({ title: "Boost campaign created", description: `"${campaign.name}" saved as draft. Launch it to go live.` });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
        setLocation("/campaigns");
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const duration = (totalBudget && dailyBudget)
    ? Math.ceil(Number(totalBudget) / Number(dailyBudget))
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2" onClick={() => setLocation("/campaigns")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Boost Content</h1>
            <p className="text-muted-foreground">Promote your existing posts as paid ads.</p>
          </div>
        </div>
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

      {/* Step 0: Choose connected account */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Connected Account</CardTitle>
            <CardDescription>Select the social media account where your content lives.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAccounts ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : !accounts || accounts.length === 0 ? (
              <div className="text-center py-10">
                <Link2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium mb-1">No accounts connected yet</p>
                <p className="text-sm text-muted-foreground mb-4">Connect a social account in Settings to boost your content.</p>
                <Button variant="outline" onClick={() => setLocation("/settings")}>Go to Settings</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    data-testid={`button-select-account-${account.id}`}
                    onClick={() => setSelectedAccount(account)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                      ${selectedAccount?.id === account.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-xl">
                      {PLATFORM_ICONS[account.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{account.accountName}</p>
                      <p className="text-sm text-muted-foreground">@{account.accountHandle} · {account.followers.toLocaleString()} followers</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="capitalize text-xs"
                      style={{ borderColor: PLATFORM_COLORS[account.platform] + "40", color: PLATFORM_COLORS[account.platform] }}
                    >
                      {account.platform}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select post */}
      {step === 1 && selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Post to Boost</CardTitle>
            <CardDescription>Pick a post from {selectedAccount.accountName} to promote as an ad.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {posts?.map((post) => (
                  <button
                    key={post.id}
                    data-testid={`button-select-post-${post.id}`}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedPost?.id === post.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        {PLATFORM_ICONS[post.platform]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-xs capitalize">{post.postType}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(post.postedAt), "MMM d, yyyy")}</span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.reach.toLocaleString()} reach</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Budget & objective */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Set Your Budget</CardTitle>
            <CardDescription>Choose how much to spend and what you want to achieve.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
              1 {currency} = 1 Ad Credit. Credits are deducted from your wallet when the campaign launches.
            </div>
            <div>
              <Label>Campaign Objective</Label>
              <div className="flex gap-2 mt-1.5">
                {(["awareness", "traffic", "engagement"] as const).map(obj => (
                  <button key={obj} onClick={() => setObjective(obj)}
                    className={`flex-1 py-2.5 rounded-md border-2 text-sm font-medium capitalize transition-all
                      ${objective === obj ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {obj}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="daily">Daily Budget ({currency})</Label>
              <Input id="daily" type="number" min="1" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} className="mt-1.5" data-testid="input-boost-daily" />
            </div>
            <div>
              <Label htmlFor="total">Total Budget ({currency})</Label>
              <Input id="total" type="number" min="1" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} className="mt-1.5" data-testid="input-boost-total" />
            </div>
            {duration && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                <span className="font-medium text-foreground">Estimated duration: </span>
                <span className="text-muted-foreground">~{duration} days at {currency} {dailyBudget}/day</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedPost && selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Boost</CardTitle>
            <CardDescription>Confirm the details before creating your campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                {PLATFORM_ICONS[selectedAccount.platform]}
                <span className="font-medium text-sm">{selectedAccount.accountName}</span>
                <Badge variant="outline" className="text-xs capitalize ml-auto">{selectedPost.postType}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{selectedPost.content}</p>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>{selectedPost.likes.toLocaleString()} likes</span>
                <span>{selectedPost.reach.toLocaleString()} organic reach</span>
              </div>
            </div>
            {[
              { label: "Platform", value: selectedAccount.platform },
              { label: "Objective", value: objective },
              { label: "Daily Budget", value: `${currency} ${dailyBudget}` },
              { label: "Total Budget", value: `${currency} ${totalBudget}` },
              { label: "Duration", value: duration ? `~${duration} days` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground capitalize">{value}</span>
              </div>
            ))}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              Campaign will be saved as a draft. Launch it from the campaigns list when ready.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-2" data-testid="button-boost-next">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-2" data-testid="button-boost-create">
            <Zap className="w-4 h-4" />
            {createMutation.isPending ? "Creating..." : "Create Boost Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}
