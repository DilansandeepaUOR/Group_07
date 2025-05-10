import { ShieldCheck, DollarSign, PillIcon as Capsule, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function DashboardSection() {
  const [medicineCount, setMedicineCount] = useState(0);
  const [medicineGroupCount, setMedicineGroupCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [error, setError] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medicineRes, groupRes, outOfStockResponse, lowStockResponse, custRes, empRes] = await Promise.all([
          fetch('http://localhost:3001/pharmacy/api/medicines/count'),
          fetch('http://localhost:3001/pharmacy/api/medicine-groups/count'),
          fetch('http://localhost:3001/pharmacy/api/medicines/out-of-stock'),
          fetch('http://localhost:3001/pharmacy/api/medicines/low-stock'),
          fetch('http://localhost:3001/pharmacy/api/pet-owner/count'),
          fetch('http://localhost:3001/pharmacy/api/employees/count')
        ]);

        const [medicineData, groupData, outOfStockData, lowStockData, custData, empData] = await Promise.all([
          medicineRes.json(),
          groupRes.json(),
          outOfStockResponse.json(),
          lowStockResponse.json(),
          custRes.json(),
          empRes.json()
        ]);

        setMedicineCount(medicineData.count);
        setMedicineGroupCount(groupData.count);
        setOutOfStockCount(outOfStockData.outOfStock);
        setLowStockCount(lowStockData.lowStock);
        setCustomerCount(custData.count);
        setEmployeeCount(empData.count);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overviewCards = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: loading ? "Loading..." : (lowStockCount >= 10 || outOfStockCount >= 10 ? "Attention Needed" : "All Good"),
      subtitle: "Inventory Status",
      buttonText: "View Detailed Report",
      onClick: () => navigate("/reports"), // Fixed path to lowercase
      status: lowStockCount >= 10 || outOfStockCount >= 10 ? "warning" : "success",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Rs. 8,55,875",
      subtitle: "Revenue - Jan 2022",
      buttonText: "View Detailed Report",
      onClick: () => navigate("/reports"), // Fixed path to lowercase
      status: "revenue",
    },
    {
      icon: <Capsule className="w-8 h-8" />,
      title: loading ? "Loading..." : medicineCount.toString(),
      subtitle: "Medicines Available",
      buttonText: "Visit Inventory",
      onClick: () => navigate("/inventory"),
      status: "info",
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: loading ? "Loading..." : outOfStockCount.toString(),
      subtitle: "Medicine Shortage",
      buttonText: "Resolve Now",
      onClick: () => navigate("/inventory"),
      status: "error",
    }
  ];

  const activityCards = [
    {
      title: "Inventory",
      items: [
        `Number of Medicines: ${loading ? 'Loading...' : medicineCount}`,
        `Medicine Groups: ${loading ? 'Loading...' : medicineGroupCount}`
      ],
      status: "info"
    },
    {
      title: "Quick Reports",
      items: ["Qty of Medicines Sold: 245", "Invoices Generated: 189"],
      status: "revenue"
    },
    {
      title: "Pharmacy Users",
      items: [
        `Total Customers: ${customerCount}`,
        `Total Employees: ${employeeCount}`
      ],
      status: "info"
    },
  ];

  const statusColors = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-500",
      icon: "text-green-500"
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-500",
      icon: "text-yellow-500"
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-500",
      icon: "text-red-500"
    },
    info: {
      bg: "bg-[#71C9CE]",
      text: "text-gray-900",
      border: "border-[#71C9CE]",
      icon: "text-gray-900"
    },
    revenue: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-500",
      icon: "text-yellow-500"
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h1>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 border-t-4 ${statusColors[card.status].border} flex flex-col items-center text-center h-full`}
            >
              <div className={`mb-4 ${statusColors[card.status].icon}`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">
                {card.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {card.subtitle}
              </p>
              <Button
                className={`mt-auto ${
                  card.status === "success" ? "bg-green-100 hover:bg-green-200 text-green-800" :
                  card.status === "warning" ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" :
                  card.status === "error" ? "bg-red-100 hover:bg-red-200 text-red-800" :
                  card.status === "info" ? "bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900" :
                  "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                }`}
                onClick={card.onClick}
              >
                {card.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activityCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 border-l-4 ${statusColors[card.status].border}`}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[card.status].bg}`}></span>
                {card.title}
              </h3>
              <ul className="space-y-3">
                {card.items.map((item, i) => (
                  <li
                    key={i}
                    className="py-2 border-b border-gray-200/50 flex items-center"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusColors[card.status].bg}`}></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}