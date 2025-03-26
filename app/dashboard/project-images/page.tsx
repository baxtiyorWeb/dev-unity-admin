"use client"

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
import { projectImagesService, projectsService } from "@/lib/api"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ProjectImage {
  id: number;
  project: number;
  image: string;
  is_main: boolean;
  created_at: string;
  project_title?: string;
}

export default function ProjectImagesPage() {
  const { toast } = useToast()
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<ProjectImage | null>(null)
  console.log(projectImages);

  useEffect(() => {
    fetchProjectImages()
  }, [])

  const fetchProjectImages = async () => {
    setIsLoading(true)
    try {
      const [imagesResponse, projectsResponse] = await Promise.all([
        projectImagesService.getAll(),
        projectsService.getAll(),
      ])

      const projects = projectsResponse.data.reduce((acc: Record<number, string>, project: any) => {
        acc[project.id] = project.title
        return acc
      }, {})

      const images = imagesResponse.data.results.map((image: ProjectImage) => ({
        ...image,
        project_title: projects[image.project] || "Unknown Project",
      }))

      setProjectImages(images)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (image: ProjectImage) => {
    setImageToDelete(image)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!imageToDelete) return

    try {
      await projectImagesService.delete(imageToDelete.id)
      setProjectImages(projectImages.filter((img) => img.id !== imageToDelete.id))
      toast({
        title: "Success",
        description: "Project image deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project image",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setImageToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Images</h1>
          <p className="text-muted-foreground">Manage images for your projects</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/project-images/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading images...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Is Main</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No project images found. Add your first image.
                  </TableCell>
                </TableRow>
              ) : (
                projectImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src={image.image || "/placeholder.svg"}
                          alt={image.project_title || "Project Image"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{image.project_title}</TableCell>
                    <TableCell>{image.is_main ? "True" : "False"}</TableCell>
                    <TableCell>{new Date(image.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/project-images/${image.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/project-images/${image.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(image)}>
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
              This action cannot be undone. This will permanently delete the selected image.
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
