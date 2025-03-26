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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { pagesService } from "@/lib/api"

export default function EditPagePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { slug } = useParams()
  const isEditing = slug !== "new"

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    is_published: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing) return

      setIsLoading(true)
      try {
        const response = await pagesService.getBySlug(slug)
        const page = response.data
        setFormData({
          title: page.title,
          slug: page.slug,
          content: page.content,
          meta_description: page.meta_description || "",
          is_published: page.is_published,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch page data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug, isEditing, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_published: checked }))
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      // Only auto-generate slug if we're creating a new page and slug hasn't been manually edited
      slug: !isEditing
        ? title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
        : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (isEditing) {
        await pagesService.update(slug, formData)
        toast({
          title: "Success",
          description: "Page updated successfully",
        })
      } else {
        await pagesService.create(formData)
        toast({
          title: "Success",
          description: "Page created successfully",
        })
      }
      router.push("/dashboard/pages")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update page" : "Failed to create page",
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
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Page" : "Create Page"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleTitleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">This will be used in the URL: /{formData.slug}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_published" checked={formData.is_published} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="is_published">Publish page</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Page"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

