import { z } from 'zod';
import { restaurants, menuItems, orders } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  restaurants: {
    list: {
      method: 'GET' as const,
      path: '/api/restaurants' as const,
      responses: { 200: z.array(z.custom<typeof restaurants.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        200: z.custom<typeof restaurants.$inferSelect & { menuItems: typeof menuItems.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        restaurantId: z.number(),
        items: z.array(z.object({ menuItemId: z.number(), quantity: z.number() })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.validation, // Unauthorized
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: { 200: z.array(z.custom<typeof orders.$inferSelect>()) },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
