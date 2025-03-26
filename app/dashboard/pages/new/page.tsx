import { redirect } from "next/navigation"

export default function NewPagePage() {
  redirect("/dashboard/pages/new/edit")
  return null
}

