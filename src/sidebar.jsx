"use client"

import { useContext, createContext, useState, useEffect } from "react"
import { MoreVertical, ChevronLast, ChevronFirst, Menu, X } from "lucide-react"

// Simple utility to join classnames
function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const SidebarContext = createContext({ expanded: true, isMobile: false })

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Auto-collapse on smaller screens
      if (mobile && expanded) {
        setExpanded(false)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [expanded])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setExpanded((prev) => !prev)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 50,
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <aside
        style={{
          height: "100vh",
          transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 300ms ease-in-out",
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? "0" : "auto",
          left: isMobile ? "0" : "auto",
          zIndex: isMobile ? "50" : "auto",
        }}
      >
        <nav
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRight: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            width: isMobile ? "280px" : "auto",
          }}
        >
          <div
            style={{
              padding: "16px",
              paddingBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <img
              src="https://img.logoipsum.com/243.svg"
              style={{
                overflow: "hidden",
                transition: "all 300ms",
                width: expanded || isMobile ? "128px" : "0",
              }}
              alt="Logo"
            />
            {!isMobile && (
              <button
                onClick={() => setExpanded((curr) => !curr)}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                }}
              >
                {expanded ? <ChevronFirst /> : <ChevronLast />}
              </button>
            )}
          </div>

          <SidebarContext.Provider value={{ expanded: isMobile ? true : expanded, isMobile }}>
            <ul style={{ flexGrow: 1, padding: "0 12px" }}>{children}</ul>
          </SidebarContext.Provider>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              padding: "12px",
            }}
          >
            <img
              src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
              alt="User avatar"
              style={{ width: "40px", height: "40px", borderRadius: "6px" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                overflow: "hidden",
                transition: "all 300ms",
                width: expanded || isMobile ? "208px" : "0",
                marginLeft: expanded || isMobile ? "12px" : "0",
              }}
            >
              <div style={{ lineHeight: "1rem" }}>
                <h4 style={{ fontWeight: "600" }}>John Doe</h4>
                <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>johndoe@gmail.com</span>
              </div>
              <MoreVertical size={20} />
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

export function SidebarItem({ icon, text, active, alert }) {
  const { expanded, isMobile } = useContext(SidebarContext)

  const [isHovered, setIsHovered] = useState(false)

  return (
    <li
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        margin: "4px 0",
        fontWeight: "500",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "background-color 150ms",
        backgroundColor: active ? "#e0e7ff" : "transparent",
        color: active ? "#3730a3" : "#4b5563",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon}
      <span
        style={{
          overflow: "hidden",
          transition: "all 300ms",
          width: expanded || isMobile ? "208px" : "0",
          marginLeft: expanded || isMobile ? "12px" : "0",
        }}
      >
        {text}
      </span>
      {alert && (
        <div
          style={{
            position: "absolute",
            right: "8px",
            top: expanded ? "auto" : "8px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#818cf8",
          }}
        />
      )}

      {!expanded && !isMobile && isHovered && (
        <div
          style={{
            position: "absolute",
            left: "100%",
            borderRadius: "6px",
            padding: "4px 8px",
            marginLeft: "24px",
            backgroundColor: "#e0e7ff",
            color: "#3730a3",
            fontSize: "0.875rem",
            zIndex: 10,
          }}
        >
          {text}
        </div>
      )}
    </li>
  )
}

