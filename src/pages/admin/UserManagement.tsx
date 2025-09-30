import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Mail, Phone, UserX, UserCheck, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const users = [
    {
      id: "USR001",
      name: "Priya Sharma",
      email: "priya@email.com",
      phone: "+91 98765 43210",
      location: "Panjim, Goa",
      joinDate: "2024-01-15",
      totalOrders: 5,
      totalSpent: "₹1,25,000",
      status: "Active",
      kycStatus: "Verified",
      lastLogin: "2024-01-20"
    },
    {
      id: "USR002",
      name: "Rajesh Kumar",
      email: "rajesh@email.com",
      phone: "+91 87654 32109",
      location: "Margao, Goa",
      joinDate: "2024-01-10",
      totalOrders: 3,
      totalSpent: "₹75,000",
      status: "Active",
      kycStatus: "Pending",
      lastLogin: "2024-01-19"
    },
    {
      id: "USR003",
      name: "Anita Desai",
      email: "anita@email.com",
      phone: "+91 76543 21098",
      location: "Calangute, Goa",
      joinDate: "2023-12-20",
      totalOrders: 8,
      totalSpent: "₹2,10,000",
      status: "Active",
      kycStatus: "Verified",
      lastLogin: "2024-01-18"
    },
    {
      id: "USR004",
      name: "Vikram Singh",
      email: "vikram@email.com",
      phone: "+91 65432 10987",
      location: "Vasco, Goa",
      joinDate: "2023-11-15",
      totalOrders: 1,
      totalSpent: "₹85,000",
      status: "Blocked",
      kycStatus: "Rejected",
      lastLogin: "2024-01-05"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Blocked": return "bg-red-100 text-red-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const UserDetailsModal = ({ user }: { user: typeof users[0] }) => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-sm">{user.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-sm">{user.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-sm">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Join Date</label>
              <p className="text-sm">{user.joinDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Login</label>
              <p className="text-sm">{user.lastLogin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
              <Badge className={getKycStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Purchase History</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium">Total Orders</p>
            <p className="text-2xl font-bold">{user.totalOrders}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium">Total Spent</p>
            <p className="text-2xl font-bold">{user.totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
        <Button variant="outline">
          <Phone className="mr-2 h-4 w-4" />
          Call User
        </Button>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        {user.status === "Active" ? (
          <Button variant="destructive">
            <UserX className="mr-2 h-4 w-4" />
            Block User
          </Button>
        ) : (
          <Button variant="default">
            <UserCheck className="mr-2 h-4 w-4" />
            Unblock User
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage customer accounts and profiles</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="kyc">KYC Requests</TabsTrigger>
          <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1,180</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">32</div>
                <p className="text-xs text-muted-foreground">New This Month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Blocked Users</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
              <CardDescription>Manage customer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">Joined {user.joinDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.email}</div>
                          <div className="text-muted-foreground">{user.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>{user.totalOrders}</TableCell>
                      <TableCell className="font-medium">{user.totalSpent}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getKycStatusColor(user.kycStatus)}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details - {user.name}</DialogTitle>
                              <DialogDescription>
                                View and manage user information
                              </DialogDescription>
                            </DialogHeader>
                            <UserDetailsModal user={user} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Requests</CardTitle>
              <CardDescription>Review and approve user KYC documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No pending KYC requests</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  KYC verification requests will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">User analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="text-sm font-medium">456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Active Users</span>
                    <span className="text-sm font-medium">1,203</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session Duration</span>
                    <span className="text-sm font-medium">12m 45s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;