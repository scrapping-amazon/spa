"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ExternalLink, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calculator,
  Target,
  BarChart3,
  Zap
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Product } from "@/lib/api"
import Image from "next/image"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailProps {
  product: Product
  priceHistory: any[]
}

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'
  
  const now = new Date()
  const diffInMilliseconds = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  
  if (diffInMinutes < 0) return date.toLocaleDateString()
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

const calculateProfit = (buyPrice: number, sellPrice: number, fees = 0.15): { profit: number, margin: number, roi: number } => {
  const totalFees = sellPrice * fees
  const profit = sellPrice - buyPrice - totalFees
  const margin = (profit / sellPrice) * 100
  const roi = (profit / buyPrice) * 100
  
  return { profit, margin, roi }
}

const getPriceChangeIndicator = (current: number, previous: number) => {
  if (current > previous) {
    return { icon: TrendingUp, color: "text-red-500", change: "increased" }
  } else if (current < previous) {
    return { icon: TrendingDown, color: "text-green-500", change: "decreased" }
  }
  return { icon: null, color: "text-muted-foreground", change: "unchanged" }
}

export function ProductDetail({ product, priceHistory }: ProductDetailProps) {
  const { toast } = useToast()
  const [sellPrice, setSellPrice] = useState("")
  const [scrapingInterval, setScrapingInterval] = useState("60") // minutes
  const [priceAlert, setPriceAlert] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Calculate price analytics
  const sortedHistory = priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const previousPrice = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2]?.price : product.currentPrice
  const priceChange = getPriceChangeIndicator(product.currentPrice, previousPrice)
  
  const lowestPrice = Math.min(...sortedHistory.map(h => h.price), product.currentPrice)
  const highestPrice = Math.max(...sortedHistory.map(h => h.price), product.currentPrice)
  const averagePrice = sortedHistory.length > 0 
    ? sortedHistory.reduce((sum, h) => sum + h.price, 0) / sortedHistory.length 
    : product.currentPrice

  // Calculate profit metrics if sell price is provided
  const profitAnalysis = sellPrice ? calculateProfit(product.currentPrice, parseFloat(sellPrice)) : null

  // Chart configuration
  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
  }

  // Chart data preparation
  const chartData = sortedHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    price: item.price,
  }))

  const handleUpdateSettings = async () => {
    setIsUpdating(true)
    try {
      // Here you would update the scraping settings
      // await apiService.updateProductSettings(product._id, { interval: parseInt(scrapingInterval) })
      
      toast({
        title: "Settings updated",
        description: "Scraping configuration has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Overview */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden border">
                  {product.imageUrl ? (
                    <div className="w-full h-full relative bg-white flex items-center justify-center">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-3 line-clamp-2">{product.name}</h1>
                
                {/* Price and Status */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(product.currentPrice)}
                    </span>
                    {priceChange.icon && (
                      <priceChange.icon className={`h-5 w-5 ${priceChange.color}`} />
                    )}
                  </div>
                  
                  {product.isOnOffer && product.discountPercentage && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {/* Stock and Tracking Status */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {product.inStock ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {product.currentQuantity && (
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Qty: {product.currentQuantity}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => window.open(product.url, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Amazon
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Lowest</Label>
                <p className="text-lg font-semibold text-green-600">{formatPrice(lowestPrice)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Highest</Label>
                <p className="text-lg font-semibold text-red-600">{formatPrice(highestPrice)}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Average</Label>
                <p className="text-lg font-semibold">{formatPrice(averagePrice)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{formatRelativeTime(product.lastScrappedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profit">Profit Calculator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Price History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [formatPrice(value), "Price"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="var(--color-price)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No price history available yet</p>
                    <p className="text-sm">Data will appear after the next scraping cycle</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Calculator Tab */}
        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Profit Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Your Selling Price</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    placeholder="Enter your selling price"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Amazon Price (Buy Price)</Label>
                  <div className="text-2xl font-bold">{formatPrice(product.currentPrice)}</div>
                </div>
              </CardContent>
            </Card>

            {profitAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Profit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Gross Profit</Label>
                      <p className={`text-xl font-bold ${profitAnalysis.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPrice(profitAnalysis.profit)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Profit Margin</Label>
                      <p className={`text-xl font-bold ${profitAnalysis.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitAnalysis.margin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">ROI</Label>
                      <p className={`text-xl font-bold ${profitAnalysis.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitAnalysis.roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    * Calculated with 15% marketplace fees
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Scraping Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interval">Scraping Interval</Label>
                  <Select value={scrapingInterval} onValueChange={setScrapingInterval}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="180">Every 3 hours</SelectItem>
                      <SelectItem value="360">Every 6 hours</SelectItem>
                      <SelectItem value="720">Every 12 hours</SelectItem>
                      <SelectItem value="1440">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <div className="flex items-center gap-2">
                    {product.isActive ? (
                      <>
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">Paused</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={handleUpdateSettings} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priceAlert">Alert when price drops below</Label>
                <Input
                  id="priceAlert"
                  type="number"
                  placeholder="Enter target price"
                  value={priceAlert}
                  onChange={(e) => setPriceAlert(e.target.value)}
                />
              </div>
              
              <Button>Set Price Alert</Button>
              
              <div className="pt-4">
                <h4 className="font-medium mb-2">Business Recommendations</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Current price is {((product.currentPrice - lowestPrice) / lowestPrice * 100).toFixed(1)}% above lowest recorded</p>
                  <p>• Price volatility: {((highestPrice - lowestPrice) / averagePrice * 100).toFixed(1)}%</p>
                  {product.isOnOffer && <p className="text-green-600">• ✓ Product is currently on sale - good time to buy!</p>}
                  {!product.inStock && <p className="text-red-600">• ⚠ Out of stock - monitor for restocking</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 