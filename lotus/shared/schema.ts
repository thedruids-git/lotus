import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth Schema
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").default(0),
  type: text("type").notNull().default("restaurant"), // restaurant or grocery
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in cents
  imageUrl: text("image_url").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users.id (which is varchar)
  restaurantId: integer("restaurant_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, preparing, delivering, delivered
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: integer("price_at_time").notNull(),
});

// === RELATIONS ===

export const restaurantRelations = relations(restaurants, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// Request types
export type CreateOrderRequest = {
  restaurantId: number;
  items: { menuItemId: number; quantity: number }[];
};

// Response types
export type RestaurantWithMenu = Restaurant & { menuItems: MenuItem[] };
export type OrderWithItems = Order & { 
  restaurant: Restaurant;
  items: (OrderItem & { menuItem: MenuItem })[] 
};
