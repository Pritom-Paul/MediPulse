import { ThemeProvider } from "@/components/theme-provider"
import { Landing } from "@/pages/Landing"
import { BrowserRouter } from "react-router-dom"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="pulserecords-theme">
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
