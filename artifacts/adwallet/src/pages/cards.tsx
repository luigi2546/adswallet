import { useState } from "react";
import {
  useListKoraCards,
  useCreateKoraCard,
  useUpdateKoraCardStatus,
  useLinkCardAdAccount,
  useListCardAdAccounts,
  getListKoraCardsQueryKey,
  getGetWalletQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Link2,
  AlertCircle,
  Copy,
  Check,
  Facebook,
  Globe,
  Settings,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function CardsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialog / Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [amountUsd, setAmountUsd] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [purpose, setPurpose] = useState("general");

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [adPlatform, setAdPlatform] = useState("facebook");
  const [adAccountId, setAdAccountId] = useState("");
  const [adAccountName, setAdAccountName] = useState("");

  const [isCreatedRevealOpen, setIsCreatedRevealOpen] = useState(false);
  const [createdCardData, setCreatedCardData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<string>("active");

  // Queries
  const { data: cardsData, isLoading: isCardsLoading } = useListKoraCards();
  const createCardMutation = useCreateKoraCard();
  const updateStatusMutation = useUpdateKoraCardStatus();
  const linkAdAccountMutation = useLinkCardAdAccount();

  // Copy state
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleCreateCard = () => {
    if (!amountUsd || isNaN(Number(amountUsd)) || Number(amountUsd) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }

    createCardMutation.mutate(
      {
        data: {
          amountUsd: Number(amountUsd),
          spendingLimit: spendingLimit ? Number(spendingLimit) : undefined,
          purpose: purpose as any,
        },
      },
      {
        onSuccess: (res) => {
          toast({ title: "Card created", description: "Your virtual card has been issued." });
          setIsCreateOpen(false);
          setCreatedCardData(res);
          setIsCreatedRevealOpen(true);
          setAmountUsd("");
          setSpendingLimit("");
          setPurpose("general");
          queryClient.invalidateQueries({ queryKey: getListKoraCardsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to create card", description: err.message });
        },
      }
    );
  };

  const handleUpdateStatus = (cardId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "frozen" : "active";
    if (nextStatus === "active") {
      toast({ title: "Unfreezing card", description: "Contact support if this card was closed." });
      return; // Freeze and close are supported. Unfreezing is typically handled or Kora API doesn't support unfreeze directly.
    }
    
    updateStatusMutation.mutate(
      {
        id: cardId,
        data: { status: "frozen" },
      },
      {
        onSuccess: () => {
          toast({ title: "Card frozen", description: "The card has been temporarily suspended." });
          queryClient.invalidateQueries({ queryKey: getListKoraCardsQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        },
      }
    );
  };

  const handleCloseCard = (cardId: number) => {
    if (!confirm("Are you sure you want to permanently close this virtual card? Remaining funds will not be returned automatically.")) {
      return;
    }
    updateStatusMutation.mutate(
      {
        id: cardId,
        data: { status: "closed" },
      },
      {
        onSuccess: () => {
          toast({ title: "Card closed", description: "The card has been permanently terminated." });
          queryClient.invalidateQueries({ queryKey: getListKoraCardsQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        },
      }
    );
  };

  const handleLinkAdAccount = () => {
    if (!selectedCardId || !adAccountId || !adAccountName) return;

    linkAdAccountMutation.mutate(
      {
        id: selectedCardId,
        data: {
          adPlatform: adPlatform as any,
          adAccountId,
          adAccountName,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Ad account linked", description: "Your virtual card is now mapped." });
          setIsLinkOpen(false);
          setAdAccountId("");
          setAdAccountName("");
          queryClient.invalidateQueries({ queryKey: getListKoraCardsQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to link ad account", description: err.message });
        },
      }
    );
  };

  const filteredCards = cardsData?.cards?.filter((c) => {
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "frozen") return c.status === "frozen";
    if (activeTab === "closed") return c.status === "closed";
    return true;
  }) ?? [];

  // Helper to format platform tags
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
      case "instagram":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "google":
      case "youtube":
        return <Globe className="w-4 h-4 text-red-500" />;
      case "tiktok":
        return <Globe className="w-4 h-4 text-black dark:text-white" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Cards</h1>
          <p className="text-muted-foreground">Issue USD cards to fund and link your advertising campaigns.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate">
              <Plus className="w-4 h-4 mr-2" />
              Issue Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Virtual USD Card</DialogTitle>
              <DialogDescription>
                Funded directly from your credit wallet balance. Ensure you have sufficient balance before proceeding.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Initial Funding Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="50"
                  min="1"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Minimum deposit is $1.00 USD.</p>
              </div>
              <div className="space-y-2">
                <Label>Spending Limit (USD) (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Purpose</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Spending</SelectItem>
                    <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                    <SelectItem value="instagram_ads">Instagram Ads</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
                    <SelectItem value="youtube_ads">YouTube Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCard} disabled={createCardMutation.isPending}>
                {createCardMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  "Create Card"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="frozen">Frozen</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isCardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-56 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle>No {activeTab} cards</CardTitle>
                <CardDescription>
                  {activeTab === "active"
                    ? "Create your first virtual card to link with your ad platforms."
                    : `You have no virtual cards in ${activeTab} state.`}
                </CardDescription>
              </CardHeader>
              {activeTab === "active" && (
                <CardContent>
                  <Button onClick={() => setIsCreateOpen(true)}>Create Card</Button>
                </CardContent>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <Card key={card.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  {/* Virtual Card Graphical Wrapper */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-teal-900 to-emerald-950 text-white relative h-48 flex flex-col justify-between rounded-t-lg select-none">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CreditCard className="w-24 h-24" />
                    </div>

                    <div className="flex items-start justify-between z-10">
                      <div>
                        <p className="text-xs font-mono tracking-widest text-teal-300 uppercase">VIRTUAL USD CARD</p>
                        <p className="text-xs text-emerald-400 mt-1 font-semibold uppercase">{card.purpose.replace("_", " ")}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-300 border-emerald-500 bg-emerald-950/40">
                        {card.status}
                      </Badge>
                    </div>

                    <div className="text-xl font-mono tracking-wider my-4 z-10">
                      {card.cardNumberMasked}
                    </div>

                    <div className="flex justify-between items-end z-10">
                      <div>
                        <p className="text-[10px] text-teal-300/60 uppercase">Cardholder</p>
                        <p className="text-sm font-mono tracking-wide">{card.cardholderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-teal-300/60 uppercase">Balance</p>
                        <p className="text-lg font-bold">${card.balance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spending Limit:</span>
                        <span className="font-semibold">${card.spendingLimit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Linked Accounts:</span>
                        <span className="font-semibold">{card.linkedAdAccounts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{format(new Date(card.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex flex-wrap gap-2">
                      {card.status === "active" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCardId(card.id);
                              setIsLinkOpen(true);
                            }}
                          >
                            <Link2 className="w-3.5 h-3.5 mr-1" />
                            Link Ad
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(card.id, card.status)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            Freeze
                          </Button>
                        </>
                      )}
                      {card.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCloseCard(card.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Close
                        </Button>
                      )}
                      {card.status === "frozen" && (
                        <p className="text-xs text-muted-foreground flex items-center">
                          <CircleAlert className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                          Temporarily frozen. Contact admin to unfreeze.
                        </p>
                      )}
                      {card.status === "closed" && (
                        <p className="text-xs text-muted-foreground flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                          Card terminated.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Link Ad Account Dialog */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Card to Ad Account</DialogTitle>
            <DialogDescription>
              Associate this virtual card with a specific advertising campaign or account identifier for accurate billing tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Advertising Platform</Label>
              <Select value={adPlatform} onValueChange={setAdPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="instagram">Instagram Ads</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="tiktok">TikTok Ads</SelectItem>
                  <SelectItem value="youtube">YouTube Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ad Account ID</Label>
              <Input
                placeholder="act_1234567890"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ad Account Name</Label>
              <Input
                placeholder="E.g. Summer Campaign Account"
                value={adAccountName}
                onChange={(e) => setAdAccountName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkAdAccount} disabled={linkAdAccountMutation.isPending}>
              {linkAdAccountMutation.isPending ? "Linking..." : "Link Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal Card Info Dialog (Only shown once upon creation) */}
      <Dialog open={isCreatedRevealOpen} onOpenChange={setIsCreatedRevealOpen}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-500" />
              Card Details Issued Successfully
            </DialogTitle>
            <DialogDescription className="text-red-500 font-semibold">
              Warning: Copy these details now. They will not be visible again for security reasons.
            </DialogDescription>
          </DialogHeader>

          {createdCardData && (
            <div className="p-6 rounded-xl bg-slate-950 text-white font-mono space-y-6 relative border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-400">BRAND</p>
                  <p className="text-sm font-semibold">KORA VISA USD</p>
                </div>
                <Badge className="bg-emerald-500 text-white">ACTIVE</Badge>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 mb-1">CARD NUMBER</p>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-lg tracking-wider">{createdCardData.cardNumberMasked}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => handleCopy(createdCardData.cardNumberMasked)}
                  >
                    {copiedText === createdCardData.cardNumberMasked ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">EXPIRY</p>
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span>{createdCardData.expiry}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={() => handleCopy(createdCardData.expiry)}
                    >
                      {copiedText === createdCardData.expiry ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">CVV</p>
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span>{createdCardData.cvv}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={() => handleCopy(createdCardData.cvv)}
                    >
                      {copiedText === createdCardData.cvv ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-slate-800 pt-4 text-sm">
                <div>
                  <p className="text-[9px] text-slate-400">CARDHOLDER</p>
                  <p className="text-xs">{createdCardData.cardholderName || "AdWallet Africa Merchant"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400">BALANCE</p>
                  <p className="text-emerald-400 font-bold">${createdCardData.balance.toFixed(2)} USD</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsCreatedRevealOpen(false)}>
              I have copied the details safely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
