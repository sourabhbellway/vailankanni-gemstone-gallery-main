import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RateManagement = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState({
    gold: {
      current: 6420,
      previous: 6380,
      lastUpdated: "2024-01-20 09:30:00"
    },
    silver: {
      current: 78.50,
      previous: 79.20,
      lastUpdated: "2024-01-20 09:30:00"
    }
  });

  const [editRates, setEditRates] = useState({
    gold: rates.gold.current,
    silver: rates.silver.current
  });

  const [priceHistory] = useState([
    { date: "2024-01-20", gold: 6420, silver: 78.50 },
    { date: "2024-01-19", gold: 6380, silver: 79.20 },
    { date: "2024-01-18", gold: 6355, silver: 78.90 },
    { date: "2024-01-17", gold: 6370, silver: 79.45 },
    { date: "2024-01-16", gold: 6340, silver: 78.75 },
    { date: "2024-01-15", gold: 6325, silver: 78.20 }
  ]);

  const getChangePercentage = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const getChangeIcon = (current, previous) => {
    return current > previous ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (current, previous) => {
    return current > previous ? "text-green-600" : "text-red-600";
  };

  const handleUpdateRates = () => {
    const newRates = {
      gold: {
        current: editRates.gold,
        previous: rates.gold.current,
        lastUpdated: new Date().toLocaleString()
      },
      silver: {
        current: editRates.silver,
        previous: rates.silver.current,
        lastUpdated: new Date().toLocaleString()
      }
    };
    setRates(newRates);
    toast({
      title: "Rates Updated",
      description: "Gold and silver rates have been updated successfully."
    });
  };

  const handleAutoUpdate = async () => {
    // Simulate API call
    toast({
      title: "Fetching Latest Rates",
      description: "Retrieving current market rates..."
    });
    
    setTimeout(() => {
      const goldChange = (Math.random() - 0.5) * 100; // Random change
      const silverChange = (Math.random() - 0.5) * 2;
      
      setEditRates({
        gold: Math.round((rates.gold.current + goldChange) * 100) / 100,
        silver: Math.round((rates.silver.current + silverChange) * 100) / 100
      });
      
      toast({
        title: "Rates Fetched",
        description: "Latest market rates have been retrieved. Review and save to apply."
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Management</h1>
          <p className="text-muted-foreground">
            Manage gold and silver rates for automatic pricing
          </p>
        </div>
        <Button onClick={handleAutoUpdate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Auto Update
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Rate (per gram)</CardTitle>
            <div className="flex items-center space-x-1">
              {React.createElement(getChangeIcon(rates.gold.current, rates.gold.previous), {
                className: `h-4 w-4 ${getChangeColor(rates.gold.current, rates.gold.previous)}`
              })}
              <span className={`text-sm ${getChangeColor(rates.gold.current, rates.gold.previous)}`}>
                {getChangePercentage(rates.gold.current, rates.gold.previous)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{rates.gold.current}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {rates.gold.lastUpdated}
            </p>
            <div className="mt-4">
              <Label htmlFor="goldRate">Update Gold Rate</Label>
              <Input
                id="goldRate"
                type="number"
                step="0.01"
                value={editRates.gold}
                onChange={(e) => setEditRates({...editRates, gold: parseFloat(e.target.value)})}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Silver Rate (per gram)</CardTitle>
            <div className="flex items-center space-x-1">
              {React.createElement(getChangeIcon(rates.silver.current, rates.silver.previous), {
                className: `h-4 w-4 ${getChangeColor(rates.silver.current, rates.silver.previous)}`
              })}
              <span className={`text-sm ${getChangeColor(rates.silver.current, rates.silver.previous)}`}>
                {getChangePercentage(rates.silver.current, rates.silver.previous)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{rates.silver.current}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {rates.silver.lastUpdated}
            </p>
            <div className="mt-4">
              <Label htmlFor="silverRate">Update Silver Rate</Label>
              <Input
                id="silverRate"
                type="number"
                step="0.01"
                value={editRates.silver}
                onChange={(e) => setEditRates({...editRates, silver: parseFloat(e.target.value)})}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleUpdateRates} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Update Rates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>
            Recent changes in gold and silver rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Gold Rate (₹/g)</TableHead>
                <TableHead>Silver Rate (₹/g)</TableHead>
                <TableHead>Gold Change</TableHead>
                <TableHead>Silver Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((entry, index) => {
                const prevEntry = priceHistory[index + 1];
                return (
                  <TableRow key={entry.date}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-medium">₹{entry.gold}</TableCell>
                    <TableCell className="font-medium">₹{entry.silver}</TableCell>
                    <TableCell>
                      {prevEntry && (
                        <Badge variant={entry.gold > prevEntry.gold ? "default" : "destructive"}>
                          {entry.gold > prevEntry.gold ? "+" : ""}
                          {(entry.gold - prevEntry.gold).toFixed(2)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {prevEntry && (
                        <Badge variant={entry.silver > prevEntry.silver ? "default" : "destructive"}>
                          {entry.silver > prevEntry.silver ? "+" : ""}
                          {(entry.silver - prevEntry.silver).toFixed(2)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RateManagement;