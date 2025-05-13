"use client"

import React, { useContext, createContext, useState, useEffect } from "react"
import { MoreVertical, ChevronLast, ChevronFirst, Menu, X, ChevronDown } from "lucide-react"
import axios from "axios";



const SidebarContext = createContext({ 
  expanded: true, 
  isMobile: false,
  activeSection: "",
  setActiveSection: () => {}
})

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pharmuser, setpharmUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/admins", { withCredentials: true })
      .then((response) => {
        setpharmUser(response.data);
      })
      .catch(() => {
        setpharmUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3001/api/auth/logout", {
        withCredentials: true,
      });
      alert("Logged out!");
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile && expanded) {
        setExpanded(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [expanded])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setExpanded((prev) => !prev)
      if (expanded) {
        setActiveSection("")
      }
    }
  }

  return (
    <React.Fragment>
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 40,
          }}
        />
      )}

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
            backgroundColor: colors.cardBackground,
            color: colors.lightText,
            border: `1px solid ${colors.tealAccent}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          }}
        >
          {mobileOpen ? <X size={20} color={colors.tealAccent} /> : <Menu size={20} color={colors.tealAccent} />}
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
          zIndex: isMobile ? 50 : "auto",
          width: "auto",
          background: "linear-gradient(to bottom, #E0F7FA, #B2EBF2)",
        }}
      >
        <nav
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.darkBackground,
            borderRight: `1px solid ${colors.tealAccent}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            width: isMobile ? "280px" : expanded ? "240px" : "72px",
            transition: "width 300ms",
          }}
        >
          <div
            style={{
              padding: "16px",
              paddingBottom: "8px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.tealAccent}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {expanded ? (
                  <ChevronFirst size={18} color={colors.tealAccent} />
                ) : (
                  <ChevronLast size={18} color={colors.tealAccent} />
                )}
              </button>
            )}
          </div>

          <SidebarContext.Provider value={{ 
            expanded: isMobile ? true : expanded, 
            isMobile,
            activeSection,
            setActiveSection
          }}>
            <ul style={{ 
              flex: 1, 
              padding: "0 12px",
              overflowY: "auto",
              overflowX: "hidden",
              margin: 0,
            }}>
              {children}
            </ul>
          </SidebarContext.Provider>

          <div
            style={{
              borderTop: `1px solid ${colors.tealAccent}`,
              display: "flex",
              padding: "12px",
            }}
          >
            <img
              src="https://ui-avatars.com/api/?background=3bcdbf&color=ffffff&bold=true"
              alt="User avatar"
              style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "6px",
                border: `1px solid ${colors.tealAccent}`
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                overflow: "hidden",
                transition: "all 300ms",
                width: expanded || isMobile ? "calc(100% - 52px)" : "0",
                marginLeft: expanded || isMobile ? "12px" : "0",
                color: colors.lightText
              }}
            >
              <div style={{ lineHeight: "1rem" }}>
                <h4 style={{ fontWeight: "600", color: "#4b5563" }}>{pharmuser?.fname} {pharmuser?.lname}</h4>
                <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>{pharmuser?.email}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 150ms",
                  }}
                >
                  <a href="/Adlogin">Logout</a>
                </button>
              </div>
              <MoreVertical size={20} color={colors.tealAccent} />
            </div>
          </div>
        </nav>
      </aside>
    </React.Fragment>
  )
}

export function SidebarItem({ icon, text, active, children, section, onSectionChange }) {
  const { expanded, isMobile, activeSection, setActiveSection } = useContext(SidebarContext)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const colors = {
    darkBackground: '#22292f',
    tealAccent: '#3bcdbf',
    yellowAccent: '#FFD700',
    lightText: '#f3f4f6',
    cardBackground: '#2c3339'
  };

  useEffect(() => {
    if (!expanded && !isMobile) {
      setIsOpen(false)
    }
  }, [expanded, isMobile])

  const handleClick = () => {
    if (children) {
      setIsOpen(!isOpen)
      setActiveSection(isOpen ? "" : section)
    } else if (section) {
      setActiveSection(section)
      if (onSectionChange) {
        onSectionChange(section)
      }
    }
  }

  return (
    <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "12px",
          margin: "4px 0",
          fontWeight: "500",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 150ms",
          backgroundColor: active ? colors.cardBackground : "transparent",
          color: active ? colors.yellowAccent : colors.lightText,
          border: active ? `1px solid ${colors.tealAccent}` : "none",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {icon && React.cloneElement(icon, { 
          color: active ? colors.yellowAccent : colors.tealAccent,
          size: 20 
        })}
        <span
          style={{
            overflow: "hidden",
            transition: "all 300ms",
            width: expanded || isMobile ? "calc(100% - 40px)" : "0",
            marginLeft: expanded || isMobile ? "12px" : "0",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
        {children && (
          <ChevronDown
            size={16}
            color={active ? colors.yellowAccent : colors.tealAccent}
            style={{
              marginLeft: "auto",
              transition: "transform 200ms",
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        )}

        {!expanded && !isMobile && isHovered && !children && (
          <div
            style={{
              position: "absolute",
              left: "100%",
              borderRadius: "6px",
              padding: "8px 12px",
              marginLeft: "12px",
              backgroundColor: colors.cardBackground,
              color: colors.yellowAccent,
              fontSize: "0.875rem",
              zIndex: 10,
              border: `1px solid ${colors.tealAccent}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {text}
          </div>
        )}
      </div>
      {children && (
        <div
          style={{
            overflow: "hidden",
            maxHeight: isOpen ? "500px" : "0",
            transition: "max-height 200ms ease-in-out",
            paddingLeft: expanded || isMobile ? "24px" : "12px",
          }}
        >
          {children}
        </div>
      )}
    </li>
  )
}

export function SidebarSubItem({ text, active, section, onSectionChange }) {
  const { expanded, isMobile, setActiveSection } = useContext(SidebarContext)
  
  const colors = {
    darkBackground: '#22292f',
    tealAccent: '#3bcdbf',
    yellowAccent: '#FFD700',
    lightText: '#f3f4f6',
    cardBackground: '#2c3339'
  };

  const handleClick = () => {
    setActiveSection(section)
    if (onSectionChange) {
      onSectionChange(section)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        margin: "4px 0",
        fontWeight: "500",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 150ms",
        backgroundColor: active ? colors.cardBackground : "transparent",
        color: active ? colors.yellowAccent : colors.lightText,
        border: active ? `1px solid ${colors.tealAccent}` : "none",
        fontSize: "0.875rem",
      }}
      onClick={handleClick}
    >
      {text}
    </div>
  )
}