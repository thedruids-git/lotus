import { Plus } from "lucide-react";
import { type MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: () => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <Card className="flex gap-4 p-4 border-border/50 hover:border-border hover:shadow-md transition-all duration-200 group">
      {/* Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-muted relative">
        {/* food menu item close up */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-display font-bold text-base sm:text-lg text-foreground truncate pr-2">
              {item.name}
            </h4>
            <span className="font-bold text-primary whitespace-nowrap">
              ${(item.price / 100).toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
            className="rounded-full shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
