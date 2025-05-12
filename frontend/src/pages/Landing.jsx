import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FileText, Lock, Tag, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container mx-auto px-4 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Streamline Patient Records Management
              </h1>
              <p className="text-muted-foreground md:text-xl">
                A secure, efficient, and user-friendly platform for healthcare professionals to manage patient records
                with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to="/login">
                    <Button size="lg">Login</Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-secondary/20 to-muted border shadow-xl w-full max-w-[500px] flex items-center justify-center p-8">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="Patient Record Management"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                Everything you need to efficiently manage patient records in one place
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <UserPlus className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Patient CRUD</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create, read, update, and delete patient records with an intuitive interface.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <FileText className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>File Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easily upload and manage medical documents, test results, and images.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Lock className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Secure Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Role-based access control ensures data is only accessible to authorized personnel.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Tag className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Hospital Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Organize records by department, condition, or custom categories with tags.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-[600px] mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to get started?</h2>
              <p className="text-muted-foreground">
                Join thousands of healthcare professionals already using PulseRecords to streamline their patient
                management.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Button size="lg">Request Demo</Button>
                <Button size="lg" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
