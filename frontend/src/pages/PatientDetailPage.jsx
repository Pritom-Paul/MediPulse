"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate, useParams } from "react-router-dom"
import { Download, Edit, ChevronLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function PatientDetailPage() {
  const [patient, setPatient] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  // Helper function to extract filename from path
  const getFileNameFromPath = (path) => {
    if (!path) return "Untitled";
    return path.split('/').pop() || path.split('\\').pop() || "Untitled";
  }

  useEffect(() => {
    const fetchToken = () => {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        toast.error("Authentication token missing")
        navigate("/login")
        return null
      }
      return storedToken
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const authToken = fetchToken()
        if (!authToken) return
        setToken(authToken)

        // Fetch patient details
        const patientResponse = await fetch(`http://localhost:5000/api/patients/${id}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        })
        
        if (!patientResponse.ok) {
          throw new Error("Failed to fetch patient details")
        }
        
        const patientData = await patientResponse.json()
        setPatient(patientData)
        
        // Fetch patient files
        const filesResponse = await fetch(`http://localhost:5000/api/files/list/${id}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        })
        
        if (!filesResponse.ok) {
          throw new Error("Failed to fetch patient files")
        }
        
        const filesData = await filesResponse.json()
        setFiles(filesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id, navigate])

  // Create authenticated file URLs with proper headers
  const getAuthenticatedFileUrl = async (fileId) => {
    if (!token) return "#";
    
    try {
      // Fetch the file with authorization headers
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      
      // Create a blob URL for the file
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating file URL:", error);
      return "#";
    }
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{patient?.name || "N/A"}</CardTitle>
                  <CardDescription>
                    Patient ID: {patient?.unique_id || "N/A"}
                  </CardDescription>
                </div>
                <Button onClick={() => navigate(`/edit-patient/${id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                  <p>{formatDate(patient?.dob)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {patient?.tags?.split(',').filter(tag => tag.trim()).map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="whitespace-pre-line">{patient?.notes || "No notes available"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Files</CardTitle>
              <CardDescription>
                {files.length} document{files.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {files.length === 0 ? (
                <p className="text-muted-foreground">No files available</p>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{file.filename || getFileNameFromPath(file.file_path)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {file.file_type} • {formatDate(file.uploaded_at || file.upload_date)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            const url = await getAuthenticatedFileUrl(file.id);
                            window.open(url, '_blank');
                          } catch (error) {
                            toast.error("Failed to download file");
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="h-96">
                        {file.file_type === 'pdf' || (file.file_path && file.file_path.endsWith('.pdf')) ? (
                            <iframe 
                            src={`http://localhost:5000/api/files/download/${file.id}?token=${encodeURIComponent(token)}`}
                            className="w-full h-full border-t"
                            title={file.filename || getFileNameFromPath(file.file_path)}
                            />
                        ) : (
                            <img
                            src={`http://localhost:5000/api/files/download/${file.id}?token=${encodeURIComponent(token)}`}
                            alt={file.filename || getFileNameFromPath(file.file_path)}
                            className="w-full h-full object-contain bg-white border-t"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = '/image-placeholder.png';
                            }}
                            />
                        )}
                        </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}