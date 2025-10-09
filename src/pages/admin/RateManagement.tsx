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
import { Switch } from "@/components/ui/switch";
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

  type Metal = "Gold" | "Silver" | "Platinum";
  const metals: Metal[] = ["Gold", "Silver", "Platinum"];

  const karatOptions = ["24K", "22K", "21K", "20K", "18K", "16K", "14K", "10K"];

  const [rateSourceByMetal, setRateSourceByMetal] = useState<Record<Metal, "live" | "manual">>({
    Gold: "live",
    Silver: "live",
    Platinum: "live",
  });

  const [manualRates, setManualRates] = useState<Record<Metal, Partial<Record<string, number>>>>({
    Gold: { "24K": 0, "22K": 0, "21K": 0, "20K": 0, "18K": 0, "16K": 0, "14K": 0, "10K": 0 },
    Silver: { "24K": 0 },
    Platinum: { "24K": 0 },
  });

  type RateHistoryItem = {
    dateIso: string;
    metal: Metal;
    category: string;
    karat: string;
    pricePerGram: number;
    source: "manual" | "live";
  };
  const [rateHistory, setRateHistory] = useState<RateHistoryItem[]>([]);

  const productCategories = [
    "All",
    "Rings",
    "Necklaces",
    "Bracelets",
    "Earrings",
    "Bangles",
    "Chains",
    "Pendants",
  ];
  const [selectedHistoryMetal, setSelectedHistoryMetal] = useState<Metal | "All">("All");
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState<string>("All");
  const [selectedManualCategoryByMetal, setSelectedManualCategoryByMetal] = useState<Record<Metal, string>>({
    Gold: "All",
    Silver: "All",
    Platinum: "All",
  });

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
  }, [selectedMetal, selectedKarat, weight, weightUnit, rateSourceByMetal, manualRates]);

  const calculatePrice = () => {
    if (!selectedMetal) return;

    const pricePerGram = getEffectiveKaratPrice(selectedMetal as Metal, selectedKarat) || 0;
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
  // Palladium intentionally not used

  const getKaratPrice = (metalData: MetalItem | undefined, karat: string) => {
    if (!metalData || !metalData.price_data) return 0;
    const priceKey = `price_gram_${karat.toLowerCase()}` as keyof typeof metalData.price_data;
    const value = metalData.price_data[priceKey] as unknown;
    return typeof value === "number" && !Number.isNaN(value) ? value : 0;
  };

  const getEffectiveKaratPrice = (metal: Metal, karat: string): number | null => {
    if (rateSourceByMetal[metal] === "manual") {
      const manual = manualRates[metal]?.[karat];
      return manual && manual > 0 ? manual : 0;
    }
    const data = getMetalData(metal);
    return getKaratPrice(data, karat) ?? 0;
  };

  const handleManualRateChange = (metal: Metal, karat: string, value: number) => {
    setManualRates((prev) => ({
      ...prev,
      [metal]: { ...(prev[metal] || {}), [karat]: value },
    }));
  };

  const saveManualRatesForMetal = (metal: Metal) => {
    const category = selectedManualCategoryByMetal[metal] || "All";
    const karatsToSave = metal === "Gold" ? karatOptions : ["24K"];
    const now = new Date().toISOString();
    const newEntries = karatsToSave
      .map((k) => {
        const price = Number(manualRates[metal]?.[k] || 0);
        if (!price) return null;
        return {
          dateIso: now,
          metal,
          category,
          karat: k,
          pricePerGram: price,
          source: "manual",
        } as const;
      })
      .filter(Boolean) as RateHistoryItem[];

    if (newEntries.length > 0) {
      setRateHistory((prev) => [...newEntries, ...prev]);
      toast({ title: `${metal} manual rates saved`, description: `${newEntries.length} entr${newEntries.length === 1 ? "y" : "ies"} added to history.` });
    } else {
      toast({ title: "No rates to save", description: "Please enter at least one price.", variant: "destructive" });
    }
  };

  const applyManualRatesToProducts = (metal: Metal) => {
    toast({ title: `Apply to Products`, description: `Manual ${metal} rates will be applied to products (UI only).` });
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    {formatINR(getEffectiveKaratPrice("Gold", "24K"))}
                  </div>
                  {rateSourceByMetal.Gold === "live" && goldData?.price_data &&
                    formatChange(
                      goldData.price_data.ch ?? 0,
                      goldData.price_data.chp ?? 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(goldData?.price_data?.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(goldData?.price_data?.low_price)}
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
                    {formatINR(getEffectiveKaratPrice("Silver", "24K"))}
                  </div>
                  {rateSourceByMetal.Silver === "live" && silverData?.price_data &&
                    formatChange(
                      silverData.price_data.ch ?? 0,
                      silverData.price_data.chp ?? 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(silverData?.price_data?.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(silverData?.price_data?.low_price)}
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
                    {formatINR(getEffectiveKaratPrice("Platinum", "24K"))}
                  </div>
                  {rateSourceByMetal.Platinum === "live" && platinumData?.price_data &&
                    formatChange(
                      platinumData.price_data.ch ?? 0,
                      platinumData.price_data.chp ?? 0
                    )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      High: {formatINR(platinumData?.price_data?.high_price)}
                    </span>
                    <span>
                      Low: {formatINR(platinumData?.price_data?.low_price)}
                    </span>
                  </div>
                  <div className="text-center text-xs text-blue-600 mt-2">
                    Click to calculate price
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          {/* Palladium intentionally hidden */}

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
                      {formatINR(
                        getEffectiveKaratPrice(selectedMetal as Metal, selectedKarat) || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Manual Rate Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Rates</CardTitle>
          <CardDescription>
            Set manual rates for Gold, Silver, and Platinum. Switch source to Manual to use these values across the UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metals.map((metal) => (
              <div key={metal} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{metal}</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Live</span>
                    <Switch
                      checked={rateSourceByMetal[metal] === "manual"}
                      onCheckedChange={(checked) =>
                        setRateSourceByMetal((prev) => ({ ...prev, [metal]: checked ? "manual" : "live" }))
                      }
                    />
                    <span className="text-xs text-muted-foreground">Manual</span>
                  </div>
                </div>

                <div className="space-y-3">
             

                  {metal === "Gold" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {karatOptions.map((k) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-xs">{k} (per g)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={manualRates[metal]?.[k] ?? 0}
                            onChange={(e) => handleManualRateChange(metal, k, Number(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">24K (per g)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={manualRates[metal]?.["24K"] ?? 0}
                          onChange={(e) => handleManualRateChange(metal, "24K", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="secondary" onClick={() => saveManualRatesForMetal(metal)}>Save Manual Rates</Button>
                    <Button onClick={() => applyManualRatesToProducts(metal)}>Apply to Products</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Gold Rates */}
      {/* <Card>
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
                  {formatINR(getEffectiveKaratPrice("Gold", karat))}
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
                    {goldData?.price_data?.exchange || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">
                    {goldData?.price_data?.symbol || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">
                    {goldData?.price_data?.currency || "N/A"}
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
                    {formatINR(goldData?.price_data?.open_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Close:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data?.prev_close_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ask:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data?.ask)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid:</span>
                  <span className="font-medium">
                    {formatINR(goldData?.price_data?.bid)}
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
                    {goldData?.price_data?.timestamp
                      ? new Date(
                          goldData.price_data?.timestamp * 1000
                        ).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Time:</span>
                  <span className="font-medium">
                    {goldData?.price_data?.open_time
                      ? new Date(
                          goldData.price_data?.open_time * 1000
                        ).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Summary Data */}
      {/* {result?.summary && (
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
      )} */}

      {/* Rate History */}
      <Card>
        <CardHeader>
          <CardTitle>Rate History</CardTitle>
          <CardDescription>Track when rates were set, by metal and category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <Label className="text-xs">Metal</Label>
              <Select value={selectedHistoryMetal} onValueChange={(v) => setSelectedHistoryMetal(v as Metal | "All")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {metals.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Metal</TableHead>
               
                <TableHead>Purity</TableHead>
                <TableHead className="text-right">Price/g</TableHead>
               
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateHistory
                .filter((h) => (selectedHistoryMetal === "All" ? true : h.metal === selectedHistoryMetal))
                .filter((h) => (selectedHistoryCategory === "All" ? true : h.category === selectedHistoryCategory))
                .map((h, idx) => (
                  <TableRow key={`${h.dateIso}-${idx}`}>
                    <TableCell>
                      {new Date(h.dateIso).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-medium">{h.metal}</TableCell>
                  
                    <TableCell>{h.karat}</TableCell>
                    <TableCell className="text-right">{formatINR(h.pricePerGram)}</TableCell>
                  
                  </TableRow>
                ))}
              {rateHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No history yet. Save manual rates to record entries.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleString("en-IN")}</p>
        <p className="mt-1">
          Data source: {goldData?.price_data?.exchange || "N/A"} • Currency:{" "}
          {goldData?.price_data?.currency || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default RateManagement;
