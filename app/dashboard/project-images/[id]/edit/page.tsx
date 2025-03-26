"use client"

import type React from "react"

import { ArrowLeft, Save } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { projectImagesService, projectsService } from "@/lib/api"

interface Project {
  id: string;
  title: string;
}

export default function EditProjectImagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = useParams(); // URL'dan ID olish
  const isEditing = id !== "new";

  const [formData, setFormData] = useState({
    project_id: "",
    alt_text: "",
    image_url: "",
    is_main: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMain, setIsMain] = useState<boolean | any>(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Loyihalar ro'yxatini olish
        const projectsResponse = await projectsService.getAll();
        setProjects(projectsResponse.data?.results || []);

        // Agar tahrirlash rejimi bo'lsa, eski ma'lumotlarni yuklash
        if (isEditing) {
          const imageResponse = await projectImagesService.getById(id);
          const image = imageResponse.data;
          setFormData({
            project_id: image.project_id,
            alt_text: image.alt_text,
            image_url: image.image_url,
            is_main: image.is_main
          });
          setImagePreview(image.image_url);
          setIsMain(image.is_main);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, project_id: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Rasm preview yaratish
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!imageFile) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (!formData.project_id) {
        toast({
          title: "Error",
          description: "Project ID is required",
          variant: "destructive",
        });
        return;
      }

      const uploadData = new FormData();
      uploadData.append("image", imageFile); // Image file
      uploadData.append("is_main", isMain ? "true" : "false"); // Boolean qiymat
      uploadData.append("project", String(formData.project_id)); // ✅ "project" nomi bilan jo‘natish kerak!
      uploadData.append("alt_text", formData.alt_text); // Alt text qo‘shish

      if (isEditing) {
        await projectImagesService.update(id, uploadData);
        toast({ title: "Success", description: "Project image updated successfully" });
      } else {
        await projectImagesService.create(uploadData);
        toast({ title: "Success", description: "Project image created successfully" });
      }

      router.push("/dashboard/project-images");
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update project image" : "Failed to create project image",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Project Image" : "Add Project Image"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Image Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={formData.project_id} onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={formData.is_main ? "true" : "false"} onValueChange={setIsMain} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                name="alt_text"
                value={formData.alt_text}
                onChange={handleChange}
                placeholder="Descriptive text for the image"
                required
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" sizes="96px" />
                  </div>
                )}
                <div className="flex-1">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Image"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}