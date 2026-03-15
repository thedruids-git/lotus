import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// List all restaurants
export function useRestaurants() {
  return useQuery({
    queryKey: [api.restaurants.list.path],
    queryFn: async () => {
      const res = await fetch(api.restaurants.list.path);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return api.restaurants.list.responses[200].parse(await res.json());
    },
  });
}

// Get single restaurant with menu
export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch restaurant details");
      
      return api.restaurants.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
