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
        alignItems: "center",
        marginBottom: "24px",
        gap: "16px",
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        width: "100%",
      }}
    >
      {/* Date and Time Container */}
      <div 
        style={{ 
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "4px" : "24px",
          flex: 1,
          minWidth: isMobile ? "100%" : "auto",
        }}
      >
        <div style={{ fontWeight: "600", color: "#111827", whiteSpace: "nowrap" }}>
          {formattedDate}
        </div>
        <div style={{ color: "#4b5563", whiteSpace: "nowrap" }}>
          {formattedTime}
        </div>
      </div>

      {/* Search bar would go here */}
    </div>
  )
}

