"use client"

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { navigationService } from "@/lib/api"

interface NavigationItem {
  id: string
  label: string
  url: string
  order: number
  is_active: boolean
}

export default function NavigationPage() {
  const { toast } = useToast()
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<NavigationItem | null>(null)

  useEffect(() => {
    fetchNavItems()
  }, [])

  const fetchNavItems = async () => {
    setIsLoading(true)
    try {
      const response = await navigationService.getAll()
      // Sort by order
      const sortedItems = response.data.results.sort((a: NavigationItem, b: NavigationItem) => a.order - b.order)
      setNavItems(sortedItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch navigation items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (item: NavigationItem) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await navigationService.delete(itemToDelete.id)
      setNavItems(navItems.filter((item) => item.id !== itemToDelete.id))
      toast({
        title: "Success",
        description: "Navigation item deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete navigation item",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const moveItem = async (item: NavigationItem, direction: "up" | "down") => {
    const currentIndex = navItems.findIndex((i) => i.id === item.id)
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === navItems.length - 1)) {
      return
    }

    const newItems = [...navItems]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const targetItem = newItems[targetIndex]

    // Swap orders
    const tempOrder = item.order
    newItems[currentIndex] = { ...item, order: targetItem.order }
    newItems[targetIndex] = { ...targetItem, order: tempOrder }

    // Sort by new order
    newItems.sort((a, b) => a.order - b.order)
    setNavItems(newItems)

    try {
      // Update both items in the API
      await Promise.all([
        navigationService.update(item.id, { ...item, order: targetItem.order }),
        navigationService.update(targetItem.id, { ...targetItem, order: tempOrder }),
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder navigation items",
        variant: "destructive",
      })
      // Revert changes on error
      fetchNavItems()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <p className="text-muted-foreground">Manage website navigation menu</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/navigation/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading navigation items...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {navItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No navigation items found. Create your first menu item.
                  </TableCell>
                </TableRow>
              ) : (
                navItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell>{item.url}</TableCell>
                    <TableCell>
                      {item.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveItem(item, "up")}
                          disabled={navItems.indexOf(item) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          <span className="sr-only">Move Up</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveItem(item, "down")}
                          disabled={navItems.indexOf(item) === navItems.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          <span className="sr-only">Move Down</span>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/navigation/${item.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the navigation item "{itemToDelete?.label}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

