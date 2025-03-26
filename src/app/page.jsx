"use client"

import React from "react"
import Sidebar, { SidebarItem } from "../sidebar"
import { LayoutDashboard, BarChart3, UsersRound, Settings, HelpCircle, Package, Search, Bell } from "lucide-react"

export default function Home() {
  // Detect if we're on mobile for responsive layout
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div style={{ display: "flex" }}>
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
        <SidebarItem icon={<BarChart3 size={20} />} text="Statistics" />
        <SidebarItem icon={<UsersRound size={20} />} text="Users" alert />
        <SidebarItem icon={<Package size={20} />} text="Products" />
        <SidebarItem icon={<Search size={20} />} text="Search" />
        <SidebarItem icon={<Bell size={20} />} text="Notifications" alert />
        
      </Sidebar>
      <main
        style={{
          flexGrow: 1,
          padding: "16px",
          marginLeft: isMobile ? "0" : "72px",
          transition: "all 300ms",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Dashboard</h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : window.innerWidth >= 1024 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
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
      </main>
    </div>
  )
}

