"use client"

import { Check, Eye, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { contactSubmissionsService } from "@/lib/api"

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export default function ContactSubmissionsPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [isDeleteDialogOpen])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const response = await contactSubmissionsService.getAll()
      setSubmissions(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contact submissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewClick = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setIsViewDialogOpen(true)


    if (!submission.is_read) {
      try {
        await contactSubmissionsService.markAsRead(submission.id)

        setSubmissions(submissions.map((s) => (s.id === submission.id ? { ...s, is_read: true } : s)))
      } catch (error) {
        console.error("Failed to mark as read:", error)
      }
    }
  }

  const handleDeleteClick = (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSubmission) return

    try {
      await contactSubmissionsService.delete(selectedSubmission.id)
      setSubmissions(submissions.filter((s) => s.id !== selectedSubmission.id))
      toast({
        title: "Success",
        description: "Contact submission deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact submission",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedSubmission(null)
    }
  }

  const markAsRead = async (submission: ContactSubmission) => {
    try {
      await contactSubmissionsService.markAsRead(submission.id)
      setSubmissions(submissions.map((s) => (s.id === submission.id ? { ...s, is_read: true } : s)))
      toast({
        title: "Success",
        description: "Marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as read",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Submissions</h1>
        <p className="text-muted-foreground">Manage messages from your website visitors</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading submissions...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No contact submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.results.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {submission.is_read ? <Badge variant="outline">Read</Badge> : <Badge>New</Badge>}
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{submission.message}</TableCell>
                    <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(submission)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {!submission.is_read && (
                          <Button variant="ghost" size="icon" onClick={() => markAsRead(submission)}>
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(submission)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">From</h3>
                <p>
                  {selectedSubmission.name} ({selectedSubmission.email})
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Date</h3>
                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">Message</h3>
                <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the contact submission from{" "}
              {selectedSubmission?.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

