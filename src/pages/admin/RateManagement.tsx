import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  adminGetGoldPrice,
  type GoldPriceResult,
} from "@/lib/api/ratesController";

const RateManagement = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [result, setResult] = useState<GoldPriceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRates = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetGoldPrice(token);
      setResult(data);
    } catch (error: any) {
      toast({
        title: "Failed to fetch rates",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatINR = (value?: number | null) =>
    value == null ? "-" : `₹${Number(value).toLocaleString()}`;

  const gold = result?.items.find((i) => i.metal === "Gold");
  const silver = result?.items.find((i) => i.metal === "Silver");
  const goldPerGram = gold?.price_data?.price_gram_24k;
  const silverPerGram = silver?.price_data?.price_gram_24k;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Management</h1>
          <p className="text-muted-foreground">
            Manage gold and silver rates for automatic pricing
          </p>
        </div>
        <Button onClick={fetchRates} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold</CardTitle>
            <CardDescription className="text-xs">
              Gold · Base: 24K
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">1g</div>
                <div className="text-xl font-semibold">
                  {formatINR(goldPerGram)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">10g</div>
                <div className="text-xl font-semibold">
                  {formatINR(
                    goldPerGram != null ? goldPerGram * 10 : undefined
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">1kg</div>
                <div className="text-xl font-semibold">
                  {formatINR(
                    goldPerGram != null ? goldPerGram * 1000 : undefined
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purity</TableHead>
                    <TableHead className="text-right">10g</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result?.summary?.Gold ? (
                    ["24K", "22K", "18K"].map((k) => (
                      <TableRow key={k}>
                        <TableCell className="font-medium">{k}</TableCell>
                        <TableCell className="text-right">
                          {formatINR(
                            Number((result?.summary as any).Gold?.[k] ?? 0)
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No data"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Silver</CardTitle>
            <CardDescription className="text-xs">
              Silver · Base: per gram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">1g</div>
                <div className="text-xl font-semibold">
                  {formatINR(silverPerGram)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">10g</div>
                <div className="text-xl font-semibold">
                  {formatINR(
                    silverPerGram != null ? silverPerGram * 10 : undefined
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">1kg</div>
                <div className="text-xl font-semibold">
                  {formatINR(
                    silverPerGram != null ? silverPerGram * 1000 : undefined
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              Market: {silver?.price_data?.exchange || "-"} · Symbol:{" "}
              {silver?.price_data?.symbol || "-"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RateManagement;
