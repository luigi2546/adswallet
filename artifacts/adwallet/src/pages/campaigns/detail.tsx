import { useParams, useLocation } from "wouter";
import { useGetCampaign, useLaunchCampaign, usePauseCampaign, getGetCampaignQueryKey, getGetCampaignsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Pause, TrendingUp, MousePointerClick, Eye, CheckCircle2, Users } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/currency-context";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="w-6 h-6 text-[#1877F2]" />,
  instagram: <SiInstagram className="w-6 h-6 text-[#E1306C]" />,
  tiktok: <SiTiktok className="w-6 h-6" />,
  google: <SiGoogle className="w-6 h-6 text-[#4285F4]" />,
  youtube: <SiYoutube className="w-6 h-6 text-[#FF0000]" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

function generateChartData(clicks: number | null | undefined, impressions: number | null | undefined) {
  const days = 14;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const factor = (i + 1) / days;
    return {
      date: format(date, "MMM d"),
      impressions: Math.floor(((impressions ?? 0) / days) * (0.7 + Math.random() * 0.6)),
      clicks: Math.floor(((clicks ?? 0) / days) * (0.7 + Math.random() * 0.6)),
    };
  });
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id ?? "0");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const { data: campaign, isLoading } = useGetCampaign(campaignId, {
    query: { enabled: !!campaignId, queryKey: getGetCampaignQueryKey(campaignId) }
  });

  const launchMutation = useLaunchCampaign();
  const pauseMutation = usePauseCampaign();

  const handleLaunch = () => {
    launchMutation.mutate({ id: campaignId }, {
      onSuccess: () => {
        toast({ title: "Campaign launched", description: "Your campaign is now live." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const handlePause = () => {
    pauseMutation.mutate({ id: campaignId }, {
      onSuccess: () => {
        toast({ title: "Campaign paused", description: "Your campaign has been paused." });
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button variant="ghost" onClick={() => setLocation("/campaigns")} className="mt-4">Back to Campaigns</Button>
      </div>
    );
  }

  const chartData = generateChartData(campaign.clicks, campaign.impressions);
  const ctr = (campaign.impressions && campaign.clicks) ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2" onClick={() => setLocation("/campaigns")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {PLATFORM_ICONS[campaign.platform]}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs border ${STATUS_COLORS[campaign.status]}`} variant="outline">
                  {campaign.status}
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">{campaign.platform} · {campaign.objective}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <Button onClick={handleLaunch} disabled={launchMutation.isPending} className="gap-2" data-testid="button-launch-campaign">
                <Play className="w-4 h-4" />
                {launchMutation.isPending ? "Launching..." : "Launch Campaign"}
              </Button>
            )}
            {campaign.status === "active" && (
              <Button variant="outline" onClick={handlePause} disabled={pauseMutation.isPending} className="gap-2" data-testid="button-pause-campaign">
                <Pause className="w-4 h-4" />
                {pauseMutation.isPending ? "Pausing..." : "Pause Campaign"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Impressions", value: campaign.impressions?.toLocaleString() ?? "—", icon: <Eye className="w-4 h-4" />, color: "text-blue-500" },
          { label: "Clicks", value: campaign.clicks?.toLocaleString() ?? "—", icon: <MousePointerClick className="w-4 h-4" />, color: "text-primary" },
          { label: "CTR", value: `${ctr}%`, icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-500" },
          { label: "Conversions", value: campaign.conversions?.toLocaleString() ?? "—", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-amber-500" },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-1 ${color}`}>{icon} {label}</div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {(campaign.status === "active" || campaign.status === "completed" || campaign.status === "paused") && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Impressions and clicks for the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorImpressions)" />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Platform", value: campaign.platform },
              { label: "Objective", value: campaign.objective },
              { label: "Daily Budget", value: `${formatCurrency(campaign.dailyBudget, { showCode: true })}` },
              { label: "Total Budget", value: `${formatCurrency(campaign.totalBudget, { showCode: true })}` },
              { label: "Credits Used", value: `${campaign.creditsUsed.toFixed(2)} Credits` },
              { label: "Created", value: format(new Date(campaign.createdAt), "MMM d, yyyy") },
              { label: "Launched", value: campaign.launchedAt ? format(new Date(campaign.launchedAt), "MMM d, yyyy") : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground capitalize">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Audience & Creative</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Location", value: campaign.targetLocation || "—" },
              { label: "Age Range", value: campaign.targetAge || "—" },
              { label: "Gender", value: campaign.targetGender || "—" },
              { label: "Headline", value: campaign.headline || "—" },
              { label: "Description", value: campaign.description || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
