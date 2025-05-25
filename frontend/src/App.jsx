import { ThemeProvider } from "@/components/theme-provider"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import {AddPatient} from "@/pages/AddPatient"
import { PatientsPage } from "./pages/PatientsPage" 
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="medirecord-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patients" element={<PatientsPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
