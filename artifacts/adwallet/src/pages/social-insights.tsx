import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQueries } from "@tanstack/react-query";
import {
  getSocialPosts,
  useGetPlatformBreakdown,
  useGetSocialAccounts,
  type PlatformBreakdown,
  type SocialAccount,
  type SocialPost,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Eye,
  Heart,
  Link2,
  MessageCircle,
  MousePointerClick,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiFacebook, SiGoogle, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import { useCurrency } from "@/components/currency-context";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="text-[#1877F2]" />,
  instagram: <SiInstagram className="text-[#E1306C]" />,
  tiktok: <SiTiktok />,
  google: <SiGoogle className="text-[#4285F4]" />,
  youtube: <SiYoutube className="text-[#FF0000]" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#111827",
  google: "#4285F4",
  youtube: "#FF0000",
};

type AccountInsight = {
  account: SocialAccount;
  posts: SocialPost[];
  ad?: PlatformBreakdown;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
  engagementRate: number;
};

function sumPosts(posts: SocialPost[]) {
  const likes = posts.reduce((sum, post) => sum + post.likes, 0);
  const comments = posts.reduce((sum, post) => sum + post.comments, 0);
  const shares = posts.reduce((sum, post) => sum + post.shares, 0);
  const views = posts.reduce((sum, post) => sum + post.reach, 0);
  const engagement = likes + comments + shares;
  const engagementRate = views > 0 ? (engagement / views) * 100 : 0;

  return { likes, comments, shares, views, engagement, engagementRate };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

export default function SocialInsightsPage() {
  const [, setLocation] = useLocation();
  const { formatCurrency } = useCurrency();
  const { data: accounts, isLoading: isAccountsLoading } = useGetSocialAccounts();
  const { data: platformBreakdown, isLoading: isAdsLoading } = useGetPlatformBreakdown();

  const postQueries = useQueries({
    queries: (accounts ?? []).map((account) => ({
      queryKey: ["/api/social-accounts", account.id, "posts"],
      queryFn: () => getSocialPosts(account.id),
      enabled: !!account.id,
      staleTime: 60_000,
    })),
  });

  const insights = useMemo<AccountInsight[]>(() => {
    return (accounts ?? []).map((account, index) => {
      const posts = (postQueries[index]?.data ?? []) as SocialPost[];
      const ad = platformBreakdown?.find((item) => item.platform === account.platform);
      return {
        account,
        posts,
        ad,
        ...sumPosts(posts),
      };
    });
  }, [accounts, platformBreakdown, postQueries]);

  const allPosts = insights.flatMap((item) => item.posts.map((post) => ({ ...post, account: item.account })));
  const latestPosts = [...allPosts]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 8);

  const totals = insights.reduce(
    (acc, item) => ({
      followers: acc.followers + item.account.followers,
      views: acc.views + item.views,
      likes: acc.likes + item.likes,
      engagement: acc.engagement + item.engagement,
      spend: acc.spend + (item.ad?.spend ?? 0),
      impressions: acc.impressions + (item.ad?.impressions ?? 0),
      clicks: acc.clicks + (item.ad?.clicks ?? 0),
    }),
    { followers: 0, views: 0, likes: 0, engagement: 0, spend: 0, impressions: 0, clicks: 0 },
  );

  const isPostsLoading = postQueries.some((query) => query.isLoading);
  const hasAccounts = (accounts?.length ?? 0) > 0;

  if (isAccountsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Insights</h1>
          <p className="text-muted-foreground">All account engagement and ad performance in one place.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!hasAccounts) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Insights</h1>
          <p className="text-muted-foreground">All account engagement and ad performance in one place.</p>
        </div>
        <Card>
          <CardContent className="py-14 text-center">
            <Link2 className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect your first social account</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
              Once connected, AdWallet will show followers, post views, likes, shares, comments, and ad performance together.
            </p>
            <Button onClick={() => setLocation("/settings")}>Connect Account</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Insights</h1>
          <p className="text-muted-foreground">Views, likes, engagement, and ad results across your connected accounts.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setLocation("/settings")}>
          <Link2 className="w-4 h-4" />
          Manage Accounts
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Audience</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{formatNumber(totals.followers)}</div>
            <p className="text-xs text-muted-foreground mt-1">{accounts?.length ?? 0} connected account{accounts?.length === 1 ? "" : "s"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Organic Views</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{isPostsLoading ? "..." : formatNumber(totals.views)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(totals.likes)} likes from recent posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Engagement</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold">{isPostsLoading ? "..." : formatNumber(totals.engagement)}</div>
            <p className="text-xs text-muted-foreground mt-1">Likes, comments, and shares</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Ad Spend</span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold">{isAdsLoading ? "..." : formatCurrency(totals.spend)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(totals.clicks)} paid clicks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connected Account Performance</CardTitle>
            <CardDescription>Organic post activity beside paid ad insight by platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((item) => {
              const platformColor = PLATFORM_COLORS[item.account.platform] ?? "hsl(var(--primary))";
              const paidCtr = item.ad?.impressions ? ((item.ad.clicks / item.ad.impressions) * 100) : 0;

              return (
                <div key={item.account.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                        {PLATFORM_ICONS[item.account.platform]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{item.account.accountName}</h3>
                          <Badge variant="outline" className="capitalize text-xs">{item.account.platform}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{item.account.accountHandle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatNumber(item.account.followers)}</p>
                      <p className="text-xs text-muted-foreground">followers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Metric label="Views" value={formatNumber(item.views)} icon={<Eye className="w-3.5 h-3.5" />} />
                    <Metric label="Likes" value={formatNumber(item.likes)} icon={<Heart className="w-3.5 h-3.5" />} />
                    <Metric label="Eng. Rate" value={`${item.engagementRate.toFixed(1)}%`} icon={<TrendingUp className="w-3.5 h-3.5" />} />
                    <Metric label="Ad Spend" value={formatCurrency(item.ad?.spend ?? 0)} icon={<BarChart3 className="w-3.5 h-3.5" />} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-muted/40 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Paid Impressions</p>
                      <p className="font-semibold">{formatNumber(item.ad?.impressions ?? 0)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Paid Clicks</p>
                      <p className="font-semibold">{formatNumber(item.ad?.clicks ?? 0)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Paid CTR</p>
                      <p className="font-semibold">{paidCtr.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, item.engagementRate * 8)}%`,
                        backgroundColor: platformColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Latest posts with views, likes, comments, and shares.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPostsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}
              </div>
            ) : latestPosts.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No posts available yet.</div>
            ) : (
              <div className="space-y-3">
                {latestPosts.map((post) => (
                  <div key={`${post.account.id}-${post.id}`} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {PLATFORM_ICONS[post.platform]}
                      </div>
                      <span className="text-xs font-medium truncate">{post.account.accountName}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 mb-3">{post.content ?? "(No caption)"}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <PostMetric icon={<Eye className="w-3.5 h-3.5" />} value={post.reach} />
                      <PostMetric icon={<Heart className="w-3.5 h-3.5" />} value={post.likes} />
                      <PostMetric icon={<MessageCircle className="w-3.5 h-3.5" />} value={post.comments} />
                      <PostMetric icon={<Share2 className="w-3.5 h-3.5" />} value={post.shares} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ads Insight Summary</CardTitle>
          <CardDescription>Paid campaign performance pulled into the same view as your social accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Metric label="Paid Impressions" value={formatNumber(totals.impressions)} icon={<Eye className="w-4 h-4" />} large />
            <Metric label="Paid Clicks" value={formatNumber(totals.clicks)} icon={<MousePointerClick className="w-4 h-4" />} large />
            <Metric
              label="Average Paid CTR"
              value={`${totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0.00"}%`}
              icon={<TrendingUp className="w-4 h-4" />}
              large
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, icon, large = false }: { label: string; value: string; icon: React.ReactNode; large?: boolean }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className={large ? "text-2xl font-bold" : "text-lg font-semibold"}>{value}</div>
    </div>
  );
}

function PostMetric({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      {icon}
      <span className="truncate">{formatNumber(value)}</span>
    </div>
  );
}
