import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Restaurant, MenuItem, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Store, UtensilsCrossed, ClipboardList, ShieldCheck } from "lucide-react";
import { useState } from "react";

type Tab = "restaurants" | "menus" | "orders";

function RestaurantForm({ restaurant, onSave, onCancel }: {
  restaurant?: Restaurant;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(restaurant?.name || "");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [imageUrl, setImageUrl] = useState(restaurant?.imageUrl || "");
  const [rating, setRating] = useState(String(restaurant?.rating || 0));
  const [type, setType] = useState(restaurant?.type || "restaurant");

  return (
    <div className="space-y-4">
      <Input data-testid="input-restaurant-name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input data-testid="input-restaurant-description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input data-testid="input-restaurant-address" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Input data-testid="input-restaurant-image" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Input data-testid="input-restaurant-rating" placeholder="Rating (0-5)" type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger data-testid="select-restaurant-type">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="restaurant">Restaurant</SelectItem>
          <SelectItem value="grocery">Grocery</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2 justify-end">
        <Button data-testid="button-cancel-restaurant" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button data-testid="button-save-restaurant" onClick={() => onSave({ name, description, address, imageUrl, rating: Number(rating), type })}>
          {restaurant ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function MenuItemForm({ menuItem, restaurantId, restaurants, onSave, onCancel }: {
  menuItem?: MenuItem;
  restaurantId?: number;
  restaurants: Restaurant[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(menuItem?.name || "");
  const [description, setDescription] = useState(menuItem?.description || "");
  const [price, setPrice] = useState(menuItem ? String(menuItem.price / 100) : "");
  const [imageUrl, setImageUrl] = useState(menuItem?.imageUrl || "");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(String(menuItem?.restaurantId || restaurantId || ""));

  return (
    <div className="space-y-4">
      <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
        <SelectTrigger data-testid="select-menu-restaurant">
          <SelectValue placeholder="Select Restaurant" />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((r) => (
            <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input data-testid="input-menu-name" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input data-testid="input-menu-description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input data-testid="input-menu-price" placeholder="Price (e.g. 9.99)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input data-testid="input-menu-image" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <Button data-testid="button-cancel-menu" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button data-testid="button-save-menu" onClick={() => onSave({
          restaurantId: Number(selectedRestaurantId),
          name,
          description,
          price: Math.round(Number(price) * 100),
          imageUrl,
        })}>
          {menuItem ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("restaurants");
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);

  const isAdminUser = !!user?.isAdmin;

  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
    enabled: isAdminUser,
  });

  const { data: adminOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAdminUser && activeTab === "orders",
  });

  const allMenuItems: (MenuItem & { restaurantName: string })[] = [];

  const { data: restaurantDetails } = useQuery<any[]>({
    queryKey: ["/api/restaurants", "all-details"],
    queryFn: async () => {
      const results = [];
      for (const r of restaurants) {
        const res = await fetch(`/api/restaurants/${r.id}`, { credentials: "include" });
        if (res.ok) results.push(await res.json());
      }
      return results;
    },
    enabled: isAdminUser && activeTab === "menus" && restaurants.length > 0,
  });

  if (restaurantDetails) {
    for (const rd of restaurantDetails) {
      for (const item of rd.menuItems || []) {
        allMenuItems.push({ ...item, restaurantName: rd.name });
      }
    }
  }

  const createRestaurant = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/restaurants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setShowRestaurantForm(false);
      toast({ title: "Restaurant created" });
    },
    onError: () => toast({ title: "Failed to create restaurant", variant: "destructive" }),
  });

  const updateRestaurant = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/admin/restaurants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setEditingRestaurant(null);
      toast({ title: "Restaurant updated" });
    },
    onError: () => toast({ title: "Failed to update restaurant", variant: "destructive" }),
  });

  const deleteRestaurant = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/restaurants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Restaurant deleted" });
    },
    onError: () => toast({ title: "Failed to delete restaurant", variant: "destructive" }),
  });

  const createMenuItem = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/menu-items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setShowMenuForm(false);
      toast({ title: "Menu item created" });
    },
    onError: () => toast({ title: "Failed to create menu item", variant: "destructive" }),
  });

  const updateMenuItem = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/admin/menu-items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setEditingMenuItem(null);
      toast({ title: "Menu item updated" });
    },
    onError: () => toast({ title: "Failed to update menu item", variant: "destructive" }),
  });

  const deleteMenuItem = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Menu item deleted" });
    },
    onError: () => toast({ title: "Failed to delete menu item", variant: "destructive" }),
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => toast({ title: "Failed to update order", variant: "destructive" }),
  });

  if (authLoading) {
    return <div className="container py-12"><div className="h-96 bg-muted animate-pulse rounded-2xl" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
        <Button asChild>
          <a href="/api/login">Login</a>
        </Button>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">You do not have admin privileges. Contact an administrator to get access.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "restaurants", label: "Restaurants", icon: Store },
    { id: "menus", label: "Menu Items", icon: UtensilsCrossed },
    { id: "orders", label: "Orders", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-foreground text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-white/70">Manage restaurants, menus, and orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b pb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "restaurants" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Restaurants & Stores</h2>
              <Dialog open={showRestaurantForm} onOpenChange={setShowRestaurantForm}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-restaurant" className="gap-2"><Plus className="w-4 h-4" /> Add Restaurant</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Restaurant</DialogTitle>
                  </DialogHeader>
                  <RestaurantForm
                    onSave={(data) => createRestaurant.mutate(data)}
                    onCancel={() => setShowRestaurantForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} data-testid={`card-restaurant-${restaurant.id}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                        <Badge variant="outline">{restaurant.type}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{restaurant.description}</p>
                      <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingRestaurant?.id === restaurant.id} onOpenChange={(open) => !open && setEditingRestaurant(null)}>
                        <DialogTrigger asChild>
                          <Button data-testid={`button-edit-restaurant-${restaurant.id}`} variant="outline" size="icon" onClick={() => setEditingRestaurant(restaurant)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Restaurant</DialogTitle>
                          </DialogHeader>
                          {editingRestaurant && (
                            <RestaurantForm
                              restaurant={editingRestaurant}
                              onSave={(data) => updateRestaurant.mutate({ id: editingRestaurant.id, data })}
                              onCancel={() => setEditingRestaurant(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        data-testid={`button-delete-restaurant-${restaurant.id}`}
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this restaurant and all its menu items?")) {
                            deleteRestaurant.mutate(restaurant.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menus" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Items</h2>
              <Dialog open={showMenuForm} onOpenChange={setShowMenuForm}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-menu-item" className="gap-2"><Plus className="w-4 h-4" /> Add Menu Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Menu Item</DialogTitle>
                  </DialogHeader>
                  <MenuItemForm
                    restaurants={restaurants}
                    onSave={(data) => createMenuItem.mutate(data)}
                    onCancel={() => setShowMenuForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {allMenuItems.map((item) => (
                <Card key={item.id} data-testid={`card-menu-item-${item.id}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{item.restaurantName}</Badge>
                        <span className="text-sm font-bold text-primary">${(item.price / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingMenuItem?.id === item.id} onOpenChange={(open) => !open && setEditingMenuItem(null)}>
                        <DialogTrigger asChild>
                          <Button data-testid={`button-edit-menu-${item.id}`} variant="outline" size="icon" onClick={() => setEditingMenuItem(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Menu Item</DialogTitle>
                          </DialogHeader>
                          {editingMenuItem && (
                            <MenuItemForm
                              menuItem={editingMenuItem}
                              restaurants={restaurants}
                              onSave={(data) => updateMenuItem.mutate({ id: editingMenuItem.id, data })}
                              onCancel={() => setEditingMenuItem(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        data-testid={`button-delete-menu-${item.id}`}
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this menu item?")) {
                            deleteMenuItem.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {allMenuItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No menu items found. Add restaurants first, then add menu items.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Orders</h2>
            <div className="grid gap-4">
              {adminOrders.map((order) => {
                const restaurant = restaurants.find((r) => r.id === order.restaurantId);
                return (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">Order #{order.id}</h3>
                            <Badge
                              variant={order.status === "delivered" ? "default" : "secondary"}
                              data-testid={`status-order-${order.id}`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {restaurant?.name || `Restaurant #${order.restaurantId}`}
                          </p>
                          <p className="text-sm font-bold text-primary mt-1">
                            ${(order.totalAmount / 100).toFixed(2)}
                          </p>
                          {order.createdAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderStatus.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger data-testid={`select-status-order-${order.id}`} className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="delivering">Delivering</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {adminOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
