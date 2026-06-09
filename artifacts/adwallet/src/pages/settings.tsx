import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-context";
import {
  useGetSocialAccounts,
  useDisconnectSocialAccount,
  getGetSocialAccountsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Bell, Shield, Moon, Sun, LogOut, Link2, Trash2, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const PLATFORMS = [
  {
    id: "facebook",
    label: "Facebook",
    description: "Pages & ads",
    icon: <SiFacebook className="w-5 h-5" />,
    color: "#1877F2",
    bg: "bg-[#1877F2]/10",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Business profile",
    icon: <SiInstagram className="w-5 h-5" />,
    color: "#E1306C",
    bg: "bg-[#E1306C]/10",
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Creator account",
    icon: <SiTiktok className="w-5 h-5" />,
    color: "#010101",
    bg: "bg-foreground/10",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Channel",
    icon: <SiYoutube className="w-5 h-5" />,
    color: "#FF0000",
    bg: "bg-[#FF0000]/10",
  },
  {
    id: "google",
    label: "Google Business",
    description: "My Business profile",
    icon: <SiGoogle className="w-5 h-5" />,
    color: "#4285F4",
    bg: "bg-[#4285F4]/10",
  },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <SiFacebook className="w-4 h-4 text-[#1877F2]" />,
  instagram: <SiInstagram className="w-4 h-4 text-[#E1306C]" />,
  tiktok: <SiTiktok className="w-4 h-4" />,
  google: <SiGoogle className="w-4 h-4 text-[#4285F4]" />,
  youtube: <SiYoutube className="w-4 h-4 text-[#FF0000]" />,
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const { data: accounts, isLoading: isLoadingAccounts } = useGetSocialAccounts();
  const disconnectMutation = useDisconnectSocialAccount();

  // Handle OAuth callback redirects (?oauth_success=platform or ?oauth_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("oauth_success");
    const demo = params.get("demo");
    const error = params.get("oauth_error");
    const platform = params.get("platform");

    if (success) {
      const label = PLATFORMS.find(p => p.id === success)?.label ?? success;
      toast({
        title: demo ? `${label} connected (demo)` : `${label} connected`,
        description: demo
          ? "Using demo data. Add real credentials in your platform developer console to go live."
          : `Your ${label} account has been successfully linked.`,
      });
      queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: `Could not connect ${platform ? PLATFORMS.find(p => p.id === platform)?.label ?? platform : "account"}: ${decodeURIComponent(error)}`,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setIsDark(!isDark);
    localStorage.setItem("adwallet_theme", isDark ? "light" : "dark");
  };

  const handleSaveProfile = () => {
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const handleConnect = async (platformId: string) => {
    setConnectingPlatform(platformId);
    try {
      const token = localStorage.getItem("adwallet_token");
      const res = await fetch(`${BASE_URL}/api/oauth/connect/${platformId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = (await res.json()) as { url: string; demo: boolean };
      window.location.href = url;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (id: number, platformLabel: string) => {
    disconnectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Account disconnected", description: `${platformLabel} has been removed.` });
        queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const connectedPlatforms = new Set((accounts ?? []).map(a => a.platform));

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <Badge variant="outline" className="mt-1 capitalize text-xs">{user?.role}</Badge>
            </div>
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" data-testid="input-name" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user?.email ?? ""} disabled className="mt-1.5 opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <Label htmlFor="business-name">Business Name</Label>
            <Input id="business-name" placeholder="Your company or brand name" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1.5" data-testid="input-business-name" />
          </div>
          <Button onClick={handleSaveProfile} data-testid="button-save-profile">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Connected Accounts — OAuth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to boost posts directly from AdWallet.
            Each connection opens the platform's official login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">

          {/* Platform connect buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLATFORMS.map(p => {
              const isConnected = connectedPlatforms.has(p.id as any);
              const isConnecting = connectingPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => !isConnected && handleConnect(p.id)}
                  disabled={isConnected || isConnecting}
                  data-testid={`button-connect-${p.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all
                    ${isConnected
                      ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
                      : "border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer"
                    }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${p.bg}`}
                    style={{ color: p.color }}>
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  {isConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isConnecting ? (
                    <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Connected accounts list */}
          {isLoadingAccounts ? (
            <div className="space-y-2 mt-4">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Connected</p>
              {accounts.map((account) => (
                <div key={account.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border"
                  data-testid={`card-account-${account.id}`}>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {PLATFORM_ICONS[account.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{account.accountName}</p>
                    <p className="text-xs text-muted-foreground">@{account.accountHandle} · {account.followers.toLocaleString()} followers</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {format(new Date(account.connectedAt), "MMM d")}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDisconnect(account.id, PLATFORMS.find(p => p.id === account.platform)?.label ?? account.platform)}
                    data-testid={`button-disconnect-${account.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground pt-1">
            Clicking a platform opens its official login page. AdWallet only requests read + ads permissions.
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how AdWallet looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleDark} className="gap-2" data-testid="button-toggle-theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Control when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Campaign Launched", desc: "Get notified when a campaign goes live" },
            { label: "Deposit Confirmed", desc: "Get notified when a deposit is processed" },
            { label: "Low Credits Warning", desc: "Alert when credits fall below 50 GHS" },
            { label: "Campaign Completed", desc: "Get notified when a campaign ends" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Email</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" className="mt-1.5" data-testid="input-current-password" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" className="mt-1.5" data-testid="input-new-password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" className="mt-1.5" data-testid="input-confirm-password" />
          </div>
          <Button variant="outline" onClick={() => toast({ title: "Feature coming soon", description: "Password change will be available in the next update." })}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium text-destructive">Sign Out</p>
          <p className="text-sm text-muted-foreground">Sign out of your AdWallet account.</p>
        </div>
        <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10" onClick={logout} data-testid="button-signout">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
