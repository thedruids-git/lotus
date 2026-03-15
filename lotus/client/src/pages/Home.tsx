import { useRestaurants } from "@/hooks/use-restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ChefHat, Timer, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: restaurants, isLoading, error } = useRestaurants();
  const [search, setSearch] = useState("");

  const filteredRestaurants = restaurants?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-12 space-y-8">
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <ChefHat className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-foreground">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          We couldn't load the restaurants. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground text-white py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
           {/* Restaurant outside patio background */}
           <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
            alt="Restaurant outside patio"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now delivering to your area
            </div>
            
            <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 tracking-tight">
              Craving something <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff0000] via-[#0000ff] to-[#add8e6] drop-shadow-[0_0_15px_rgba(0,191,255,0.4)]">extraordinary?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-xl mb-10 leading-relaxed font-light">
              Order from the best local restaurants with easy, on-demand delivery. 
              Fresh food, delivered fast to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Enter your delivery address" 
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-primary transition-all"
                />
              </div>
              <Button size="lg" className="h-12 px-8 rounded-xl font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                Find Food
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-12 relative z-20">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Timer, title: "Fast Delivery", desc: "Average delivery time of 30 mins" },
            { icon: ChefHat, title: "Expert Chefs", desc: "Food from top-rated restaurants" },
            { icon: TrendingUp, title: "Live Tracking", desc: "Track your order in real-time" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.4 }}
              className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 flex items-center gap-4 hover:shadow-xl transition-shadow"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold font-display text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">Nearby Restaurants</h2>
            <p className="text-muted-foreground mt-1">Discover the best food in town</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search cuisines or restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-white shadow-sm border-border/60 rounded-xl focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filteredRestaurants.map((restaurant, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <h3 className="text-lg font-bold text-muted-foreground">No restaurants found</h3>
            <p className="text-muted-foreground/80">Try searching for something else</p>
          </div>
        )}
      </main>
    </div>
  );
}
