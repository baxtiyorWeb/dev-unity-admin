import { redirect } from "next/navigation"

export default function NewCategoryPage() {
  redirect("/dashboard/categories/new/edit")
  return null
}

