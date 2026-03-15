import { db } from "./db";
import { restaurants, menuItems, orders, orderItems, users, type Restaurant, type MenuItem, type CreateOrderRequest, type Order } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantWithMenu(id: number): Promise<(Restaurant & { menuItems: MenuItem[] }) | undefined>;
  createRestaurant(restaurant: any): Promise<Restaurant>;
  updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: number): Promise<boolean>;
  createMenuItem(item: any): Promise<MenuItem>;
  updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  createOrder(userId: string, order: CreateOrderRequest): Promise<Order>;
  getOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getUser(id: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantWithMenu(id: number): Promise<(Restaurant & { menuItems: MenuItem[] }) | undefined> {
    const restaurant = await this.getRestaurant(id);
    if (!restaurant) return undefined;
    const items = await db.select().from(menuItems).where(eq(menuItems.restaurantId, id));
    return { ...restaurant, menuItems: items };
  }

  async createRestaurant(insertRestaurant: any): Promise<Restaurant> {
    const [restaurant] = await db.insert(restaurants).values(insertRestaurant).returning();
    return restaurant;
  }

  async updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const { id: _, ...updateData } = data;
    const [updated] = await db.update(restaurants).set(updateData).where(eq(restaurants.id, id)).returning();
    return updated;
  }

  async deleteRestaurant(id: number): Promise<boolean> {
    await db.delete(menuItems).where(eq(menuItems.restaurantId, id));
    const result = await db.delete(restaurants).where(eq(restaurants.id, id)).returning();
    return result.length > 0;
  }

  async createMenuItem(insertItem: any): Promise<MenuItem> {
    const [item] = await db.insert(menuItems).values(insertItem).returning();
    return item;
  }

  async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const { id: _, ...updateData } = data;
    const [updated] = await db.update(menuItems).set(updateData).where(eq(menuItems.id, id)).returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return result.length > 0;
  }

  async createOrder(userId: string, request: CreateOrderRequest): Promise<Order> {
    let total = 0;
    const itemsWithPrice = [];

    for (const item of request.items) {
      const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, item.menuItemId));
      if (menuItem) {
        total += menuItem.price * item.quantity;
        itemsWithPrice.push({ ...item, priceAtTime: menuItem.price });
      }
    }

    const [order] = await db.insert(orders).values({
      userId,
      restaurantId: request.restaurantId,
      totalAmount: total,
      status: "pending"
    }).returning();

    for (const item of itemsWithPrice) {
      await db.insert(orderItems).values({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime
      });
    }

    return order;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

export const storage = new DatabaseStorage();
