// API service layer for Amazon product tracking

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface Product {
  _id: string
  name: string
  url: string
  imageUrl: string
  isActive: boolean
  lastScrappedAt: string
  currentPrice: number
  currentQuantity: number
  inStock: boolean
  isOnOffer: boolean
  discountPercentage: number
  originalPrice: number
  createdAt: string
  updatedAt: string
  __v: number
}

export interface ProductWithHistory {
  product: Product
  priceHistory: any[] // Currently empty array as per API docs
}

export interface CreateProductRequest {
  name: string
  url: string
  isActive?: boolean
}

export interface UpdateProductRequest {
  name?: string
  url?: string
  isActive?: boolean
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(
          Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || `HTTP ${response.status}`,
        )
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  // Get all products
  async getProducts(): Promise<Product[]> {
    const products = await this.request<Product[]>("/products")
    console.log("products", products)

    return products
  }

  // Get single product by ID
  async getProduct(id: string): Promise<ProductWithHistory> {
    return this.request<ProductWithHistory>(`/products/${id}`)
  }

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Update product
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()
