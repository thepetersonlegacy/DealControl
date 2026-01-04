import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Funnel, FunnelStep, OrderBump, Product, User, Purchase } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, Edit, BarChart3, TrendingUp, DollarSign, Users, Target, ShoppingCart, LayoutDashboard, UserCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface FunnelAnalytics {
  funnel: Funnel;
  entryProduct: Product | null;
  steps: FunnelStep[];
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface StepAnalytics {
  step: FunnelStep;
  acceptedCount: number;
  declinedCount: number;
  acceptanceRate: number;
}

interface DetailedFunnelAnalytics {
  funnel: Funnel;
  entryProduct: Product | null;
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  activeSessions: number;
  completionRate: number;
  totalRevenue: number;
  avgOrderValue: number;
  stepAnalytics: StepAnalytics[];
}

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalUsers: number;
  totalSubscribers: number;
  avgOrderValue: number;
  recentRevenue: number;
  recentOrders: number;
  activeFunnelSessions: number;
  completedFunnelSessions: number;
  funnelConversionRate: number;
}

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isAdmin: number | null;
  createdAt: number | null;
}

interface AdminPurchase {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  stripePaymentId: string | null;
  purchasedAt: number;
  product: Product | null;
  user: { id: string; email: string | null; firstName: string | null; lastName: string | null } | null;
}

const funnelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  entryProductId: z.string().optional(),
  isActive: z.number().optional(),
});

const stepFormSchema = z.object({
  stepType: z.string().min(1, "Step type is required"),
  offerProductId: z.string().min(1, "Product is required"),
  priority: z.number().min(0),
  priceOverride: z.number().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  declineText: z.string().optional(),
  timerSeconds: z.number().optional(),
  isActive: z.number().optional(),
});

const orderBumpFormSchema = z.object({
  productId: z.string().min(1, "Main product is required"),
  bumpProductId: z.string().min(1, "Bump product is required"),
  bumpPrice: z.number().min(1, "Price is required"),
  headline: z.string().optional(),
  description: z.string().optional(),
  isActive: z.number().optional(),
});

const CHART_COLORS = ["#a855f7", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];

