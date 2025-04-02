"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Update date/time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(timer)
    }
  }, [])

  // Format the date and time
  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        marginBottom: "24px",
        gap: "16px",
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        width: "100%",
      }}
    >
      {/* Search Bar */}
      <div style={{ position: "relative", flex: "1" }}>
        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
          <Search size={20} color="#9ca3af" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 40px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            fontSize: "0.875rem",
          }}
        />
      </div>

      {/* Date and Time */}
      <div style={{ textAlign: isMobile ? "left" : "right", minWidth: isMobile ? "auto" : "200px" }}>
        <div style={{ fontWeight: "600", color: "#111827" }}>{formattedDate}</div>
        <div style={{ color: "#4b5563" }}>{formattedTime}</div>
      </div>
    </div>
  )
}

