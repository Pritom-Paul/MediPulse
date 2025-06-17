"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, Filter, Download, Upload } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const navigate = useNavigate()

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("http://localhost:5000/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }

      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.tags && patient.tags.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle delete patient
  const handleDeletePatient = async () => {
    if (!patientToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/patients/${patientToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete patient")
      }

      setPatients(patients.filter((p) => p.id !== patientToDelete.id))
      toast.success("Patient deleted successfully")
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast.error("Failed to delete patient")
    } finally {
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
    }
  }

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Parse tags into array
  const parseTags = (tags) => {
    if (!tags) return []
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-6 md:py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Patients</h1>
              <p className="mt-2 text-muted-foreground">Manage your patient records and dental documentation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => navigate("/add-patient")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                {filteredPatients.length} of {patients.length} patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name, ID, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">
                              {searchTerm ? "No patients found matching your search" : "No patients found"}
                            </p>
                            {!searchTerm && (
                              <Button onClick={() => navigate("/add-patient")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Patient
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                DOB: {format(new Date(patient.dob), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{patient.unique_id}</code>
                          </TableCell>
                          <TableCell>{calculateAge(patient.dob)} years</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {parseTags(patient.tags).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{patient.file_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{format(new Date(patient.created_at), "MMM dd, yyyy")}</div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPatient(patient)
                                    setViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/edit-patient/${patient.id}`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPatientToDelete(patient)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record for{" "}
              <strong>{patientToDelete?.name}</strong> and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Patient Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete information for {selectedPatient?.name}</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                  <p className="text-sm font-mono">{selectedPatient.unique_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="text-sm">{format(new Date(selectedPatient.dob), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p className="text-sm">{calculateAge(selectedPatient.dob)} years old</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{format(new Date(selectedPatient.created_at), "MMM dd, yyyy 'at' h:mm a")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{format(new Date(selectedPatient.updated_at), "MMM dd, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              {selectedPatient.tags && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseTags(selectedPatient.tags).map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Clinical Notes</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedPatient.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  const token = localStorage.getItem("token")
                  if (!token || !selectedPatient?.id) return
                  const url = `http://localhost:5000/api/files/download-all/${selectedPatient.id}`

                  fetch(url, {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Failed to download files")
                      return res.blob()
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(new Blob([blob]))
                      const link = document.createElement("a")
                      link.href = url
                      link.setAttribute("download", `patient_${selectedPatient.id}_files.zip`)
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                    })
                    .catch(() => toast.error("Failed to download patient files"))
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Files
              </Button>

              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>

              <Button
                onClick={() => {
                  setViewDialogOpen(false)
                  navigate(`/edit-patient/${selectedPatient.id}`)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}