"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Product } from "@/lib/api"

interface ProductsTableProps {
  products: Product[]
  onDelete?: (id: string) => void
  onToggleActive?: (id: string) => void
}

type SortField = "name" | "updatedAt" | "createdAt"
type SortDirection = "asc" | "desc"

export function ProductsTable({ products, onDelete, onToggleActive }: ProductsTableProps) {
  const [sortField, setSortField] = useState<SortField>("updatedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-8 px-2 font-medium">
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <SortButton field="name">Product</SortButton>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <SortButton field="updatedAt">Last Updated</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="createdAt">Added</SortButton>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <Link href={`/products/${product._id}`}>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1">
                  <div className="w-10 h-10 bg-muted rounded overflow-hidden border flex-shrink-0">
                    {product.imageUrl ? (
                      <div className="w-full h-full relative bg-white flex items-center justify-center">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-0.5"
                          sizes="40px"
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
                    <div className="min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={product.isActive ? "default" : "outline"} className="text-xs">
                  {product.isActive ? "Active" : "Paused"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(product.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(product.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(product.url, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Amazon
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleActive?.(product._id)}>
                      {product.isActive ? "Pause Tracking" : "Resume Tracking"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(product._id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
