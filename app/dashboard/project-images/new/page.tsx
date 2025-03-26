import { redirect } from "next/navigation"

export default function NewProjectImagePage() {
  redirect("/dashboard/project-images/new/edit")
  return null
}

