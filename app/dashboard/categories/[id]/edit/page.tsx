"use client"

import type React from "react"

import { ArrowLeft, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { categoriesService } from "@/lib/api"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const isEditing = id !== "new"

  // Update the formData state to match the API requirements
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing) return

      setIsLoading(true)
      try {
        const response = await categoriesService.getById(id)
        const category = response.data
        setFormData({
          name: category.name,
          description: category.description,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch category data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, isEditing, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (isEditing) {
        await categoriesService.update(id, formData)
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        await categoriesService.create(formData)
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }
      router.push("/dashboard/categories")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update category" : "Failed to create category",
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
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Category" : "Create Category"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Category"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

