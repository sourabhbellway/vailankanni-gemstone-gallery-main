import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerReport } from "@/lib/api/reportController";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";

export default function ReportsAnalytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filters, setFilters] = useState({ name: "", email: "", mobile: "", user_code: "" });

  const fetchData = async (updatedFilters?: typeof filters) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getCustomerReport(token, updatedFilters || filters);
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch to avoid too many API calls
  const debouncedFetch = useCallback(debounce(fetchData, 500), [token, filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    debouncedFetch(newFilters);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customer">Customer Report</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="schemes">Schemes Report</TabsTrigger>
          <TabsTrigger value="goldplans">Gold Plans Report</TabsTrigger>
        </TabsList>

        {/* Customer Report */}
        <TabsContent value="customer">
          {/* Inline Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Name" name="name" value={filters.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input placeholder="Email" name="email" value={filters.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input placeholder="Mobile" name="mobile" value={filters.mobile} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Code</label>
              <Input placeholder="User Code" name="user_code" value={filters.user_code} onChange={handleChange} />
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : !customers.length ? (
            <div className="p-6 text-center">No report found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Completed Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Schemes</TableHead>
                    <TableHead>Gold Invested</TableHead>
                    <TableHead>Total Gold</TableHead>
                    <TableHead>Custom Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.user_id} className="hover:bg-gray-50">
                      <TableCell>{c.user_code || "-"}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.mobile || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "Active" ? "default" : "destructive"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.order_summary.total_orders}</TableCell>
                      <TableCell>{c.order_summary.completed_orders}</TableCell>
                      <TableCell>₹{c.order_summary.total_spent}</TableCell>
                      <TableCell>₹{c.wallet.balance}</TableCell>
                      <TableCell>{c.schemes.total_schemes} / ₹{c.schemes.total_paid}</TableCell>
                      <TableCell>₹{c.gold_plans.total_invested}</TableCell>
                      <TableCell>{c.gold_plans.total_gold_grams} g</TableCell>
                      <TableCell>{c.custom_orders.total_custom_orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Placeholder Tabs */}
        <TabsContent value="sales">
          <div className="p-6 text-center">Sales report coming soon...</div>
        </TabsContent>
        <TabsContent value="schemes">
          <div className="p-6 text-center">Schemes report coming soon...</div>
        </TabsContent>
        <TabsContent value="goldplans">
          <div className="p-6 text-center">Gold plans report coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
