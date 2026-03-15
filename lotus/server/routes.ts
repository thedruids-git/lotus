import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertRestaurantSchema, insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

async function isAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = req.user.claims.sub;
  const user = await storage.getUser(userId);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.restaurants.list.path, async (req, res) => {
    const restaurants = await storage.getRestaurants();
    res.json(restaurants);
  });

  app.get(api.restaurants.get.path, async (req, res) => {
    const restaurant = await storage.getRestaurantWithMenu(Number(req.params.id));
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  app.post(api.orders.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user!.claims.sub;
      const order = await storage.createOrder(userId, input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.orders.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user!.claims.sub;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  // === ADMIN ROUTES ===

  app.post("/api/admin/restaurants", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(data);
      res.status(201).json(restaurant);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.put("/api/admin/restaurants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = insertRestaurantSchema.partial().parse(req.body);
      const updated = await storage.updateRestaurant(Number(req.params.id), data);
      if (!updated) return res.status(404).json({ message: "Restaurant not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });

  app.delete("/api/admin/restaurants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    const deleted = await storage.deleteRestaurant(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ success: true });
  });

  app.post("/api/admin/menu-items", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = insertMenuItemSchema.partial().parse(req.body);
      const updated = await storage.updateMenuItem(Number(req.params.id), data);
      if (!updated) return res.status(404).json({ message: "Menu item not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    const deleted = await storage.deleteMenuItem(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Menu item not found" });
    res.json({ success: true });
  });

  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAuthenticated, isAdmin, async (req: any, res) => {
    const statusSchema = z.object({ status: z.enum(["pending", "preparing", "delivering", "delivered"]) });
    try {
      const { status } = statusSchema.parse(req.body);
      const updated = await storage.updateOrderStatus(Number(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getRestaurants();
  if (existing.length === 0) {
    const r1 = await storage.createRestaurant({
      name: "Lotus Garden",
      description: "Authentic Asian Flavors",
      address: "123 Main St",
      imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
      rating: 4,
      type: "restaurant"
    });
    await storage.createMenuItem({ restaurantId: r1.id, name: "Lotus Pad Thai", description: "Signature noodles", price: 1499, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" });
    
    const r2 = await storage.createRestaurant({
      name: "Lotus Bistro",
      description: "Modern Fusion Cuisine",
      address: "456 Oak Ave",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
      rating: 5,
      type: "restaurant"
    });
    await storage.createMenuItem({ restaurantId: r2.id, name: "Lotus Dumplings", description: "Classic steamed dumplings", price: 899, imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80" });

    const g1 = await storage.createRestaurant({
      name: "Lotus Fresh Market",
      description: "Organic Groceries & Produce",
      address: "789 Maple Rd",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      rating: 5,
      type: "grocery"
    });
    await storage.createMenuItem({ restaurantId: g1.id, name: "Organic Bananas", description: "Fresh bundle of 5", price: 399, imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80" });
    await storage.createMenuItem({ restaurantId: g1.id, name: "Whole Milk", description: "1 Gallon", price: 450, imageUrl: "https://images.unsplash.com/photo-1550583724-125581db355d?w=800&q=80" });
    await storage.createMenuItem({ restaurantId: g1.id, name: "Farm Fresh Eggs", description: "One dozen large", price: 599, imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&q=80" });
  }
}
