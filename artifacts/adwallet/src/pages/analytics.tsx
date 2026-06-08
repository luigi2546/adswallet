import { useState } from "react";
import { useGetDashboardSummary, useGetPerformanceMetrics, useGetPlatformBreakdown, getGetPerformanceMetricsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, MousePointerClick, Eye, CheckCircle2, DollarSign } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";

const RANGE_OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#69C9D0",
  google: "#4285F4",
  youtube: "#FF0000",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="text-[#1877F2]" />,
  instagram: <SiInstagram className="text-[#E1306C]" />,
  tiktok: <SiTiktok />,
  google: <SiGoogle className="text-[#4285F4]" />,
  youtube: <SiYoutube className="text-[#FF0000]" />,
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: performance, isLoading: isPerfLoading } = useGetPerformanceMetrics(
    { range },
    { query: { queryKey: getGetPerformanceMetricsQueryKey({ range }) } }
  );
  const { data: breakdown, isLoading: isBreakdownLoading } = useGetPlatformBreakdown();

  const kpiCards = [
    { label: "Total Spend", value: `GHS ${summary?.totalSpent?.toFixed(2) ?? "0.00"}`, icon: <DollarSign className="w-4 h-4" />, color: "text-primary" },
    { label: "Total Impressions", value: (summary?.totalImpressions ?? 0).toLocaleString(), icon: <Eye className="w-4 h-4" />, color: "text-blue-500" },
    { label: "Total Clicks", value: (summary?.totalClicks ?? 0).toLocaleString(), icon: <MousePointerClick className="w-4 h-4" />, color: "text-emerald-500" },
    { label: "Conversions", value: (summary?.totalConversions ?? 0).toLocaleString(), icon: <CheckCircle2 className="w-4 h-4" />, color: "text-amber-500" },
    { label: "Average CTR", value: `${summary?.averageCtr?.toFixed(2) ?? "0.00"}%`, icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-500" },
    { label: "Avg. CPC", value: `GHS ${summary?.averageCpc?.toFixed(2) ?? "0.00"}`, icon: <DollarSign className="w-4 h-4" />, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your campaign performance and ad spend.</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {RANGE_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              size="sm"
              variant={range === opt.value ? "default" : "ghost"}
              className="text-xs"
              onClick={() => setRange(opt.value as any)}
              data-testid={`button-range-${opt.value}`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isSummaryLoading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : kpiCards.map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className={`flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 ${color}`}>{icon} {label}</div>
              <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Spend, impressions, and clicks for the last {range}</CardDescription>
        </CardHeader>
        <CardContent>
          {isPerfLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                    interval={range === "7d" ? 0 : range === "30d" ? 4 : 13} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="spend" name="Spend (GHS)" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorSpend)" />
                  <Area type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#colorClicks2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Platform</CardTitle>
            <CardDescription>Ad credit allocation across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {isBreakdownLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : !breakdown || breakdown.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No platform data yet</div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} dataKey="spend" nameKey="platform" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}>
                      {breakdown.map((entry) => (
                        <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] ?? "#888"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: any) => [`GHS ${Number(value).toFixed(2)}`, "Spend"]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Clicks and campaigns per platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isBreakdownLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : !breakdown || breakdown.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No platform data yet</div>
            ) : (
              <div className="space-y-3">
                {breakdown.map((p) => (
                  <div key={p.platform} className="flex items-center gap-3">
                    <div className="text-lg">{PLATFORM_ICONS[p.platform]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">{p.platform}</span>
                        <span className="text-muted-foreground">{p.campaigns} campaign{p.campaigns !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (p.clicks / Math.max(...breakdown.map(b => b.clicks || 1))) * 100)}%`,
                            backgroundColor: PLATFORM_COLORS[p.platform] ?? "#888"
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                        <span>{p.clicks.toLocaleString()} clicks</span>
                        <span>GHS {p.spend.toFixed(2)} spent</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
