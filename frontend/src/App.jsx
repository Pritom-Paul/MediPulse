import { ThemeProvider } from "@/components/theme-provider"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="medirecord-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
