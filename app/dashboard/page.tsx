"use client"

import { BarChart3, FileText, FolderOpen, Layers, MessageSquare, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService, categoriesService, contactSubmissionsService, pagesService, projectsService } from "@/lib/api"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    categories: 0,
    pages: 0,
    contactSubmissions: 0,
    users: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, categories, pages, contactSubmissions, users] = await Promise.all([
          projectsService.getAll(),
          categoriesService.getAll(),
          pagesService.getAll(),
          contactSubmissionsService.getAll(),
          authService.getUsers(),
        ])

        setStats({
          projects: projects.data.length,
          categories: categories.data.length,
          pages: pages.data.length,
          contactSubmissions: contactSubmissions.data.length,
          users: users.data.length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      description: "Projects in the database",
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      title: "Categories",
      value: stats.categories,
      description: "Project categories",
      icon: Layers,
      color: "text-green-500",
    },
    {
      title: "Pages",
      value: stats.pages,
      description: "Content pages",
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Contact Submissions",
      value: stats.contactSubmissions,
      description: "Messages from visitors",
      icon: MessageSquare,
      color: "text-yellow-500",
    },
    {
      title: "Users",
      value: stats.users,
      description: "Admin users",
      icon: Users,
      color: "text-red-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your website content and statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading activity...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New project added</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-green-100">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New contact submission</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-purple-100">
                    <FileText className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Page updated</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Website Traffic</CardTitle>
            <CardDescription>Visitor statistics for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

