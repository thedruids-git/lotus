import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, restaurantName, updateQuantity, removeItem, clearCart, total, restaurantId } = useCart();
  const { user } = useAuth();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }

    if (!restaurantId || items.length === 0) return;

    createOrder(
      {
        restaurantId,
        items: items.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
      },
      {
        onSuccess: () => {
          clearCart();
          onOpenChange(false);
          setLocation("/orders");
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-background/95 backdrop-blur-xl border-l-primary/10">
        <SheetHeader className="px-6 py-5 border-b bg-background/50">
          <SheetTitle className="font-display text-2xl">Your Order</SheetTitle>
          {restaurantName && (
            <p className="text-sm text-muted-foreground font-medium">
              From <span className="text-primary">{restaurantName}</span>
            </p>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Add items from a restaurant to start your order.
              </p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full mt-4">
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm truncate pr-2">{item.name}</h4>
                        <span className="font-semibold text-sm">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        ${(item.price / 100).toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                          >
                            <Minus className="w-3 h-3 text-secondary-foreground" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                          >
                            <Plus className="w-3 h-3 text-secondary-foreground" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 bg-secondary/30 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between font-display font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${((total + 299) / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full rounded-xl shadow-lg shadow-primary/25 text-base font-semibold h-12"
                onClick={handleCheckout}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  You'll be asked to login to complete your order
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
