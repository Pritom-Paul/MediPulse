import { Link, useNavigate } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { useEffect, useState } from "react"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    // Redirect to home page or login page
    navigate('/')
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          PulseRecords
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#cta" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </a>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
            )}
          </nav>
          <ThemeToggle />
        </div>  
      </div>
    </header>
  )
}