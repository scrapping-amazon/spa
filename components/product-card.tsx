"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ExternalLink, Trash2, Package, Percent, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Product } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: Product
  onDelete?: (id: string) => void
  onToggleActive?: (id: string) => void
}

// Utility function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Utility function to format date
const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date'
  
  const now = new Date()
  const diffInMilliseconds = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  
  // Handle future dates
  if (diffInMinutes < 0) {
    return date.toLocaleDateString()
  }
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

export function ProductCard({ product, onDelete, onToggleActive }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 bg-card border-border">
      <Link href={`/products/${product._id}`}>
        <CardContent className="px-4 py-3 cursor-pointer">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden border">
              {product.imageUrl ? (
                <div className="w-full h-full relative bg-white flex items-center justify-center">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.closest('.relative')
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center"><span class="text-muted-foreground text-xs">No Image</span></div>'
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">{product.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(product.amazonUrl, "_blank")}>
                    View on Amazon
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActive?.(product._id)}>
                    {product.isActive ? "Pause Tracking" : "Resume Tracking"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(product._id);
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Price and Discount Info for Amazon and Mercado Libre */}
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  Profit:
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {product.profit ? formatPrice(product.profit) : 'Unavailable'}
                </span>
              </div>
              {/* Amazon Price */}
              <div className="flex items-center gap-2">
                <Image src="/amazon-logo.svg" alt="Amazon Logo" width={20} height={20} />
                <span className="text-lg font-semibold text-foreground">
                  {product.lastPriceAmazon ? formatPrice(product.lastPriceAmazon) : 'Unavailable'}
                </span>
                {product.isOnOffer && product.discountPercentage && (
                  <Badge variant="secondary" className="text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                    <Percent className="h-3 w-3 mr-1" />
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Mercado Libre Price */}
              <div className="flex items-center gap-2">
                <Image src="/mercadolibre-logo.svg" alt="Mercado Libre Logo" width={20} height={20} />
                <span className="text-lg font-semibold text-foreground">
                  {product.lastPriceMercadoLibre ? formatPrice(product.lastPriceMercadoLibre) : 'Unavailable'}
                </span>
              </div>
              
            </div>

            {/* Stock and Quantity Info */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                {product.inStock ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {product.currentQuantity && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Qty: {product.currentQuantity}
                  </span>
                </div>
              )}
            </div>

            {/* Last Scraped */}
            <div className="text-xs text-muted-foreground">
              Last scraped: {product.lastScrappedAt ? formatRelativeTime(product.lastScrappedAt) : 'Never'}
            </div>
          </div>
        </div>
        </CardContent>
      </Link>
    </Card>
  )
}
