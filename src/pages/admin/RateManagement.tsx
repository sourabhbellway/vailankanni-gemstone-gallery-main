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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Coins,
  Clock,
  DollarSign,
  BarChart3,
  Calculator,
  Scale,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  adminGetGoldPrice,
  type GoldPriceResult,
  type MetalItem,
} from "@/lib/api/ratesController";

const RateManagement = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [result, setResult] = useState<GoldPriceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMetal, setSelectedMetal] = useState<string>("");
  const [selectedKarat, setSelectedKarat] = useState<string>("24K");
  const [weight, setWeight] = useState<number>(10);
  const [weightUnit, setWeightUnit] = useState<"gm" | "kg" | "tola">("gm");
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const karatOptions = ["24K", "22K", "21K", "20K", "18K", "16K", "14K", "10K"];

  const fetchRates = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetGoldPrice(token);
      setResult(data);
      if (!loading) {
        toast({
          title: "Rates Updated",
          description: "Metal rates have been refreshed successfully.",
        });
      }
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

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchRates();

    const interval = setInterval(() => {
      fetchRates();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Calculate price when calculator inputs change
  useEffect(() => {
    calculatePrice();
  }, [selectedMetal, selectedKarat, weight, weightUnit, result]);

  const calculatePrice = () => {
    if (!selectedMetal || !result) return;

    const metalData = result.items.find((item) => item.metal === selectedMetal);
    if (!metalData) return;

    const priceKey =
      `price_gram_${selectedKarat.toLowerCase()}` as keyof typeof metalData.price_data;
    const pricePerGram = metalData.price_data[priceKey] as number;

    if (!pricePerGram) return;

    let finalWeight = weight;
    if (weightUnit === "kg") {
      finalWeight = weight * 1000; // Convert kg to grams
    } else if (weightUnit === "tola") {
      finalWeight = weight * 11.664; // Convert tola to grams
    }

    const totalPrice = pricePerGram * finalWeight;
    setCalculatedPrice(totalPrice);
  };

  const openCalculator = (metalName: string) => {
    setSelectedMetal(metalName);
    setSelectedKarat("24K");
    setWeight(10);
    setWeightUnit("gm");
    setIsCalculatorOpen(true);
  };

  const formatINR = (value?: number | null) =>
    value == null
      ? "-"
      : `₹${Number(value).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <div
        className={`flex items-center space-x-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="font-medium text-sm">
          {isPositive ? "+" : ""}
          {formatINR(change)} ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </span>
      </div>
    );
  };

  const getMetalData = (metalName: string): MetalItem | undefined => {
    return result?.items.find((item) => item.metal === metalName);
  };

  const goldData = getMetalData("Gold");
  const silverData = getMetalData("Silver");
  const platinumData = getMetalData("Platinum");
  const palladiumData = getMetalData("Palladium");

  const getKaratPrice = (metalData: MetalItem | undefined, karat: string) => {
    if (!metalData) return null;
    const priceKey =
      `price_gram_${karat.toLowerCase()}` as keyof typeof metalData.price_data;
    return metalData.price_data[priceKey] as number;
  };

  const getAvailableKaratOptions = (metalName: string) => {
    if (metalName === "Gold") {
      return karatOptions;
    }
    return ["24K"]; // Other metals typically only have one purity
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Management</h1>
          <p className="text-muted-foreground">
            Live metal rates and market data for pricing management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Auto-refresh: 5min
          </Badge>
          <Button onClick={fetchRates} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh Rates"}
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Gold Card */}
        <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
          <DialogTrigger asChild>
            <Card
              className="border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => openCalculator("Gold")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-amber-800 font-bold text-sm">Au</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Gold</span>
                    <p className="text-xs text-muted-foreground">
                      24K per gram
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-amber-800">
                    {formatINR(goldData?.price_data.price_gram_24k)}
                  </div>
                  {goldData &&
                    formatChange(
                      goldData.price_data.ch || 0,
                      goldData.price_data.chp || 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(goldData?.price_data.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(goldData?.price_data.low_price)}
                    </span>
                  </div>
                  <div className="text-center text-xs text-amber-600 mt-2">
                    Click to calculate price
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          {/* Silver Card */}
          <DialogTrigger asChild>
            <Card
              className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => openCalculator("Silver")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-800 font-bold text-sm">Ag</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Silver</span>
                    <p className="text-xs text-muted-foreground">per gram</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatINR(silverData?.price_data.price_gram_24k)}
                  </div>
                  {silverData &&
                    formatChange(
                      silverData.price_data.ch || 0,
                      silverData.price_data.chp || 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(silverData?.price_data.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(silverData?.price_data.low_price)}
                    </span>
                  </div>
                  <div className="text-center text-xs text-gray-600 mt-2">
                    Click to calculate price
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          {/* Platinum Card */}
          <DialogTrigger asChild>
            <Card
              className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => openCalculator("Platinum")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-800 font-bold text-sm">Pt</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Platinum</span>
                    <p className="text-xs text-muted-foreground">per gram</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-800">
                    {formatINR(platinumData?.price_data.price_gram_24k)}
                  </div>
                  {platinumData &&
                    formatChange(
                      platinumData.price_data.ch || 0,
                      platinumData.price_data.chp || 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(platinumData?.price_data.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(platinumData?.price_data.low_price)}
                    </span>
                  </div>
                  <div className="text-center text-xs text-blue-600 mt-2">
                    Click to calculate price
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          {/* Palladium Card */}
          <DialogTrigger asChild>
            <Card
              className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => openCalculator("Palladium")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center">
                    <span className="text-purple-800 font-bold text-sm">
                      Pd
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Palladium</span>
                    <p className="text-xs text-muted-foreground">per gram</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-purple-800">
                    {formatINR(palladiumData?.price_data.price_gram_24k)}
                  </div>
                  {palladiumData &&
                    formatChange(
                      palladiumData.price_data.ch || 0,
                      palladiumData.price_data.chp || 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(palladiumData?.price_data.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(palladiumData?.price_data.low_price)}
                    </span>
                  </div>
                  <div className="text-center text-xs text-purple-600 mt-2">
                    Click to calculate price
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          {/* Calculator Dialog */}
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>{selectedMetal} Price Calculator</span>
              </DialogTitle>
              <DialogDescription>
                Calculate the price for your {selectedMetal.toLowerCase()} based
                on weight and purity
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculator Controls */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metal">Metal Type</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-gray-900">
                      {selectedMetal}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="karat">Purity/Karat</Label>
                  <Select
                    value={selectedKarat}
                    onValueChange={setSelectedKarat}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableKaratOptions(selectedMetal).map((karat) => (
                        <SelectItem key={karat} value={karat}>
                          {karat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="flex-1"
                    />
                    <Select
                      value={weightUnit}
                      onValueChange={(value: "gm" | "kg" | "tola") =>
                        setWeightUnit(value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gm">gm</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="tola">tola</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={calculatePrice} className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Price
                  </Button>
                </div>
              </div>

              {/* Result Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <h4 className="text-lg font-semibold text-blue-800">
                      Estimated Price
                    </h4>
                  </div>

                  <div className="text-3xl font-bold text-blue-900">
                    {formatINR(calculatedPrice)}
                  </div>

                  <div className="text-sm text-blue-600 space-y-1">
                    <p>
                      {weight} {weightUnit} of {selectedMetal}
                    </p>
                    <p>{selectedKarat} purity</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-2">
                      Price per gram:
                    </p>
                    <p className="font-semibold text-blue-800">
                      {(() => {
                        const metalData = getMetalData(selectedMetal);
                        if (!metalData) return "N/A";
                        const priceKey =
                          `price_gram_${selectedKarat.toLowerCase()}` as keyof typeof metalData.price_data;
                        return formatINR(
                          (metalData.price_data[priceKey] as number) || 0
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Detailed Gold Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-amber-600" />
            <span>Gold Rates by Karat</span>
          </CardTitle>
          <CardDescription>
            Current gold prices for different purity levels per gram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            {karatOptions.map((karat) => (
              <div
                key={karat}
                className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="text-sm font-medium text-amber-800 mb-1">
                  {karat}
                </div>
                <div className="text-lg font-bold text-amber-900">
                  {formatINR(getKaratPrice(goldData, karat))}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Market Data</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange:</span>
                  <span className="font-medium">
                    {goldData?.price_data.exchange || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">
                    {goldData?.price_data.symbol || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">
                    {goldData?.price_data.currency || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Price Data</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data.open_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Close:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data.prev_close_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ask:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data.ask)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data.bid)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timing</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-medium">
                    {goldData?.price_data.timestamp
                      ? new Date(
                          goldData.price_data.timestamp * 1000
                        ).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Time:</span>
                  <span className="font-medium">
                    {goldData?.price_data.open_time
                      ? new Date(
                          goldData.price_data.open_time * 1000
                        ).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Data */}
      {result?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Data</CardTitle>
            <CardDescription>
              Pre-calculated rates for common quantities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {result.summary.Gold && (
                <div>
                  <h4 className="font-semibold mb-3 text-amber-800">
                    Gold Summary
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Purity</TableHead>
                        <TableHead className="text-right">10g</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["24K", "22K", "18K"].map((k) => (
                        <TableRow key={k}>
                          <TableCell className="font-medium">{k}</TableCell>
                          <TableCell className="text-right">
                            {formatINR(
                              Number((result.summary as any).Gold?.[k] ?? 0)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {result.summary.Silver && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">
                    Silver Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="font-medium">
                        {(result.summary as any).Silver?.unit || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">
                        {formatINR((result.summary as any).Silver?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleString("en-IN")}</p>
        <p className="mt-1">
          Data source: {goldData?.price_data.exchange || "N/A"} • Currency:{" "}
          {goldData?.price_data.currency || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default RateManagement;
