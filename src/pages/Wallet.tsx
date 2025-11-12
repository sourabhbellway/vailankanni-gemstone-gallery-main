import { useEffect, useState } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile } from "@/lib/api/userController";
import { getUserWallet, type WalletTransaction } from "@/lib/api/walletController";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Eye, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "@/components/ProfileLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Wallet = () => {
  const { token, isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated || !token) {
        navigate("/signin");
        return;
      }
      setLoading(true);
      try {
        const profileResp = await getUserProfile(token);
        setProfile(profileResp);
        const id = profileResp?.data?.id ?? profileResp?.data?.user?.id ?? null;
        if (!id) throw new Error("Unable to resolve user id");
        const wallet = await getUserWallet(token, Number(id));
        if (wallet.success && wallet.data) {
          setBalance(wallet.data.balance);
          setTransactions(wallet.data.transactions || []);
        } else {
          toast({
            title: "Wallet",
            description: wallet.message || "Unable to fetch wallet",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("Wallet fetch error:", err);
        toast({
          title: "Error",
          description: err?.message || "Failed to load wallet",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated, token, toast, navigate]);

  const handleSectionChange = (
    section: "profile" | "plans" | "wallet" | "vault" | "customOrders"
  ) => {
    if (section === "wallet") return;
    navigate("/profile", { state: { activeSection: section } });
  };

  return (
    <ProfileLayout
      activeSection="wallet"
      profile={profile}
      setActiveSection={handleSectionChange}
    >
      <div className="relative space-y-6">
        {/* Header with top-right wallet balance */}
        <div className="flex items-center justify-between mb-4 p-4">
          <div>
            <h2 className="text-2xl font-bold text-[#084526] flex items-center gap-2">
              <WalletIcon className="h-6 w-6" /> Wallet
            </h2>
            <p className="text-sm text-muted-foreground">
              View your credits and debits below
            </p>
          </div>

          {/* Wallet balance on top-right */}
          <Card className="w-[180px] bg-gradient-to-r from-[#084526] to-green-700 text-white border-none shadow-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium flex items-center gap-1 text-white/90">
                <WalletIcon className="h-4 w-4" /> Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  ₹{Number(balance || 0).toLocaleString("en-IN")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="shadow-sm border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Transactions
            </CardTitle>
            <CardDescription>All wallet activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Scheme ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow
                      key={t.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <TableCell>
                        {t.user_scheme_id ? (
                          <span className="font-semibold text-[#084526]">
                            #{t.user_scheme_id}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(t.created_at).toLocaleString()}
                      </TableCell>

                      {/* Credit/Debit pill centered */}
                      <TableCell>
                        <div className="flex justify-center items-center">
                          {t.type === "credit" ? (
                            <Badge
                              className="bg-green-100 text-green-700 rounded-full  text-xs flex items-center gap-1 justify-center hover:bg-green-100"
                            >
                              Credit
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-red-100 text-red-700 rounded-full  text-xs flex items-center gap-1 justify-center hover:bg-red-100"
                            >
                               Debit
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell
                        className="max-w-[320px] truncate"
                        title={t.description}
                      >
                        {t.description}
                      </TableCell>

                      <TableCell
                        className={`font-semibold ${
                          t.type === "credit"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {t.type === "credit" ? "+" : "-"}₹
                        {Number(t.amount).toLocaleString("en-IN")}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {t.user_scheme_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/my-plans/${t.user_scheme_id}/details`)
                            }
                          >
                            View Scheme Details
                          </Button>
                        ) : t.attachments?.length ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreviewImages(t.attachments || []);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Preview
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No transactions yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Attachments
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {previewImages.map((src, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded overflow-hidden border"
                >
                  <img
                    src={src}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProfileLayout>
  );
};

export default Wallet;
