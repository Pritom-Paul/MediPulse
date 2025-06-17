import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload, X, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { parseISO } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.date({ required_error: "Date of birth is required" }),
  unique_id: z.string(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export function EditPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]); // New state for files
  const [isUploading, setIsUploading] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dob: undefined,
      unique_id: "",
      tags: "",
      notes: "",
    },
  });

  // Dropzone handlers
  const onDropXray = useCallback((acceptedFiles) => {
    console.log("Accepted X-ray files:", acceptedFiles);
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: "xray",
        name: file.name,
        size: file.size
      })),
    ]);
  }, []);

  const onDropPrescription = useCallback((acceptedFiles) => {
    console.log("Accepted Prescription files:", acceptedFiles);
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: "prescription",
        name: file.name,
        size: file.size
      })),
    ]);
  }, []);

  // Setup dropzones
  const xrayDropzone = useDropzone({
    onDrop: onDropXray,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const prescriptionDropzone = useDropzone({
    onDrop: onDropPrescription,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Remove file from state
  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Separate files by type
  const xrayFiles = files.filter(file => file.type === "xray");
  const prescriptionFiles = files.filter(file => file.type === "prescription");

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch patient");

        const data = await res.json();
        form.reset({
          name: data.name,
          dob: parseISO(data.dob),
          unique_id: data.unique_id,
          tags: data.tags || "",
          notes: data.notes || "",
        });

        // Fetch patient files
        const filesRes = await fetch(`http://localhost:5000/api/files/list/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!filesRes.ok) throw new Error("Failed to fetch patient files");

        const filesData = await filesRes.json();
        setExistingFiles(filesData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load patient details");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, form]);

  const handleDeleteExistingFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/files/delete/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete file");
      }

      setExistingFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success("File deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    }
  };
  const onSubmit = async (values) => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formattedValues = {
        ...values,
        dob: format(values.dob, "yyyy-MM-dd"),
      };

      // Update patient info
      const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) throw new Error("Update failed");

      // Upload new files if any
      if (files.length > 0) {
        const fileUploadToast = toast.loading(`Uploading ${files.length} file(s)...`);
        let successfulUploads = 0;

        for (const fileObj of files) {
          try {
            const formData = new FormData();
            formData.append("file", fileObj.file);
            formData.append("file_type", fileObj.type);

            const uploadResponse = await fetch(
              `http://localhost:5000/api/files/upload/${id}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              toast.error(`Failed to upload ${fileObj.name}`);
              continue;
            }

            successfulUploads++;
          } catch (error) {
            toast.error(`Error uploading ${fileObj.name}`);
          }
        }
        
        toast.dismiss(fileUploadToast);
        if (successfulUploads > 0) {
          toast.success(`Uploaded ${successfulUploads} file(s) successfully`);
        }
      }

      toast.success("Patient record updated!");
      navigate("/patients");
    } catch (err) {
      console.error(err);
      toast.error("Could not update patient.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading patient info...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Edit Patient</h1>
            <p className="mt-2 text-muted-foreground md:text-lg max-w-md mx-auto">
              Update patient details and clinical notes.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Edit Patient Information</CardTitle>
              <CardDescription>Make changes and save to update the record.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <div className="relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  type="button"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                                  }}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unique_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient ID</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="bg-muted" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Root Canal, Pediatric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinical Notes</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {existingFiles.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-medium">Existing Files</h4>
                      <ul className="space-y-2">
                        {existingFiles.map((file) => (
                          <li
                            key={file.id}
                            className="flex items-center justify-between p-2 border rounded-md bg-muted/20"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.filename || file.file_path.split("/").pop()}</span>
                              <span className="text-xs text-muted-foreground">{file.file_type}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteExistingFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add file dropzone sections */}
                  <div className="space-y-6">
                    <div>
                      <FormLabel>X-ray Images</FormLabel>
                      <div
                        {...xrayDropzone.getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                          xrayDropzone.isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <input {...xrayDropzone.getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {xrayDropzone.isDragActive
                              ? "Drop the X-ray images here"
                              : "Drag & drop X-ray images here, or click to select files"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG (max 10MB each)
                          </p>
                        </div>
                      </div>

                      {xrayFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium">New X-rays to Add</h4>
                          <ul className="space-y-2">
                            {xrayFiles.map((fileObj, index) => (
                              <li
                                key={fileObj.name}
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{fileObj.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    (X-ray)
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(fileObj.size / 1024)} KB
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeFile(files.findIndex(f => f.name === fileObj.name))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel>Prescriptions & Documents</FormLabel>
                      <div
                        {...prescriptionDropzone.getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                          prescriptionDropzone.isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <input {...prescriptionDropzone.getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {prescriptionDropzone.isDragActive
                              ? "Drop the documents here"
                              : "Drag & drop prescriptions, reports, or documents here, or click to select files"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG, PDF (max 10MB each)
                          </p>
                        </div>
                      </div>

                      {prescriptionFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium">New Documents to Add</h4>
                          <ul className="space-y-2">
                            {prescriptionFiles.map((fileObj, index) => (
                              <li
                                key={fileObj.name}
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{fileObj.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    (Document)
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(fileObj.size / 1024)} KB
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeFile(files.findIndex(f => f.name === fileObj.name))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isUploading}
                    >
                      {isUploading ? "Updating..." : "Update Patient"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}