export default function Admin() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [isCreateFunnelOpen, setIsCreateFunnelOpen] = useState(false);
  const [isCreateStepOpen, setIsCreateStepOpen] = useState(false);
  const [isCreateOrderBumpOpen, setIsCreateOrderBumpOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  const isAdmin = !authLoading && isAuthenticated && user?.isAdmin === 1;

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAdmin,
  });

  const { data: funnels, isLoading: funnelsLoading } = useQuery<Funnel[]>({
    queryKey: ["/api/funnels"],
    enabled: isAdmin,
  });

  const { data: orderBumps, isLoading: orderBumpsLoading } = useQuery<OrderBump[]>({
    queryKey: ["/api/admin/order-bumps"],
    enabled: isAdmin,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<FunnelAnalytics[]>({
    queryKey: ["/api/admin/analytics/funnels"],
    enabled: isAdmin,
  });

  const { data: selectedFunnelAnalytics, isLoading: detailLoading } = useQuery<DetailedFunnelAnalytics>({
    queryKey: ["/api/admin/analytics/funnels", selectedFunnelId],
    enabled: isAdmin && !!selectedFunnelId,
  });

  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: adminUsers, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: adminPurchases, isLoading: purchasesLoading } = useQuery<AdminPurchase[]>({
    queryKey: ["/api/admin/purchases"],
    enabled: isAdmin,
  });

  const funnelForm = useForm<z.infer<typeof funnelFormSchema>>({
    resolver: zodResolver(funnelFormSchema),
    defaultValues: { name: "", description: "", isActive: 1 },
  });

  const stepForm = useForm<z.infer<typeof stepFormSchema>>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: { stepType: "upsell", priority: 0, isActive: 1 },
  });

  const orderBumpForm = useForm<z.infer<typeof orderBumpFormSchema>>({
    resolver: zodResolver(orderBumpFormSchema),
    defaultValues: { bumpPrice: 0, isActive: 1 },
  });

  const createFunnelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof funnelFormSchema>) => {
      const res = await apiRequest("POST", "/api/funnels", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/funnels"] });
      setIsCreateFunnelOpen(false);
      funnelForm.reset();
      toast({ title: "Funnel created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating funnel", description: error.message, variant: "destructive" });
    },
  });

  const updateFunnelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Funnel> }) => {
      const res = await apiRequest("PUT", `/api/funnels/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/funnels"] });
      setEditingFunnel(null);
      toast({ title: "Funnel updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating funnel", description: error.message, variant: "destructive" });
    },
  });

  const deleteFunnelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/funnels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/funnels"] });
      toast({ title: "Funnel deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting funnel", description: error.message, variant: "destructive" });
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async ({ funnelId, data }: { funnelId: string; data: z.infer<typeof stepFormSchema> }) => {
      const res = await apiRequest("POST", `/api/funnels/${funnelId}/steps`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/funnels"] });
      setIsCreateStepOpen(false);
      stepForm.reset();
      toast({ title: "Step created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating step", description: error.message, variant: "destructive" });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async ({ funnelId, stepId }: { funnelId: string; stepId: string }) => {
      await apiRequest("DELETE", `/api/funnels/${funnelId}/steps/${stepId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/funnels"] });
      toast({ title: "Step deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting step", description: error.message, variant: "destructive" });
    },
  });

  const createOrderBumpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof orderBumpFormSchema>) => {
      const res = await apiRequest("POST", "/api/order-bumps", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/order-bumps"] });
      setIsCreateOrderBumpOpen(false);
      orderBumpForm.reset();
      toast({ title: "Order bump created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating order bump", description: error.message, variant: "destructive" });
    },
  });

  const deleteOrderBumpMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/order-bumps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/order-bumps"] });
      toast({ title: "Order bump deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting order bump", description: error.message, variant: "destructive" });
    },
  });

  const getProductTitle = (productId: string) => {
    return products?.find(p => p.id === productId)?.title || "Unknown Product";
  };

  const summaryStats = analytics ? {
    totalFunnels: analytics.length,
    activeFunnels: analytics.filter(a => a.funnel.isActive === 1).length,
    totalSessions: analytics.reduce((sum, a) => sum + a.totalSessions, 0),
    totalRevenue: analytics.reduce((sum, a) => sum + a.totalRevenue, 0),
    avgCompletionRate: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length 
      : 0,
  } : null;

  const chartData = analytics?.map(a => ({
    name: a.funnel.name.length > 15 ? a.funnel.name.substring(0, 15) + "..." : a.funnel.name,
    sessions: a.totalSessions,
    revenue: a.totalRevenue / 100,
    completionRate: a.completionRate,
  })) || [];

  if (authLoading || funnelsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-admin" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please log in to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/login")} data-testid="button-login-redirect">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/")} data-testid="button-home-redirect">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-admin-subtitle">
              Manage funnels, order bumps, and view analytics
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 max-w-2xl" data-testid="tabs-admin">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
              <TabsTrigger value="funnels" data-testid="tab-funnels">Funnels</TabsTrigger>
              <TabsTrigger value="order-bumps" data-testid="tab-order-bumps">Order Bumps</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard Overview
              </h2>
              
              {statsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : adminStats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-revenue">
                          ${(adminStats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ${(adminStats.recentRevenue / 100).toFixed(2)} last 30 days
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-orders">{adminStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">{adminStats.recentOrders} last 30 days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-customers">{adminStats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">{adminStats.totalUsers} registered users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-aov">
                          ${(adminStats.avgOrderValue / 100).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">per order</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Funnels</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-active-funnels">
                          {adminStats.activeFunnelSessions}
                        </div>
                        <p className="text-xs text-muted-foreground">in progress</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Funnels</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-completed-funnels">
                          {adminStats.completedFunnelSessions}
                        </div>
                        <p className="text-xs text-muted-foreground">total completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Funnel Conversion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-overview-conversion">
                          {adminStats.funnelConversionRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">completion rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Subscribers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-overview-subscribers">
                        {adminStats.totalSubscribers}
                      </div>
                      <p className="text-sm text-muted-foreground">email subscribers</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Unable to load stats.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                All Sales
              </h2>
              
              {purchasesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : adminPurchases && adminPurchases.length > 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Payment ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminPurchases.map((purchase) => (
                          <TableRow key={purchase.id} data-testid={`row-purchase-${purchase.id}`}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(purchase.purchasedAt * 1000).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {purchase.user?.firstName || ''} {purchase.user?.lastName || ''}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {purchase.user?.email || 'Unknown'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{purchase.product?.title || 'Unknown Product'}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(purchase.amount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {purchase.stripePaymentId ? purchase.stripePaymentId.slice(0, 20) + '...' : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground" data-testid="text-no-sales">No sales yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                All Users
              </h2>
              
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : adminUsers && adminUsers.length > 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((user) => (
                          <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                            <TableCell>
                              <div className="font-medium">
                                {user.firstName || ''} {user.lastName || ''}
                                {!user.firstName && !user.lastName && <span className="text-muted-foreground">No name</span>}
                              </div>
                            </TableCell>
                            <TableCell>{user.email || 'No email'}</TableCell>
                            <TableCell>
                              <Badge variant={user.isAdmin === 1 ? "default" : "secondary"} className="no-default-active-elevate">
                                {user.isAdmin === 1 ? "Admin" : "User"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.createdAt ? new Date(user.createdAt * 1000).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground" data-testid="text-no-users">No users registered yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="funnels" className="space-y-6">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Sales Funnels</h2>
                <Dialog open={isCreateFunnelOpen} onOpenChange={setIsCreateFunnelOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-funnel">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Funnel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Funnel</DialogTitle>
                    </DialogHeader>
                    <Form {...funnelForm}>
                      <form onSubmit={funnelForm.handleSubmit((data) => createFunnelMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={funnelForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Funnel name" data-testid="input-funnel-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={funnelForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Funnel description" data-testid="input-funnel-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={funnelForm.control}
                          name="entryProductId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entry Product</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-entry-product">
                                    <SelectValue placeholder="Select entry product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products?.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={createFunnelMutation.isPending} data-testid="button-submit-funnel">
                          {createFunnelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Create Funnel
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {funnels && funnels.length > 0 ? (
                <div className="space-y-4">
                  {funnels.map((funnel) => (
                    <Card key={funnel.id} data-testid={`card-funnel-${funnel.id}`}>
                      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-funnel-name-${funnel.id}`}>
                            {funnel.name}
                          </CardTitle>
                          {funnel.description && (
                            <CardDescription>{funnel.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={funnel.isActive === 1 ? "default" : "secondary"} data-testid={`badge-funnel-status-${funnel.id}`}>
                            {funnel.isActive === 1 ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingFunnel(funnel)}
                            data-testid={`button-edit-funnel-${funnel.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteFunnelMutation.mutate(funnel.id)}
                            data-testid={`button-delete-funnel-${funnel.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {funnel.entryProductId && (
                            <p className="text-sm text-muted-foreground">
                              Entry Product: <span className="font-medium text-foreground">{getProductTitle(funnel.entryProductId)}</span>
                            </p>
                          )}

                          <div className="flex justify-between items-center gap-4 flex-wrap">
                            <h4 className="font-medium">Funnel Steps</h4>
                            <Dialog open={isCreateStepOpen && selectedFunnelId === funnel.id} onOpenChange={(open) => {
                              setIsCreateStepOpen(open);
                              if (open) setSelectedFunnelId(funnel.id);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedFunnelId(funnel.id)} data-testid={`button-add-step-${funnel.id}`}>
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Step
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Funnel Step</DialogTitle>
                                </DialogHeader>
                                <Form {...stepForm}>
                                  <form onSubmit={stepForm.handleSubmit((data) => createStepMutation.mutate({ funnelId: funnel.id, data }))} className="space-y-4">
                                    <FormField
                                      control={stepForm.control}
                                      name="stepType"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Step Type</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                              <SelectTrigger data-testid="select-step-type">
                                                <SelectValue placeholder="Select type" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="upsell">Upsell</SelectItem>
                                              <SelectItem value="downsell">Downsell</SelectItem>
                                              <SelectItem value="oto">One-Time Offer</SelectItem>
                                              <SelectItem value="order_bump">Order Bump</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={stepForm.control}
                                      name="offerProductId"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Offer Product</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                              <SelectTrigger data-testid="select-offer-product">
                                                <SelectValue placeholder="Select product" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {products?.map((product) => (
                                                <SelectItem key={product.id} value={product.id}>
                                                  {product.title}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={stepForm.control}
                                      name="priority"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Priority</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              {...field} 
                                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                              data-testid="input-step-priority" 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={stepForm.control}
                                      name="headline"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Headline</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Step headline" data-testid="input-step-headline" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={stepForm.control}
                                      name="ctaText"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>CTA Text</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Yes, I want this!" data-testid="input-step-cta" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button type="submit" disabled={createStepMutation.isPending} data-testid="button-submit-step">
                                      {createStepMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                      Add Step
                                    </Button>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {analytics?.find(a => a.funnel.id === funnel.id)?.steps && analytics.find(a => a.funnel.id === funnel.id)!.steps.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Priority</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {analytics.find(a => a.funnel.id === funnel.id)!.steps
                                  .sort((a, b) => a.priority - b.priority)
                                  .map((step) => (
                                  <TableRow key={step.id} data-testid={`row-step-${step.id}`}>
                                    <TableCell>
                                      <Badge variant="outline">{step.stepType}</Badge>
                                    </TableCell>
                                    <TableCell>{getProductTitle(step.offerProductId)}</TableCell>
                                    <TableCell>{step.priority}</TableCell>
                                    <TableCell>
                                      <Badge variant={step.isActive === 1 ? "default" : "secondary"} className="no-default-active-elevate">
                                        {step.isActive === 1 ? "Active" : "Inactive"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteStepMutation.mutate({ funnelId: funnel.id, stepId: step.id })}
                                        data-testid={`button-delete-step-${step.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-sm text-muted-foreground">No steps configured yet.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground" data-testid="text-no-funnels">No funnels created yet. Create your first funnel to get started.</p>
                  </CardContent>
                </Card>
              )}

              {editingFunnel && (
                <Dialog open={!!editingFunnel} onOpenChange={() => setEditingFunnel(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Funnel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          defaultValue={editingFunnel.name}
                          onChange={(e) => setEditingFunnel({ ...editingFunnel, name: e.target.value })}
                          data-testid="input-edit-funnel-name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          defaultValue={editingFunnel.description || ""}
                          onChange={(e) => setEditingFunnel({ ...editingFunnel, description: e.target.value })}
                          data-testid="input-edit-funnel-description"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingFunnel.isActive === 1}
                          onCheckedChange={(checked) => setEditingFunnel({ ...editingFunnel, isActive: checked ? 1 : 0 })}
                          data-testid="switch-edit-funnel-active"
                        />
                        <label className="text-sm font-medium">Active</label>
                      </div>
                      <Button
                        onClick={() => updateFunnelMutation.mutate({ id: editingFunnel.id, data: editingFunnel })}
                        disabled={updateFunnelMutation.isPending}
                        data-testid="button-update-funnel"
                      >
                        {updateFunnelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Funnel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            <TabsContent value="order-bumps" className="space-y-6">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Order Bumps</h2>
                <Dialog open={isCreateOrderBumpOpen} onOpenChange={setIsCreateOrderBumpOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-order-bump">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Order Bump
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Order Bump</DialogTitle>
                    </DialogHeader>
                    <Form {...orderBumpForm}>
                      <form onSubmit={orderBumpForm.handleSubmit((data) => createOrderBumpMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={orderBumpForm.control}
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Product</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-main-product">
                                    <SelectValue placeholder="Select main product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products?.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orderBumpForm.control}
                          name="bumpProductId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bump Product</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-bump-product">
                                    <SelectValue placeholder="Select bump product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products?.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orderBumpForm.control}
                          name="bumpPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bump Price (cents)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  placeholder="1999"
                                  data-testid="input-bump-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orderBumpForm.control}
                          name="headline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Headline</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Add this to your order!" data-testid="input-bump-headline" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orderBumpForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Bump description" data-testid="input-bump-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={createOrderBumpMutation.isPending} data-testid="button-submit-order-bump">
                          {createOrderBumpMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Create Order Bump
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {orderBumpsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : orderBumps && orderBumps.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Main Product</TableHead>
                      <TableHead>Bump Product</TableHead>
                      <TableHead>Bump Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderBumps.map((bump) => (
                      <TableRow key={bump.id} data-testid={`row-order-bump-${bump.id}`}>
                        <TableCell>{getProductTitle(bump.productId)}</TableCell>
                        <TableCell>{getProductTitle(bump.bumpProductId)}</TableCell>
                        <TableCell>${(bump.bumpPrice / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={bump.isActive === 1 ? "default" : "secondary"} className="no-default-active-elevate">
                            {bump.isActive === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteOrderBumpMutation.mutate(bump.id)}
                            data-testid={`button-delete-order-bump-${bump.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground" data-testid="text-no-order-bumps">No order bumps created yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-xl font-semibold">Funnel Analytics</h2>

              {analyticsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {summaryStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Funnels</CardTitle>
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-total-funnels">{summaryStats.totalFunnels}</div>
                          <p className="text-xs text-muted-foreground">{summaryStats.activeFunnels} active</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-total-sessions">{summaryStats.totalSessions}</div>
                          <p className="text-xs text-muted-foreground">across all funnels</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-total-revenue">
                            ${(summaryStats.totalRevenue / 100).toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">from funnel purchases</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-avg-completion">
                            {summaryStats.avgCompletionRate.toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground">funnel completion</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {chartData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Sessions by Funnel
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]" data-testid="chart-sessions">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sessions" fill="#a855f7" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Revenue by Funnel ($)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]" data-testid="chart-revenue">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {analytics && analytics.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Funnel Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Funnel</TableHead>
                              <TableHead>Entry Product</TableHead>
                              <TableHead className="text-right">Sessions</TableHead>
                              <TableHead className="text-right">Completed</TableHead>
                              <TableHead className="text-right">Completion Rate</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Avg Order</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.map((item) => (
                              <TableRow key={item.funnel.id} data-testid={`row-analytics-${item.funnel.id}`}>
                                <TableCell className="font-medium">{item.funnel.name}</TableCell>
                                <TableCell>{item.entryProduct?.title || "—"}</TableCell>
                                <TableCell className="text-right">{item.totalSessions}</TableCell>
                                <TableCell className="text-right">{item.completedSessions}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={item.completionRate >= 50 ? "default" : "secondary"} className="no-default-active-elevate">
                                    {item.completionRate.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">${(item.totalRevenue / 100).toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(item.avgOrderValue / 100).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {(!analytics || analytics.length === 0) && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground" data-testid="text-no-analytics">
                          No analytics data available yet. Create funnels and get some traffic to see analytics.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
