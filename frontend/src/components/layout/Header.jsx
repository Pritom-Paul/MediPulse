import { Link } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

export function Header() {
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
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </a>
            {/* <Link to="#cta" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link> */}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}