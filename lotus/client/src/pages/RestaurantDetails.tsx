import { useRoute } from "wouter";
import { useRestaurant } from "@/hooks/use-restaurants";
import { useCart } from "@/hooks/use-cart";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ArrowLeft, Info, Utensils } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function RestaurantDetails() {
  const [, params] = useRoute("/restaurant/:id");
  const id = parseInt(params?.id || "0");
  const { data: restaurant, isLoading } = useRestaurant(id);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-2xl w-full" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Restaurant not found</h2>
        <Button asChild className="mt-4">
          <Link href="/">Back to Restaurants</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = (item: any) => {
    addItem(item, restaurant.id, restaurant.name);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
      duration: 2000,
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner Image */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
         {/* Restaurant interior atmosphere warm lighting */}
         <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shadow-lg hover:scale-105 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Header */}
      <div className="container px-4 -mt-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-2">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center text-foreground font-medium">
                  <Star className="w-4 h-4 text-orange-500 fill-orange-500 mr-1" />
                  {(restaurant.rating || 0) / 10} (500+ ratings)
                </span>
                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.address}
                </span>
                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  25-35 min
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full">
                <Info className="w-4 h-4 mr-2" />
                More Info
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Menu Section */}
      <div className="container px-4 mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Utensils className="h-5 w-5" />
          </div>
          <h2 className="font-display font-bold text-2xl">Full Menu</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurant.menuItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <MenuItemCard
                item={item}
                onAdd={() => handleAddToCart(item)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
