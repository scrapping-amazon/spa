"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, RefreshCw, Calendar, TrendingUp, AlertTriangle, Activity } from "lucide-react"

interface ScrapingJob {
  id: string
  productId: string
  productName: string
  status: "success" | "failed" | "in-progress"
  startTime: string
  endTime?: string
  duration?: number
  priceFound?: number
  oldPrice?: number
  availability?: "in-stock" | "out-of-stock"
  errorMessage?: string
  retryCount?: number
}

// Mock data for scraping history
const mockScrapingJobs: ScrapingJob[] = [
  {
    id: "job-001",
    productId: "1",
    productName: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
    status: "success",
    startTime: "2024-01-20T14:22:00.000Z",
    endTime: "2024-01-20T14:22:15.000Z",
    duration: 15,
    priceFound: 1199.99,
    oldPrice: 1299.99,
    availability: "in-stock",
  },
  {
    id: "job-002",
    productId: "2",
    productName: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    status: "in-progress",
    startTime: "2024-01-20T16:10:00.000Z",
  },
  {
    id: "job-003",
    productId: "3",
    productName: "MacBook Air 13-inch M3 Chip 8GB RAM 256GB SSD",
    status: "failed",
    startTime: "2024-01-20T12:45:00.000Z",
    endTime: "2024-01-20T12:45:30.000Z",
    duration: 30,
    errorMessage: "Product page not accessible - 404 error",
    retryCount: 2,
  },
  {
    id: "job-004",
    productId: "4",
    productName: "Amazon Echo Dot (5th Gen) Smart Speaker with Alexa",
    status: "success",
    startTime: "2024-01-20T11:30:00.000Z",
    endTime: "2024-01-20T11:30:12.000Z",
    duration: 12,
    priceFound: 29.99,
    oldPrice: 49.99,
    availability: "in-stock",
  },
  {
    id: "job-005",
    productId: "1",
    productName: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
    status: "success",
    startTime: "2024-01-20T08:15:00.000Z",
    endTime: "2024-01-20T08:15:18.000Z",
    duration: 18,
    priceFound: 1199.99,
    availability: "in-stock",
  },
  {
    id: "job-006",
    productId: "2",
    productName: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    status: "failed",
    startTime: "2024-01-19T20:00:00.000Z",
    endTime: "2024-01-19T20:01:00.000Z",
    duration: 60,
    errorMessage: "Rate limited by Amazon - too many requests",
    retryCount: 1,
  },
]

export function ScrapingHistory() {
  const [jobs] = useState(mockScrapingJobs)
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "in-progress">("all")

  const filteredJobs = jobs.filter((job) => statusFilter === "all" || job.status === statusFilter)

  const stats = {
    total: jobs.length,
    success: jobs.filter((j) => j.status === "success").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    inProgress: jobs.filter((j) => j.status === "in-progress").length,
  }

  const getStatusIcon = (status: ScrapingJob["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "in-progress":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: ScrapingJob["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Success
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            In Progress
          </Badge>
        )
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    return `${seconds}s`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Scraping History</h1>
        <p className="text-muted-foreground">Monitor the status and history of your product scraping jobs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.success}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Jobs Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Scraping Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price Found</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium text-sm line-clamp-2">{job.productName}</p>
                      <p className="text-xs text-muted-foreground">ID: {job.productId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatTime(job.startTime)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDuration(job.duration)}</span>
                  </TableCell>
                  <TableCell>
                    {job.priceFound ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${job.priceFound.toFixed(2)}</span>
                        {job.oldPrice && job.oldPrice > job.priceFound && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">
                              -{Math.round(((job.oldPrice - job.priceFound) / job.oldPrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.status === "failed" && job.errorMessage && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-xs max-w-xs truncate" title={job.errorMessage}>
                          {job.errorMessage}
                        </span>
                      </div>
                    )}
                    {job.status === "success" && job.availability && (
                      <Badge variant={job.availability === "in-stock" ? "default" : "secondary"} className="text-xs">
                        {job.availability === "in-stock" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    )}
                    {job.retryCount && job.retryCount > 0 && (
                      <span className="text-xs text-muted-foreground">Retries: {job.retryCount}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No scraping jobs found</h3>
          <p className="text-muted-foreground">
            {statusFilter !== "all"
              ? `No jobs with status "${statusFilter}" found`
              : "Scraping jobs will appear here once you start tracking products"}
          </p>
        </div>
      )}
    </div>
  )
}
