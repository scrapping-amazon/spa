"use client"

import useSWR from "swr"
import { apiService, type Product } from "@/lib/api"

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>("/products", () => apiService.getProducts(), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProduct(id: string | null) {
  const { data, error, isLoading } = useSWR(id ? `/products/${id}` : null, () =>
    id ? apiService.getProduct(id) : null,
  )

  return {
    product: data?.product,
    priceHistory: data?.priceHistory || [],
    isLoading,
    isError: error,
  }
}
