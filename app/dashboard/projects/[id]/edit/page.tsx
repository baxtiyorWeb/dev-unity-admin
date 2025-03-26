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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { categoriesService, projectsService } from "@/lib/api"

interface Category {
  id: string
  name: string
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const isEditing = id !== "new"

  // Update the formData state to match the API requirements
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    client: "",
    date: new Date().toISOString().split("T")[0], // Default to today in YYYY-MM-DD format
    featured: false,
    category: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch categories
        const categoriesResponse = await categoriesService.getAll()
        setCategories(categoriesResponse.data)

        // If editing, fetch project data
        if (isEditing) {
          const projectResponse = await projectsService.getById(id)
          const project = projectResponse.data
          setFormData({
            title: project.title,
            description: project.description,
            content: project.content,
            client: project.client || "",
            date: project.date || new Date().toISOString().split("T")[0],
            featured: project.featured,
            category: project.category.toString() || "",
          })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  // Update the handleSelectChange function to set category
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  // Update the handleSubmit function to prepare the data correctly
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Create a copy of the data with the correct field names
      const apiData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        client: formData.client,
        date: formData.date,
        featured: formData.featured,
        category: Number.parseInt(formData.category, 10) || 0,
      }

      if (isEditing) {
        await projectsService.update(id, apiData)
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
      } else {
        await projectsService.create(apiData)
        toast({
          title: "Success",
          description: "Project created successfully",
        })
      }
      router.push("/dashboard/projects")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update project" : "Failed to create project",
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
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Project" : "Create Project"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            {/* Add client and date fields to the form */}
            {/* Inside the CardContent, after the description field: */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" name="client" value={formData.client} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.results?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="featured" checked={formData.featured} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="featured">Featured project</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

