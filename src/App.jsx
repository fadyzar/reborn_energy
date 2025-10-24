import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "next-themes"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Pages />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 