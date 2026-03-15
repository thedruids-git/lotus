import { Link } from "wouter";
import { Star, Clock, MapPin } from "lucide-react";
import { type Restaurant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <a className="block h-full group">
        <Card className="h-full overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group-hover:-translate-y-1">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {/* Descriptive Alt Text for Unsplash Image */}
            {/* restaurant food dish plated beautifully */}
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/95 text-foreground backdrop-blur-sm shadow-sm border-none font-bold px-2.5 py-1">
                <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                25-35 min
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {(restaurant.rating || 0) / 10}
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
              {restaurant.description}
            </p>
            
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary/60" />
              {restaurant.address}
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
