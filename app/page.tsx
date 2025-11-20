"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProductsDashboard } from "@/components/products-dashboard"
import { AddLinkForm } from "@/components/add-link-form"
import { ScrapingHistory } from "@/components/scraping-history"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("products")

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsDashboard />
      case "add-link":
        return <AddLinkForm />
      case "history":
        return <ScrapingHistory />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">{renderContent()}</main>
    </div>
  )
}
