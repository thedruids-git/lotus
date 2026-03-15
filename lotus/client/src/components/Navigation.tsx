import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { motion } from "framer-motion";

export function Navigation({ onOpenCart }: { onOpenCart: () => void }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-foreground/80'} ${className}`}>
        Restaurants
      </Link>
      <Link href="/grocery" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/grocery' ? 'text-primary' : 'text-foreground/80'} ${className}`}>
        Grocery
      </Link>
      {user && (
        <Link href="/orders" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/orders' ? 'text-primary' : 'text-foreground/80'} ${className}`}>
          My Orders
        </Link>
      )}
      {user?.isAdmin && (
        <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/admin' ? 'text-primary' : 'text-foreground/80'} ${className}`}>
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ff4500] via-[#ff0000] via-[#0000ff] to-[#add8e6] animate-pulse drop-shadow-[0_0_8px_rgba(255,69,0,0.5)]">
            Lotus<span>Delivery</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary hover:text-secondary-foreground"
            onClick={onOpenCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-background"
              >
                {totalItems}
              </motion.span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-3 rounded-full border border-border/50 hover:bg-secondary hover:border-secondary">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
                    {user.firstName || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:block">
              <Button asChild variant="default" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                <a href="/api/login">Login</a>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-10">
                <NavLinks className="text-lg py-2" />
                {!user && (
                  <Button asChild className="w-full rounded-full">
                    <a href="/api/login">Login</a>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
