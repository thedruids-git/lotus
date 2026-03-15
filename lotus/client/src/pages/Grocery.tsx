import { useRestaurants } from "@/hooks/use-restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBasket, Truck, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Grocery() {
  const { data: restaurants, isLoading, error } = useRestaurants();
  const [search, setSearch] = useState("");

  const groceryStores = restaurants?.filter((r) => r.type === "grocery");
  
  const filteredStores = groceryStores?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-12 space-y-8">
        <div className="h-64 w-full bg-muted animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-primary/5 py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-4 text-foreground">
              Fresh Groceries <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff0000] via-[#0000ff] to-[#add8e6] drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]">Delivered</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Shop from your favorite local grocery stores and get everything delivered to your doorstep.
            </p>
            
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search grocery stores..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-white rounded-xl shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Clock, title: "Same-Day Delivery", desc: "Freshness guaranteed" },
            { icon: ShoppingBasket, title: "Wide Selection", desc: "Thousands of items" },
            { icon: ShieldCheck, title: "Quality Checked", desc: "Hand-picked items" },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold font-display mb-8">Available Stores</h2>
        
        {filteredStores && filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <RestaurantCard restaurant={store} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <h3 className="text-lg font-bold text-muted-foreground">No grocery stores found</h3>
            <p className="text-muted-foreground/80">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
}
