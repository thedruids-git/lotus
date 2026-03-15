import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Package, Calendar, MapPin, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Orders() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();

  if (isAuthLoading || isOrdersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold font-display mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your order history.</p>
        <Button asChild size="lg">
          <a href="/api/login">Log In</a>
        </Button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold font-display text-foreground mb-2">No past orders</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          You haven't placed any orders yet. When you do, they will appear here.
        </p>
        <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
          <Link href="/">Find Food</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">Track and re-order your favorites</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-border/60 hover:border-border transition-colors">
            <CardHeader className="bg-secondary/20 pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-lg bg-background border flex items-center justify-center shrink-0">
                     <img 
                      src={order.restaurant.imageUrl} 
                      alt={order.restaurant.name}
                      className="h-full w-full object-cover rounded-lg opacity-80"
                     />
                   </div>
                   <div>
                     <CardTitle className="text-lg font-bold">{order.restaurant.name}</CardTitle>
                     <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                       <Calendar className="w-3.5 h-3.5 mr-1.5" />
                       {order.createdAt && format(new Date(order.createdAt), "PPP 'at' p")}
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <Badge variant={order.status === 'delivered' ? 'outline' : 'default'} className={`capitalize ${order.status !== 'delivered' && 'bg-primary text-primary-foreground'}`}>
                     {order.status}
                   </Badge>
                   <span className="font-bold text-lg">${(order.totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <span className="bg-secondary text-secondary-foreground font-bold text-xs h-5 w-5 flex items-center justify-center rounded mr-3">
                          {item.quantity}x
                        </span>
                        <span className="text-foreground/90">{item.menuItem.name}</span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        ${(item.priceAtTime / 100).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Separator className="bg-border/50" />
                
                <div className="flex justify-between items-center pt-2">
                   <Button variant="outline" size="sm" className="text-xs h-8 gap-2">
                     <Receipt className="w-3.5 h-3.5" />
                     View Receipt
                   </Button>
                   <Button size="sm" className="gap-2 rounded-full shadow-sm hover:shadow-md transition-all">
                     Re-order
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
