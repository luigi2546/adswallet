import { useState } from "react";
import { Link } from "wouter";
import { useGetCampaigns, useDeleteCampaign, useLaunchCampaign, usePauseCampaign, getGetCampaignsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Megaphone, Play, Pause, Trash2, ExternalLink, Zap } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="text-[#1877F2]" />,
  instagram: <SiInstagram className="text-[#E1306C]" />,
  tiktok: <SiTiktok className="text-foreground" />,
  google: <SiGoogle className="text-[#4285F4]" />,
  youtube: <SiYoutube className="text-[#FF0000]" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
  const { data: campaigns, isLoading } = useGetCampaigns(params, {
    query: { queryKey: getGetCampaignsQueryKey(params) }
  });

  const launchMutation = useLaunchCampaign();
  const pauseMutation = usePauseCampaign();
  const deleteMutation = useDeleteCampaign();

  const handleLaunch = (id: number, name: string) => {
    launchMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Campaign launched", description: `"${name}" is now live.` });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const handlePause = (id: number, name: string) => {
    pauseMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Campaign paused", description: `"${name}" has been paused.` });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const handleDelete = (id: number, name: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Campaign deleted", description: `"${name}" has been removed.` });
        queryClient.invalidateQueries({ queryKey: getGetCampaignsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage and track your ad campaigns.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/boost">
            <Button variant="outline" className="gap-2" data-testid="button-boost-content">
              <Zap className="w-4 h-4" />
              Boost Content
            </Button>
          </Link>
          <Link href="/campaigns/new">
            <Button className="gap-2" data-testid="button-new-campaign">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${campaigns?.length ?? 0} campaign${campaigns?.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : campaigns?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6">Create your first campaign to start running ads.</p>
            <Link href="/campaigns/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="hover:border-primary/40 transition-colors" data-testid={`card-campaign-${campaign.id}`}>
              <CardContent className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{PLATFORM_ICONS[campaign.platform]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <Badge className={`text-xs border ${STATUS_COLORS[campaign.status]}`} variant="outline">
                        {campaign.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{campaign.platform} · {campaign.objective}</span>
                    </div>
                    <div className="flex gap-6 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span>Budget: <span className="text-foreground font-medium">GHS {campaign.totalBudget.toFixed(2)}</span></span>
                      {campaign.impressions != null && (
                        <span>Impressions: <span className="text-foreground font-medium">{campaign.impressions.toLocaleString()}</span></span>
                      )}
                      {campaign.clicks != null && (
                        <span>Clicks: <span className="text-foreground font-medium">{campaign.clicks.toLocaleString()}</span></span>
                      )}
                      {campaign.launchedAt && (
                        <span>Launched: <span className="text-foreground font-medium">{format(new Date(campaign.launchedAt), "MMM d, yyyy")}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {campaign.status === "draft" && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleLaunch(campaign.id, campaign.name)} data-testid={`button-launch-${campaign.id}`}>
                        <Play className="w-3.5 h-3.5" />
                        Launch
                      </Button>
                    )}
                    {campaign.status === "active" && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePause(campaign.id, campaign.name)} data-testid={`button-pause-${campaign.id}`}>
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </Button>
                    )}
                    <Link href={`/campaigns/${campaign.id}`}>
                      <Button size="sm" variant="ghost" data-testid={`button-view-${campaign.id}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(campaign.id, campaign.name)} data-testid={`button-delete-${campaign.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
