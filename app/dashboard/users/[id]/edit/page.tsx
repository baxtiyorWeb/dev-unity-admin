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

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const isEditing = id !== "new"

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    is_active: true,
    is_staff: false,
    is_superuser: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing) return

      setIsLoading(true)
      try {
        // In a real implementation, you would fetch user data
        // const response = await authService.getUserById(id)
        // const user = response.data
        // setFormData({
        //   username: user.username,
        //   email: user.email,
        //   password: "",
        //   confirm_password: "",
        //   is_active: user.is_active,
        //   is_staff: user.is_staff,
        //   is_superuser: user.is_superuser,
        // })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      if (isEditing) {
        // In a real implementation, you would update the user
        // await authService.updateUser(id, formData)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        // In a real implementation, you would create the user
        // await authService.createUser(formData)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }
      router.push("/dashboard/users")
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update user" : "Failed to create user",
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
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit User" : "Create User"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEditing ? "New Password (leave blank to keep current)" : "Password"}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required={!isEditing}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleCheckboxChange("is_active", !!checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_staff"
                  checked={formData.is_staff}
                  onCheckedChange={(checked) => handleCheckboxChange("is_staff", !!checked)}
                />
                <Label htmlFor="is_staff">Staff</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_superuser"
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) => handleCheckboxChange("is_superuser", !!checked)}
                />
                <Label htmlFor="is_superuser">Superuser</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save User"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

