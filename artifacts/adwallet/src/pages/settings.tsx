import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import {
  useGetSocialAccounts,
  useConnectSocialAccount,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Bell, Shield, Moon, Sun, LogOut, Link2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiGoogle, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

const PLATFORMS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "google", label: "Google Business" },
  { id: "youtube", label: "YouTube" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  // Connect account modal state
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState("facebook");
  const [connectName, setConnectName] = useState("");
  const [connectHandle, setConnectHandle] = useState("");

  const { data: accounts, isLoading: isLoadingAccounts } = useGetSocialAccounts();
  const connectMutation = useConnectSocialAccount();
  const disconnectMutation = useDisconnectSocialAccount();

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

  const handleConnect = () => {
    if (!connectName || !connectHandle) return;
    connectMutation.mutate({
      data: { platform: connectPlatform as any, accountName: connectName, accountHandle: connectHandle }
    }, {
      onSuccess: (account) => {
        toast({ title: "Account connected", description: `${account.accountName} has been linked.` });
        queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
        setConnectOpen(false);
        setConnectName("");
        setConnectHandle("");
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

  const handleDisconnect = (id: number, name: string) => {
    disconnectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Account disconnected", description: `${name} has been removed.` });
        queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
    });
  };

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

      {/* Connected Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="mt-1">Link your social media accounts to boost existing content.</CardDescription>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setConnectOpen(true)} data-testid="button-connect-account">
            <Plus className="w-4 h-4" />
            Connect
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingAccounts ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <Link2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No accounts connected</p>
              <p className="text-xs text-muted-foreground mt-1">Connect a social account to boost content directly from AdWallet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3 p-3 rounded-lg border border-border" data-testid={`card-account-${account.id}`}>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {PLATFORM_ICONS[account.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{account.accountName}</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">@{account.accountHandle} · {account.followers.toLocaleString()} followers</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize hidden sm:inline-flex"
                      style={{ borderColor: PLATFORM_COLORS[account.platform] + "50", color: PLATFORM_COLORS[account.platform] }}
                    >
                      {account.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {format(new Date(account.connectedAt), "MMM d")}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDisconnect(account.id, account.accountName)}
                      data-testid={`button-disconnect-${account.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Connect Account Dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect a Social Account</DialogTitle>
            <DialogDescription>
              Link your social media profile so you can boost posts directly from AdWallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Platform</Label>
              <Select value={connectPlatform} onValueChange={setConnectPlatform}>
                <SelectTrigger className="mt-1.5" data-testid="select-connect-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        {PLATFORM_ICONS[p.id]}
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="account-name">Page / Channel Name</Label>
              <Input
                id="account-name"
                placeholder="e.g. Mensah Digital Agency"
                value={connectName}
                onChange={e => setConnectName(e.target.value)}
                className="mt-1.5"
                data-testid="input-connect-name"
              />
            </div>
            <div>
              <Label htmlFor="account-handle">Handle / Username</Label>
              <div className="flex mt-1.5">
                <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm">@</span>
                <Input
                  id="account-handle"
                  placeholder="mensahdigital"
                  value={connectHandle}
                  onChange={e => setConnectHandle(e.target.value)}
                  className="rounded-l-none"
                  data-testid="input-connect-handle"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConnect}
              disabled={!connectName || !connectHandle || connectMutation.isPending}
              className="gap-2"
              data-testid="button-confirm-connect"
            >
              <Link2 className="w-4 h-4" />
              {connectMutation.isPending ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
