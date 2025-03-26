import { redirect } from "next/navigation"

export default function NewContactSubmissionPage() {
  redirect("/dashboard/contact-submissions/new/edit")
  return null
}

