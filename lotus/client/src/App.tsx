import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { CartDrawer } from "@/components/CartDrawer";
import { useState } from "react";

import Home from "@/pages/Home";
import Grocery from "@/pages/Grocery";
import RestaurantDetails from "@/pages/RestaurantDetails";
import Orders from "@/pages/Orders";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/grocery" component={Grocery} />
      <Route path="/restaurant/:id" component={RestaurantDetails} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
          <Navigation onOpenCart={() => setIsCartOpen(true)} />
          <Router />
          <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
