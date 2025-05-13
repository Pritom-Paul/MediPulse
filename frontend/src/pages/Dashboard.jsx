// Dashboard.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FilePlus, Users, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

export function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Doctor Dashboard</h1>
            <p className="mt-3 text-muted-foreground md:text-lg max-w-[600px] mx-auto">
              Manage patients and records efficiently from your personalized dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/patients">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>View Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Browse and manage your current patient list and their records.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/add-files">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <FilePlus className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Add Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Upload lab reports, prescriptions, or other relevant patient files.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/add-patient">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <UserPlus className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Add Patient</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Register a new patient and start documenting their medical journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

