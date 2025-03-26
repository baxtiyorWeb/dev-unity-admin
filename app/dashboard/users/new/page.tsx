import { redirect } from "next/navigation"

export default function NewUserPage() {
  redirect("/dashboard/users/new/edit")
  return null
}

