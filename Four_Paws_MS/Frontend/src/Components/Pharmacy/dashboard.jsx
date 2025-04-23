import { ShieldCheck, DollarSign, PillIcon as Capsule, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

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

  // Color scheme
  const colors = {
    darkBackground: 'rgba(34,41,47,255)',
    tealAccent: 'rgba(59,205,191,255)',
    yellowAccent: '#FFD700',
    lightText: '#f3f4f6',
    darkText: '#111827',
    cardBackground: 'rgba(44,51,57,255)',
    warningRed: '#ef4444',
    successGreen: '#10b981'
  };

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
      icon: (
        <ShieldCheck
          color={lowStockCount >= 10 || outOfStockCount >= 10 ? colors.warningRed : colors.successGreen}
          size={32}
        />
      ),
      title: loading
        ? "Loading..."
        : lowStockCount >= 10 || outOfStockCount >= 10
        ? "Attention Needed"
        : "All Good",
      subtitle: "Inventory Status",
      buttonText: "View Detailed Report",
      onClick: () => navigate("/inventory"),
      bgColor: lowStockCount >= 10 || outOfStockCount >= 10 ? colors.warningRed : colors.successGreen,
      buttonBgColor: lowStockCount >= 10 || outOfStockCount >= 10 ? 
        'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
      buttonTextColor: lowStockCount >= 10 || outOfStockCount >= 10 ? 
        colors.warningRed : colors.successGreen,
    },
    {
      icon: <DollarSign color={colors.yellowAccent} size={32} />,
      title: "Rs. 8,55,875",
      subtitle: "Revenue - Jan 2022",
      buttonText: "View Detailed Report",
      onClick: () => navigate("/reports"),
      bgColor: colors.yellowAccent,
      buttonBgColor: 'rgba(255,215,0,0.2)',
      buttonTextColor: colors.yellowAccent,
    },
    {
      icon: <Capsule color={colors.tealAccent} size={32} />,
      title: loading ? "Loading..." : medicineCount.toString(),
      subtitle: "Medicines Available",
      buttonText: "Visit Inventory",
      onClick: () => navigate("/Inventory.jsx"),
      bgColor: colors.tealAccent,
      buttonBgColor: 'rgba(59,205,191,0.2)',
      buttonTextColor: colors.tealAccent,
    },
    {
      icon: <AlertTriangle color={colors.warningRed} size={32} />,
      title: loading ? "Loading..." : outOfStockCount.toString(),
      subtitle: "Medicine Shortage",
      buttonText: "Resolve Now",
      onClick: () => navigate("/inventory"),
      bgColor: colors.warningRed,
      buttonBgColor: 'rgba(239,68,68,0.2)',
      buttonTextColor: colors.warningRed,
    }
  ];

  const activityCards = [
    {
      title: "Inventory",
      items: [
        `Number of Medicines: ${loading ? 'Loading...' : medicineCount}`,
        `Medicine Groups: ${loading ? 'Loading...' : medicineGroupCount}`
      ],
      iconColor: colors.tealAccent
    },
    {
      title: "Quick Reports",
      items: ["Qty of Medicines Sold: 245", "Invoices Generated: 189"],
      iconColor: colors.yellowAccent
    },
    {
      title: "Pharmacy Users",
      items: [
        `Total Customers: ${customerCount}`,
        `Total Employees: ${employeeCount}`
      ],
      iconColor: colors.tealAccent
    },
  ];

  return (
    <div style={{
      padding: "24px",
      backgroundColor: colors.darkBackground,
      minHeight: "100vh"
    }}>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        marginBottom: "24px",
        color: colors.yellowAccent
      }}>
        Pharmacy Dashboard
      </h1>

      {/* Overview Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {overviewCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: colors.cardBackground,
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              borderTop: `4px solid ${card.bgColor}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "220px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>{card.icon}</div>
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "600", 
              marginBottom: "4px",
              color: colors.lightText
            }}>
              {card.title}
            </h3>
            <p style={{ 
              color: "#9ca3af", 
              fontSize: "0.875rem", 
              marginBottom: "16px"
            }}>
              {card.subtitle}
            </p>
            <button
              onClick={card.onClick}
              style={{
                padding: "8px 16px",
                backgroundColor: card.buttonBgColor,
                color: card.buttonTextColor,
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                ':hover': {
                  opacity: 0.9
                }
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Activity Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "16px",
      }}>
        {activityCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: colors.cardBackground,
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              borderLeft: `4px solid ${card.iconColor}`
            }}
          >
            <h3 style={{ 
              fontWeight: "600", 
              marginBottom: "16px",
              color: colors.lightText,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: card.iconColor
              }}></div>
              {card.title}
            </h3>
            <ul style={{ 
              listStyle: "none", 
              padding: 0,
              color: colors.lightText
            }}>
              {card.items.map((item, i) => (
                <li 
                  key={i} 
                  style={{ 
                    padding: "12px 0", 
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: card.iconColor
                  }}></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}