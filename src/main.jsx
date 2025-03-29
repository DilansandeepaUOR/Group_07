"use client"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Sidebar, { SidebarItem } from "./sidebar.jsx"
import Header from "./header.jsx" // Import the Header component
import DashboardSection from "./components/dashboard.jsx"
import { Receipt, BarChart3, LayoutDashboard, Bell } from "lucide-react"
import React from "react"

function App() {
  // State for mobile detection
  const [isMobile, setIsMobile] = React.useState(false)

  // Effect to handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert />
        <SidebarItem icon={<Receipt size={20} />} text="Inventory" />
        <SidebarItem icon={<BarChart3 size={20} />} text="Reports" />
        <SidebarItem icon={<Bell size={20} />} text="Notifications" alert />
      </Sidebar>

      {/* Main content area */}
      <div
        style={{
          flexGrow: 1,
          padding: "16px",
          marginLeft: isMobile ? "0" : "72px",
          transition: "all 300ms",
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          {/* Header with search and date/time */}
          <Header />

          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "4px" }}>Dashboard</h1>
          <h6 style={{ fontSize: "1.0rem", fontWeight: "initial", marginTop: "0px", marginBottom: "0px" }}>A Quick Data Overview</h6>

          {/* Dashboard Section */}
          <DashboardSection />
        </div>
      </div>
    </div>
  )
}

// Mount the App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

