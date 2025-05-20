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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  unique_id: z.string().min(3, {
    message: "Patient ID must be at least 3 characters.",
  }),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export function AddPatient() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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

  const removeFile = (index) => {
    console.log("Removing file at index:", index);
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const onSubmit = async (values) => {
    console.log("Form values:", values);
    console.log("Files to upload:", files);

    // Format date to string for API request
    const formattedValues = {
      ...values,
      dob: format(values.dob, "yyyy-MM-dd"),
    };

    setIsUploading(true);
    try {
      const loadingToast = toast.loading('Creating patient record...');
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const patientResponse = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!patientResponse.ok) {
        const errorData = await patientResponse.json();
        console.error("Patient creation error:", errorData);
        throw new Error(errorData.error || "Failed to create patient record");
      }

      const patientData = await patientResponse.json();
      const patientId = patientData.id;
      console.log("Patient created with ID:", patientId);
      
      toast.dismiss(loadingToast);
      toast.success('Patient record created successfully!');

      if (files.length > 0) {
        console.log("Starting file uploads...");
        const fileUploadToast = toast.loading(`Uploading ${files.length} file(s)...`);
        
        let successfulUploads = 0;
        
        for (const fileObj of files) {
          try {
            const formData = new FormData();
            formData.append("file", fileObj.file);
            formData.append("file_type", fileObj.type);

            console.log(`Uploading ${fileObj.name} as ${fileObj.type}`);

            const uploadResponse = await fetch(
              `http://localhost:5000/api/files/upload/${patientId}`,
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
              console.error(`File upload error for ${fileObj.name}:`, errorData);
              toast.error(`Failed to upload ${fileObj.name}`);
              continue;
            }

            successfulUploads++;
            toast.success(`Uploaded ${fileObj.name} successfully`);
          } catch (error) {
            console.error(`Error uploading ${fileObj.name}:`, error);
            toast.error(`Error uploading ${fileObj.name}`);
          }
        }
        
        toast.dismiss(fileUploadToast);
        if (successfulUploads === files.length) {
          toast.success('All files uploaded successfully!');
        } else {
          toast.warning(`Uploaded ${successfulUploads} of ${files.length} files`);
        }
      }

      form.reset();
      setFiles([]);
    } catch (error) {
      console.error("Error in patient creation or file upload:", error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Separate files by type for display
  const xrayFiles = files.filter(file => file.type === "xray");
  const prescriptionFiles = files.filter(file => file.type === "prescription");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Add New Patient
            </h1>
            <p className="mt-3 text-muted-foreground md:text-lg max-w-[600px] mx-auto">
              Register a new patient and document their dental records.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Fill in the patient details and upload relevant documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Form fields remain the same */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <Input placeholder="DENT-001" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for the patient
                          </FormDescription>
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
                            <Input
                              placeholder="e.g., Ortho, Implant, Pediatric"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated tags for easy categorization
                          </FormDescription>
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
                          <Textarea
                            placeholder="Enter clinical observations, treatment plans, or other relevant notes..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include any relevant dental history or current concerns
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <h4 className="text-sm font-medium">Selected X-rays</h4>
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
                          <h4 className="text-sm font-medium">Selected Documents</h4>
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
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? "Saving..." : "Save Patient Record"}
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