"use client"

import type React from "react"

import { ArrowLeft, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { navigationService } from "@/lib/api"

interface NavigationResult {
  id: string
  label: string
  url: string
  order: number
  is_active: boolean
}
interface NavigationItem {
  results: NavigationResult[]
}

export default function EditNavigationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams<string | any>()
  const isEditing = id !== "new"

  const [formData, setFormData] = useState({
    label: "",
    url: "",
    order: 0,
    is_active: true,
  })
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch all navigation items for parent selection
        const navResponse = await navigationService.getAll()
        setNavItems(navResponse.data)

        // If editing, fetch item data
        if (isEditing) {
          const itemResponse = await navigationService.getById(id)
          const item = itemResponse.data
          setFormData({
            label: item.label,
            url: item.url,
            order: item.order,
            is_active: item.is_active,
          })
        } else {
          // For new items, set the order to be the next available
          const maxOrder = navResponse.data.reduce(
            (max: number, item: NavigationItem) => (item.results[0].order > max ? item.results[0].order : max),
            0,
          )
          setFormData((prev) => ({ ...prev, order: maxOrder + 1 }))
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, isEditing, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (isEditing) {
        await navigationService.update(id, formData)
        toast({
          title: "Success",
          description: "Navigation item updated successfully",
        })
      } else {
        await navigationService.create(formData)
        toast({
          title: "Success",
          description: "Navigation item created successfully",
        })
      }
      router.push("/dashboard/navigation")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update navigation item" : "Failed to create navigation item",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Navigation Item" : "Add Navigation Item"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Navigation Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">label</Label>
              <Input id="label" name="label" value={formData.label} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="/about or https://example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleNumberChange}
                min={0}
                required
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first in the menu</p>
            </div>


            <div className="flex items-center space-x-2">
              <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

