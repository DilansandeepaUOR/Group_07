"use client"

import { useState, useEffect } from "react"
import Sidebar, { SidebarItem, SidebarSubItem } from "../sidebar"
import { LayoutDashboard, BarChart3, DollarSign, Bell, ChevronDown } from "lucide-react"
import Header from "../header"
import DashboardSection from "../../Components/Pharmacy/dashboard.jsx"
import ReportsSection from "../../Components/Pharmacy/Reports.jsx"
import NotificationsSection from "../../Components/Pharmacy/Notifications.jsx"

// Placeholder components for other sections

function NotificationsSection() {
  return <div>Notifications Section</div>
}

function MedicineListSection() {
  return <div>Medicine List Section</div>
}

function MedicineGroupSection() {
  return <div>Medicine Group Section</div>
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

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
        return <MedicineListSection />
      case "medicine-group":
        return <MedicineGroupSection />
      case "reports":
        return <ReportsSection />
      case "notifications":
        return <NotificationsSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activeSection === "dashboard"}
          onSectionChange={setActiveSection}
          section="dashboard"
        />

        <SidebarItem
          icon={<DollarSign size={20} />}
          text="Inventory"
          active={activeSection === "medicine-list" || activeSection === "medicine-group"}
          onSectionChange={setActiveSection}
        >
          <SidebarSubItem
            text="List Of Medicine"
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
          onSectionChange={setActiveSection}
          section="notifications"
        />
      </Sidebar>

      <main
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
          {renderSection()}
        </div>
      </main>
    </div>
  )
}