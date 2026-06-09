import { useGetDashboardSummary, useGetActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Megaphone, CheckCircle2, FileEdit, TrendingUp, MousePointerClick, BarChart3, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useCurrency } from "@/components/currency-context";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activities, isLoading: isLoadingActivities } = useGetActivity({ limit: 5 });
  const { formatCurrency, currency } = useCurrency();

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening with your campaigns.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
            <Wallet className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary?.creditBalance ?? 0)}</div>
            <p className="text-xs opacity-80 mt-1">Total deposited: {formatCurrency(summary?.totalDeposited ?? 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Megaphone className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.activeCampaigns || 0}</div>
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-500" /> {summary?.completedCampaigns || 0} completed
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileEdit className="w-3 h-3 text-gray-500" /> {summary?.draftCampaigns || 0} drafts
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Impressions</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.totalImpressions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" /> {summary?.totalClicks?.toLocaleString() || 0} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.totalConversions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>CTR: {summary?.averageCtr?.toFixed(2) || "0.00"}%</span>
              <span>CPC: {formatCurrency(summary?.averageCpc ?? 0)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions on your account</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activities?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-6">
                {activities?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(item.createdAt), "MMM d, h:mm a")}</p>
                    </div>
                      {item.amount && (
                        <div className="ml-auto font-medium text-sm">
                          {item.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border bg-muted/20">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Steps to launch your first ad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <div>
                <p className="font-medium">Deposit Funds</p>
                <p className="text-sm text-muted-foreground">Add money to your wallet using Mobile Money.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">2</div>
              <div>
                <p className="font-medium text-muted-foreground">Create Campaign</p>
                <p className="text-sm text-muted-foreground">Set your target, platform, and budget.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">3</div>
              <div>
                <p className="font-medium text-muted-foreground">Launch Ads</p>
                <p className="text-sm text-muted-foreground">Your ads will go live automatically.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}