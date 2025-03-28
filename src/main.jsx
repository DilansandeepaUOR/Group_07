"use client"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Sidebar, { SidebarItem } from "./sidebar.jsx"
import Header from "./header.jsx" // Import the Header component
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

          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Dashboard</h1>

          {/* Content cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                style={{
                  backgroundColor: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                }}
              >
                <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>Card {item}</h2>
                <p style={{ color: "#4b5563" }}>This is a sample card for the dashboard.</p>
              </div>
            ))}
          </div>
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

