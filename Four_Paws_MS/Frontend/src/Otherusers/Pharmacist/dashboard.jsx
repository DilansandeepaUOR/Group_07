import { ShieldCheck, DollarSign, PillIcon as Capsule, AlertTriangle } from "lucide-react";

export default function DashboardSection() {
  const overviewCards = [
    {
      icon: <ShieldCheck color="#16a34a" size={32} />,
      title: "Good",
      subtitle: "Inventory Status",
      buttonText: "View Detailed Report",
      bgColor: "#4ade80",
      buttonBgColor: "#dcfce7",
      buttonTextColor: "#15803d",
    },
    {
      icon: <DollarSign color="#ca8a04" size={32} />,
      title: "Rs. 8,55,875",
      subtitle: "Revenue - Jan 2022",
      buttonText: "View Detailed Report",
      bgColor: "#facc15",
      buttonBgColor: "#fef9c3",
      buttonTextColor: "#a16207",
    },
    {
      icon: <Capsule color="#2563eb" size={32} />,
      title: "298",
      subtitle: "Medicines Available",
      buttonText: "Visit Inventory",
      bgColor: "#60a5fa",
      buttonBgColor: "#dbeafe",
      buttonTextColor: "#1d4ed8",
    },
    {
      icon: <AlertTriangle color="#dc2626" size={32} />,
      title: "01",
      subtitle: "Medicine Shortage",
      buttonText: "Resolve Now",
      bgColor: "#f87171",
      buttonBgColor: "#fee2e2",
      buttonTextColor: "#b91c1c",
    },
  ];

  const activityCards = [
    {
      title: "Inventory",
      items:["Number of Medicines: 298", "Medicine Groups: 12"],
      buttonText: "Go to Inventory",
    },
    {
      title: "Quick Reports",
      items: ["Qty of Medicines Sold: 245", "Invoices Generated: 189"],
      buttonText: "View All Reports",
    },
    {
      title: "My Pharmacy",
      items: ["Total Number of Customers: 120", "Total Number of Suppliers: 15"],
      buttonText: "View All Products",
    },
    
  ];

  return (
    <>
      <div
        data-section="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginTop: "16px",
          marginBottom: "24px",
        }}
      >
        {overviewCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              borderTop: `5px solid ${card.bgColor}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "200px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>{card.icon}</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "2px" }}>{card.title}</h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "12px" }}>{card.subtitle}</p>
            <button
              style={{
                padding: "8px 12px",
                backgroundColor: card.buttonBgColor,
                color: card.buttonTextColor,
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div
        data-section="activity-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {activityCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "12px" }}>{card.title}</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {card.items.map((item, i) => (
                <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>{item}</li>
              ))}
            </ul>
            <button
              style={{
                marginTop: "12px",
                padding: "6px 12px",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
