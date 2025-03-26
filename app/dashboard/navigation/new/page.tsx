import { redirect } from "next/navigation"

export default function NewNavigationItemPage() {
  redirect("/dashboard/navigation/new/edit")
  return null
}

