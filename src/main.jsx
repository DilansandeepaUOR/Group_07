import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Sidebar, { SidebarItem } from './sidebar.jsx'; 
import { LifeBuoy, Receipt, BarChart3, LayoutDashboard , Bell } from "lucide-react"; // ✅ FIXED ICON NAME

function App() {
  return (
    <div className="flex">
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert />
        <SidebarItem icon={<Receipt size={20} />} text="Inventory" />
        <SidebarItem icon={<BarChart3 size={20} />} text="Reports" />
        <SidebarItem icon={<Bell size={20} />} text="Notifications" alert/>
        
      </Sidebar>
    </div>
  );
}

// Mount the App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
