"use client"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Sidebar, { SidebarItem, SidebarSubItem } from "./sidebar.jsx"
import Header from "./header.jsx"
import DashboardSection from "../../Components/Pharmacy/dashboard.jsx"
import MedicineListSection from "../../Components/Pharmacy/Inventory.jsx"
import MedicineGroupSection from "../../Components/Pharmacy/MedicineGroup.jsx"
import ReportsSection from "../../Components/Pharmacy/Reports.jsx"
import NotificationsSection from "../../Components/Pharmacy/Notifications.jsx"

import { Receipt, BarChart3, LayoutDashboard, Bell } from "lucide-react"
import React, { useState, useEffect } from "react"

const Pharmacy = () => {
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
    <div className="flex h-screen w-full bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2]">
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
          onSectionChange={() => setActiveSection("medicine-list")}
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
        className="flex-grow p-4 overflow-y-auto transition-all duration-300"
        style={{
          marginLeft: isMobile ? "0" : "72px",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 mt-4">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}

if (typeof document !== "undefined") {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Pharmacy />
    </StrictMode>
  )
}

export default Pharmacy