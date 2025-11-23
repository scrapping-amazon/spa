"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  url: string
  mercadoLibreUrl: string
  isActive: boolean
}

interface FormErrors {
  name?: string
  url?: string
  mercadoLibreUrl?: string
  general?: string
}

export function AddLinkForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    url: "",
    mercadoLibreUrl: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters"
    }

    // Validate URL
    if (!formData.url.trim()) {
      newErrors.url = "Amazon URL is required"
    } else {
      try {
        const url = new URL(formData.url)
        if (!url.hostname.includes("amazon")) {
          newErrors.url = "Please enter a valid Amazon product URL"
        }
      } catch {
        newErrors.url = "Please enter a valid URL"
      }
    }

    // Validate Mercado Libre URL
    if (!formData.mercadoLibreUrl.trim()) {
      newErrors.mercadoLibreUrl = "Mercado Libre URL is required"
    } else {
      try {
        const mlUrl = new URL(formData.mercadoLibreUrl)
        if (!mlUrl.hostname.includes("mercadolibre")) {
          newErrors.mercadoLibreUrl = "Please enter a valid Mercado Libre product URL"
        }
      } catch {
        newErrors.mercadoLibreUrl = "Please enter a valid URL"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await apiService.createProduct({
        name: formData.name.trim(),
        amazonUrl: formData.url.trim(),
        mercadoLibreUrl: formData.mercadoLibreUrl.trim(),
        isActive: formData.isActive,
      })

      setSubmitStatus("success")
      // Reset form on success
      setFormData({ name: "", url: "", mercadoLibreUrl: "", isActive: true })
      setErrors({})

      toast({
        title: "Product added successfully!",
        description: "Your product is now being tracked for price changes.",
      })
    } catch (error: any) {
      setSubmitStatus("error")
      setErrors({ general: error.message || "Failed to add product. Please try again." })

      toast({
        title: "Error adding product",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear general error
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }
    // Reset submit status
    if (submitStatus !== "idle") {
      setSubmitStatus("idle")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Add New Product</h1>
        <p className="text-muted-foreground">Start tracking a new Amazon product by adding its URL</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Product Information
            </CardTitle>
            <CardDescription>Enter the Amazon product details to start price tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., iPhone 15 Pro Max 256GB"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-destructive focus:border-destructive" : ""}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Amazon URL */}
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  Amazon Product URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://amazon.com/dp/..."
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  className={errors.url ? "border-destructive focus:border-destructive" : ""}
                  disabled={isSubmitting}
                />
                {errors.url && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.url}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Copy the product URL from Amazon and paste it here</p>
              </div>

              {/* Mercado Libre URL */}
              <div className="space-y-2">
                <Label htmlFor="mercadoLibreUrl" className="text-sm font-medium">
                  Mercado Libre Product URL *
                </Label>
                <Input
                  id="mercadoLibreUrl"
                  type="url"
                  placeholder="https://mercadolibre.com/dp/..."
                  value={formData.mercadoLibreUrl}
                  onChange={(e) => handleInputChange("mercadoLibreUrl", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.mercadoLibreUrl && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mercadoLibreUrl}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  If you want to track the same product on Mercado Libre, enter its URL here.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Start Tracking Immediately
                  </Label>
                  <p className="text-xs text-muted-foreground">Begin monitoring price changes right away</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  disabled={isSubmitting}
                />
              </div>

              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {submitStatus === "success" && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Product added successfully! It will appear in your dashboard shortly.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:px-8">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({ name: "", url: "", mercadoLibreUrl: "", isActive: true })
                    setErrors({})
                    setSubmitStatus("idle")
                  }}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">How to find Amazon product URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Step 1: Go to Amazon</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to Amazon and search for the product you want to track
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Step 2: Open the product page</h4>
              <p className="text-sm text-muted-foreground">Click on the product to open its detailed page</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Step 3: Copy the URL</h4>
              <p className="text-sm text-muted-foreground">
                Copy the URL from your browser's address bar and paste it above
              </p>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Example URL:</strong> https://amazon.com/dp/B0CHX1W5Y9
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
