"use client"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Sidebar, { SidebarItem, SidebarSubItem } from "./sidebar.jsx"
import Header from "./header.jsx"
import DashboardSection from "./components/dashboard.jsx"
import ProductsSection from "./components/Inventory.jsx" // Import the ProductsSection
import { Receipt, BarChart3, LayoutDashboard, Bell } from "lucide-react"
import React, { useState, useEffect } from "react"

// Placeholder components for other sections
const ReportsSection = () => <div>Reports Section</div>
const NotificationsSection = () => <div>Notifications Section</div>

const App = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />
      case "medicine-list":
      case "medicine-group":
        return <ProductsSection activeTab={activeSection} />
      case "reports":
        return <ReportsSection />
      case "notifications":
        return <NotificationsSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activeSection === "dashboard"}
          alert={activeSection !== "dashboard"}
          onSectionChange={setActiveSection}
          section="dashboard"
        />

        <SidebarItem
          icon={<Receipt size={20} />}
          text="Inventory"
          active={activeSection === "medicine-list" || activeSection === "medicine-group"}
          onSectionChange={() => setActiveSection("medicine-list")} // Default to medicine-list when parent clicked
        >
          <SidebarSubItem
            text="Medicine List"
            section="medicine-list"
            active={activeSection === "medicine-list"}
            onSectionChange={setActiveSection}
          />
          <SidebarSubItem
            text="Medicine Group"
            section="medicine-group"
            active={activeSection === "medicine-group"}
            onSectionChange={setActiveSection}
          />
        </SidebarItem>

        <SidebarItem
          icon={<BarChart3 size={20} />}
          text="Reports"
          active={activeSection === "reports"}
          onSectionChange={setActiveSection}
          section="reports"
        />

        <SidebarItem
          icon={<Bell size={20} />}
          text="Notifications"
          active={activeSection === "notifications"}
          alert={activeSection !== "notifications"}
          onSectionChange={setActiveSection}
          section="notifications"
        />
      </Sidebar>

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
          <Header />

          {activeSection === "dashboard" && (
            <>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "4px" }}>Dashboard</h1>
              <h6 style={{ fontSize: "1.0rem", fontWeight: "initial", marginTop: "0px", marginBottom: "0px" }}>
                A Quick Data Overview
              </h6>
            </>
          )}

          {renderSection()}
        </div>
      </div>
    </div>
  )
}

// Only render if we're in the browser
if (typeof document !== "undefined") {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

export default App