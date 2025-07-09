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
import NotificationsSection from "../../Otherusers/Pharmacist/Notifications.jsx"
import BillsSection from "../../Otherusers/Pharmacist/Bills.jsx"

import { Receipt, BarChart3, LayoutDashboard, Bell, FileText } from "lucide-react"
import React, { useState, useEffect } from "react"
import axios from "axios"

const Pharmacy = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3001/pharmacy/api/notifications');
      setNotifications(response.data);
      const unreadCount = response.data.filter(n => !n.is_read).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/pharmacy/api/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:3001/pharmacy/api/notifications/mark-all-read');
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

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
        return <NotificationsSection 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={fetchNotifications}
        />
      case "bills":
        return <BillsSection />
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
          icon={<FileText size={20} />}
          text="Bills"
          active={activeSection === "bills"}
          onSectionChange={setActiveSection}
          section="bills"
        />

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
          alert={unreadNotifications > 0}
          badge={unreadNotifications > 0 ? unreadNotifications : null}
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