"use client"

import type React from "react"

import { FileText, FolderOpen, Home, ImageIcon, Layers, MessageSquare, NavigationIcon, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Projects",
      icon: FolderOpen,
      href: "/dashboard/projects",
      active: pathname === "/dashboard/projects",
    },
    {
      label: "Categories",
      icon: Layers,
      href: "/dashboard/categories",
      active: pathname === "/dashboard/categories",
    },
    {
      label: "Project Images",
      icon: ImageIcon,
      href: "/dashboard/project-images",
      active: pathname === "/dashboard/project-images",
    },
    {
      label: "Pages",
      icon: FileText,
      href: "/dashboard/pages",
      active: pathname === "/dashboard/pages",
    },
    {
      label: "Navigation",
      icon: NavigationIcon,
      href: "/dashboard/navigation",
      active: pathname === "/dashboard/navigation",
    },
    {
      label: "Contact Submissions",
      icon: MessageSquare,
      href: "/dashboard/contact-submissions",
      active: pathname === "/dashboard/contact-submissions",
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", route.active ? "bg-secondary" : "")}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

