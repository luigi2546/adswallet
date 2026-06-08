import { useState } from "react";
import { useGetWallet, useGetTransactions, useDepositFunds, getGetWalletQueryKey, getGetTransactionsQueryKey, DepositInputMethod } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("momo");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("");

  const { data: wallet } = useGetWallet();
  const { data: transactionsData } = useGetTransactions();
  const depositMutation = useDepositFunds();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount))) return;
    
    depositMutation.mutate(
      { 
        data: {
          amount: Number(amount),
          method: method as any,
          phone: phone || null,
          provider: provider || null
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Deposit initiated", description: "Your deposit is processing." });
          setIsDepositOpen(false);
          setAmount("");
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your ad credits and billing.</p>
        </div>
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogTrigger asChild>
            <Button>
              <ArrowDownRight className="w-4 h-4 mr-2" />
              Deposit Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>Add credits to your account using Mobile Money or Card.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input type="number" placeholder="100" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momo">Mobile Money</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {method === "momo" && (
                <>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTN">MTN</SelectItem>
                        <SelectItem value="Vodafone">Telecel</SelectItem>
                        <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="+233..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={depositMutation.isPending}>
                {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center gap-2">
              <Wallet className="w-8 h-8 opacity-80" />
              ${wallet?.creditBalance?.toFixed(2) || "0.00"}
            </div>
            <p className="mt-4 text-sm opacity-80">1 Credit = $1.00 USD</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[calc(100%-3rem)] items-center justify-around">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Deposited</p>
              <p className="text-2xl font-bold text-foreground">${wallet?.totalDeposited?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">${wallet?.totalSpent?.toFixed(2) || "0.00"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent deposits and campaign spends.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsData?.transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactionsData?.transactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(tx.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{tx.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-green-500" /> : 
                         tx.type === 'spend' ? <ArrowUpRight className="w-4 h-4 text-red-500" /> : 
                         <RefreshCcw className="w-4 h-4 text-yellow-500" />}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}
                             className={tx.status === 'completed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none' : ''}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}